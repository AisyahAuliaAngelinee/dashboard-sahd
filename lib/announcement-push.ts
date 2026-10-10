import 'server-only';
import webpush from 'web-push';
import {createClient} from '@supabase/supabase-js';
import {validPushSubscription} from './push-validation';
type Job={job_id:string;subscription_id:string;endpoint:string;keys:{p256dh:string;auth:string};title:string;announcement_id:string};
export async function dispatchAnnouncementPush(budgetMs=40000){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,publicKey=process.env.VAPID_PUBLIC_KEY,privateKey=process.env.VAPID_PRIVATE_KEY,subject=process.env.VAPID_SUBJECT;
 if(!url||!key||!publicKey||!privateKey||!subject)return;
 const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}),deadline=Date.now()+budgetMs;
 try{webpush.setVapidDetails(subject,publicKey,privateKey)}catch{console.error('Announcement push configuration invalid');return}
 // Small leased batches drain a burst without exceeding the serverless time budget.
 // The final two groups of ten requests can each take up to five seconds.
 while(Date.now()<deadline-10000){
 const {data,error}=await c.rpc('claim_announcement_push',{batch_size:20});
 if(error){console.error('Announcement push queue unavailable');return}
 const jobs=(data||[]) as Job[];if(!jobs.length)return;
 for(let i=0;i<jobs.length;i+=10)await Promise.all(jobs.slice(i,i+10).map(async j=>{
  try{
   if(!validPushSubscription(j))throw Error('Invalid push endpoint');
   await webpush.sendNotification({endpoint:j.endpoint,keys:j.keys},JSON.stringify({title:'SAHD Announcement',body:j.title.slice(0,150),url:`/announcements/${j.announcement_id}`,tag:`announcement-${j.announcement_id}`}),{TTL:86400,timeout:5000});
   const saved=await c.from('announcement_push_jobs').update({sent_at:new Date().toISOString()}).eq('id',j.job_id);if(saved.error)console.error('Announcement push receipt could not be saved');
  }catch(e){const status=(e as {statusCode?:number}).statusCode;if(status===404||status===410)await c.from('announcement_push_subscriptions').delete().eq('id',j.subscription_id);else console.error('Announcement push delivery failed',status||'network')}
 }));
 if(jobs.length<20)return;
 }
}
