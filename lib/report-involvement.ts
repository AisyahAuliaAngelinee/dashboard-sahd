import type {Profile,Surgery} from './portal-data';

export function involvesMember(report:Surgery,profile:Profile,members:Profile[]){
 if(report.createdBy===profile.id||report.doctorId===profile.id||report.participantIds?.includes(profile.id))return true;
 // Older surgery reports stored names for team members. Do not match ambiguous names.
 const name=profile.name.trim().toLowerCase();
 if(!name||members.filter(m=>m.name.trim().toLowerCase()===name).length!==1)return false;
 return [!report.doctorId?report.doctorName:undefined,...(report.assistantNames||[])].some(value=>value?.trim().toLowerCase()===name);
}

export function reportPersonnelIds(value:unknown){
 return Array.isArray(value)?value.flatMap(p=>typeof p?.id==='string'?[p.id]:[]):[];
}
