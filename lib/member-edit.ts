import {organizationRoles,validAssignment,divisions,positions,memberTeams} from './member-options';
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
 if(data.division&&!divisions.some(d=>d===data.division))return `Divisi tidak dikenali: ${data.division}. Pilih ulang divisi.`;
 const selected=typeof data.position==='string'?data.position.split(', '):[];
 if(selected.some(p=>p!=='Trainee'&&!(positions[String(data.division)]||[]).includes(p)))return `Jabatan tidak sesuai dengan divisi ${data.division||'belum ditentukan'}: ${selected.join(', ')}. Pilih ulang jabatan.`;
 const unknownTeams=data.teams.filter(t=>!memberTeams.some(team=>team===t));if(unknownTeams.length)return `Team tidak dikenali: ${unknownTeams.join(', ')}. Pilih ulang team.`;
 if(!validAssignment(data.role,data.division as string|null,data.position as string|null,data.teams as string[]))return 'Pilihan jabatan atau team berulang, atau Trainee digabung dengan jabatan lain.';
 return null;
}

export function assignmentUnchanged(current:{name:string;division:string;position:string;teams:string[]},saved:{name:string;division:string;position?:string;teams?:string[]}){
 const list=(items:string[])=>JSON.stringify(items.map(v=>v.trim()).sort());
 return current.name.trim()===saved.name.trim()&&current.division===saved.division&&list(current.position.split(',').filter(Boolean))===list((saved.position||'Trainee').split(',').filter(Boolean))&&list(current.teams)===list(saved.teams||[]);
}
