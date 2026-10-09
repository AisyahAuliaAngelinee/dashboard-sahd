import {organizationRoles,validAssignment} from './member-options';
export function normalizeMemberEdit(body:Record<string,unknown>){
 const trim=(v:unknown)=>typeof v==='string'?v.trim():v;
 return {...body,name:trim(body.name),role:trim(body.role),division:body.division===null?null:trim(body.division),position:typeof body.position==='string'?body.position.split(',').map(p=>p.trim()).filter(Boolean).join(', ')||null:body.position,teams:Array.isArray(body.teams)?body.teams.map(trim):body.teams,access:trim(body.access)};
}
export function memberEditError(data:ReturnType<typeof normalizeMemberEdit>,allowSuperadmin:boolean):string|null{
 if(typeof data.name!=='string'||!data.name||data.name.length>100)return 'Nama member wajib diisi, maksimal 100 karakter.';
 if(typeof data.role!=='string'||!organizationRoles.some(r=>r===data.role))return 'Role organisasi harus SAHD. Tutup dan buka kembali form Edit Member.';
 if(typeof data.access!=='string'||!['Member','Admin',...(allowSuperadmin?['Superadmin']:[])].includes(data.access))return 'Pilihan akses akun tidak valid.';
 if(!(data.division===null||typeof data.division==='string'))return 'Pilihan divisi tidak valid.';
 if(!(data.position===null||typeof data.position==='string'))return 'Pilihan jabatan tidak valid.';
 if(!Array.isArray(data.teams)||data.teams.some(t=>typeof t!=='string'))return 'Pilihan team tidak valid.';
 if(!validAssignment(data.role,data.division as string|null,data.position as string|null,data.teams as string[]))return 'Periksa kesesuaian jabatan dengan divisi dan pilihan team.';
 return null;
}
