import {serverClient,validOrigin} from '@/lib/supabase/server';
import {normalizeMemberEdit,memberEditError} from '@/lib/member-edit';
export async function PATCH(request:Request){
 if(!validOrigin(request))return Response.json({error:'Origin tidak valid.'},{status:403});
 const client=await serverClient();const user=client?(await client.auth.getUser()).data.user:null;
 if(!client||!user)return Response.json({error:'Sesi berakhir.'},{status:401});
 const {data:actor}=await client.from('profiles').select('access_role,is_active').eq('id',user.id).single();
 if(!actor?.is_active||!['Admin','Superadmin'].includes(actor.access_role))return Response.json({error:'Akses ditolak.'},{status:403});
 const body=await request.json().catch(()=>null);
 if(!body||! /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.id||'')||typeof body.remove!=='boolean')return Response.json({error:'Input tidak valid.'},{status:400});
 const {data:target}=await client.from('profiles').select('display_name,role,division,job_title,teams,access_role').eq('id',body.id).single();
 if(!target)return Response.json({error:'Member tidak ditemukan.'},{status:404});
 if((target.access_role==='Superadmin'||body.id===user.id)&&actor.access_role!=='Superadmin')return Response.json({error:'Superadmin tidak dapat diubah di sini.'},{status:403});
 const data=body.remove||body.accessOnly===true?{name:target.display_name,role:target.role,division:target.division,position:target.job_title,teams:target.teams,access:body.remove?target.access_role:body.access}:normalizeMemberEdit(body);
 if(!body.remove){const validationError=memberEditError(data,actor.access_role==='Superadmin'&&target.access_role==='Superadmin');if(validationError)return Response.json({error:validationError},{status:400})}
 const {error}=await client.rpc('manage_portal_member',{target_user:body.id,new_name:data.name,new_role:data.role,new_division:data.division,new_position:data.position,new_teams:data.teams,new_access:data.access,remove_member:body.remove});
 if(error){const messages:Record<string,string>={'Last Superadmin protected':'Superadmin terakhir tidak dapat dihapus atau diturunkan aksesnya.','Forbidden':'Anda tidak memiliki izin untuk mengubah anggota ini.','Self management disabled':'Hanya Superadmin yang dapat mengubah akun sendiri.','Superadmin cannot be changed here':'Hanya Superadmin yang dapat mengubah akun Superadmin.','Invalid assignment':'Periksa jabatan dan divisi yang dipilih.','Member not found':'Anggota tidak ditemukan.'};return Response.json({error:messages[error.message]||'Perubahan gagal disimpan. Silakan coba kembali.'},{status:400})}return Response.json({ok:true});
}
