export type MentionTargets={users:string[];roles:string[];divisions:string[];positions?:string[]};
export type ConsultationInput={name:string;dob:string;date:string;contact:string;job:string;complaint:string;notes:string;mentions:MentionTargets};
export type ConsultationRow=ConsultationInput & {id:string;created_by:string;created_by_name:string;created_at:string;division:string;status:string;cancellation_reason?:string;deleted_at?:string};
export function validConsultation(v:unknown):v is ConsultationInput {
 if(!v||typeof v!=='object')return false;
 const d=v as ConsultationInput;
 if(!['name','dob','date','contact','job','complaint','notes'].every(k=>typeof d[k as keyof ConsultationInput]==='string'))return false;
 if(!d.name.trim()||d.name.length>200||!d.complaint.trim()||d.complaint.length>5000||d.notes.length>10000||d.contact.length>100||d.job.length>200)return false;
 const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!validDate(d.date)||d.dob&&!validDate(d.dob))return false;
 if(d.mentions?.positions!==undefined&&(!Array.isArray(d.mentions.positions)||d.mentions.positions.length>100||new Set(d.mentions.positions).size!==d.mentions.positions.length||d.mentions.positions.some(x=>typeof x!=='string'||!x.trim()||x.length>100)))return false;
 return !!d.mentions&&['users','roles','divisions'].every(k=>{const a=d.mentions[k as keyof MentionTargets];return Array.isArray(a)&&a.length<=100&&new Set(a).size===a.length&&a.every(x=>typeof x==='string'&&x.length>0&&x.length<=100)})&&d.mentions.divisions.every(x=>['Medical Service','Fire Department'].includes(x));
}
export function mentionRecipients(targets:MentionTargets,members:{id:string;role:string;division:string;position?:string}[]):string[]{return members.filter(m=>targets.users.includes(m.id)||targets.roles.includes(m.role)||targets.divisions.includes(m.division)||!!m.position&&!!targets.positions?.includes(m.position)).map(m=>m.id)}
export function consultationAppointment(row:ConsultationRow){return {id:row.id,name:row.name,complaint:row.complaint,doctor:'Belum ditugaskan',date:row.date,createdAt:row.created_at,status:row.status}}

export function validCancellationReason(value:unknown):value is string{return typeof value==='string'&&value.trim().length>0&&value.length<=2000}
