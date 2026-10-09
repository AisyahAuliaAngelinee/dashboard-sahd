import {serverClient,validOrigin} from '@/lib/supabase/server';
import {requestProfile} from '@/lib/server-access';
import {validPoll} from '@/lib/announcement-poll';
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
export async function GET(r:Request){
 const c=await serverClient(),user=c?(await c.auth.getUser()).data.user:null;if(!c||!user||!await requestProfile(c,user.id))return Response.json({error:'Login diperlukan.'},{status:401});
 const url=new URL(r.url),id=url.searchParams.get('announcement'),pollId=url.searchParams.get('poll');if(!uuid(id)||!uuid(pollId))return Response.json({error:'Voting tidak valid.'},{status:400});
 const {data:a}=await c.from('announcements').select('body_json').eq('id',id).is('deleted_at',null).eq('status','published').single();const poll=a?.body_json?.content?.find((n:{type:string;attrs?:{id:string}})=>n.type==='poll'&&n.attrs?.id===pollId)?.attrs;
 if(!validPoll(poll))return Response.json({error:'Voting tidak ditemukan.'},{status:404});
 const {data,error}=await c.from('announcement_votes').select('option_index,user_id').eq('announcement_id',id).eq('poll_id',pollId);if(error)return Response.json({error:'Voting gagal dimuat.'},{status:503});
 return Response.json({counts:poll.options.map((_,i)=>data.filter(v=>v.option_index===i).length),selected:data.find(v=>v.user_id===user.id)?.option_index??null,total:data.length,closed:Date.now()>=Date.parse(poll.closesAt)});
}
export async function POST(r:Request){if(!validOrigin(r))return Response.json({error:'Origin tidak valid.'},{status:403});const c=await serverClient(),user=c?(await c.auth.getUser()).data.user:null;if(!c||!user||!await requestProfile(c,user.id))return Response.json({error:'Login diperlukan.'},{status:401});const b=await r.json().catch(()=>null);if(!uuid(b?.announcement)||!uuid(b?.poll)||!Number.isInteger(b?.option))return Response.json({error:'Pilihan voting tidak valid.'},{status:400});const {error}=await c.rpc('cast_announcement_vote',{announcement:b.announcement,poll:b.poll,choice:b.option});return error?Response.json({error:'Vote gagal: voting sudah berakhir atau pilihan tidak valid.'},{status:400}):Response.json({ok:true})}
