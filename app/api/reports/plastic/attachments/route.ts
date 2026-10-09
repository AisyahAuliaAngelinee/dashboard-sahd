import {serverClient,validOrigin} from '@/lib/supabase/server';
import {requestProfile} from '@/lib/server-access';
import {attachmentLimit,attachmentFileType,videoFileType} from '@/lib/fire-attachments';
export async function POST(request:Request){
 if(!validOrigin(request))return Response.json({error:'Origin tidak valid.'},{status:403});const client=await serverClient(),user=client?(await client.auth.getUser()).data.user:null;if(!client||!user)return Response.json({error:'Login diperlukan.'},{status:401});const profile=await requestProfile(client,user.id);if(!profile||profile.position==='Trainee')return Response.json({error:'Trainee hanya dapat melihat report.'},{status:403});
 const form=await request.formData().catch(()=>null),file=form?.get('file');if(!(file instanceof File)||!file.size||file.size>attachmentLimit)return Response.json({error:'File maksimal 4 MB.'},{status:400});const bytes=new Uint8Array(await file.arrayBuffer());let type=attachmentFileType(bytes)||videoFileType(bytes);
 if(!type&&['text/plain','text/csv'].includes(file.type)&&!bytes.includes(0)){type={ext:file.type==='text/csv'?'csv':'txt',mime:file.type,kind:'file'}}
 if(!type&&file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'&&bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4){type={ext:'docx',mime:file.type,kind:'file'}}
 if(!type)return Response.json({error:'Gunakan PNG, JPG, WebP, PDF, DOCX, TXT, CSV, MP4, WebM, atau MOV.'},{status:400});const path=`${user.id}/${crypto.randomUUID()}.${type.ext}`;const {error}=await client.storage.from('plastic-attachments').upload(path,bytes,{contentType:type.mime});if(error)return Response.json({error:'Upload gagal. Periksa migration 027 dan koneksi storage.'},{status:500});const {data}=await client.storage.from('plastic-attachments').createSignedUrl(path,3600);return Response.json({attachment:{id:crypto.randomUUID(),name:file.name.slice(0,200),kind:type.kind,path,size:file.size,url:data?.signedUrl}})
}
