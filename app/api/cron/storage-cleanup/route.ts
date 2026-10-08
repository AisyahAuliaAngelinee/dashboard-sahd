import {timingSafeEqual} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(r:Request){
 const secret=process.env.CRON_SECRET,authorization=r.headers.get('authorization')||'';
 if(!secret)return Response.json({error:'Cron belum dikonfigurasi.'},{status:503});
 const expected=Buffer.from(`Bearer ${secret}`),provided=Buffer.from(authorization);
 if(expected.length!==provided.length||!timingSafeEqual(expected,provided))return Response.json({error:'Unauthorized'},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return Response.json({error:'Storage cleanup belum dikonfigurasi.'},{status:503});
 const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await c.rpc('ready_storage_cleanup');if(error)return Response.json({error:'Cleanup queue tidak tersedia.'},{status:503});
 let removed=0;const paths=(data||[]).map((i:{path:string})=>i.path).filter((p:unknown):p is string=>typeof p==='string');
 for(let offset=0;offset<paths.length;offset+=100){const batch=paths.slice(offset,offset+100);const result=await c.storage.from('radiology').remove(batch);if(result.error)return Response.json({error:'Penghapusan storage gagal; queue disimpan untuk retry.',removed},{status:502});const resultQueue=await c.from('storage_cleanup_queue').delete().in('path',batch);if(resultQueue.error)return Response.json({error:'Queue gagal diperbarui; retry aman.',removed},{status:502});removed+=batch.length}
 return Response.json({removed});
}
