import {serverClient,validOrigin} from '@/lib/supabase/server';
export async function POST(request:Request){
 if(!validOrigin(request))return Response.json({error:'Origin tidak valid.'},{status:403});
 const client=await serverClient();if(!client)return Response.json({error:'Layanan belum tersedia.'},{status:503});
 const {data:{user}}=await client.auth.getUser();if(!user)return Response.json({error:'Login diperlukan.'},{status:401});
 const {data:profile}=await client.from('profiles').select('division').eq('id',user.id).single();if(profile?.division!=='Medical Service')return Response.json({error:'Akses Medical Service diperlukan.'},{status:403});
 try{const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||file.size===0||file.size>4194304)return Response.json({error:'Gambar maksimal 4 MB.'},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());let mime='',ext='';if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){mime='image/png';ext='png'}else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){mime='image/jpeg';ext='jpg'}else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'){mime='image/webp';ext='webp'}if(!mime||file.type!==mime)return Response.json({error:'Gunakan file PNG, JPG, atau WebP yang valid.'},{status:400});
 const path=`${user.id}/${crypto.randomUUID()}.${ext}`;const {error}=await client.storage.from('radiology').upload(path,bytes,{contentType:mime});if(error)return Response.json({error:'Upload gagal. Periksa bucket radiology dan migration 005.'},{status:500});const {data}=await client.storage.from('radiology').createSignedUrl(path,3600);if(!data?.signedUrl)return Response.json({error:'Gambar diunggah tetapi preview belum tersedia.'},{status:500});return Response.json({path,url:data.signedUrl,name:file.name.slice(0,200)});
 }catch{return Response.json({error:'Upload gagal. Silakan coba kembali.'},{status:500})}
}
