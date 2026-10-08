import type {ConsultationRow} from './consultation';
export const consultationStatus=(status:string)=>status==='Cancelled'?'Canceled':status==='Completed'?'Done':status==='Scheduled'?'Pending':status;
export function filterConsultations(rows:ConsultationRow[],search:string,status:string,from:string,to:string){const query=search.trim().toLocaleLowerCase();return rows.filter(r=>!r.deleted_at&&(!status||consultationStatus(r.status)===status)&&(!from||r.date>=from)&&(!to||r.date<=to)&&(!query||[r.name,r.complaint,r.created_by_name,r.contact,r.job].some(v=>v.toLocaleLowerCase().includes(query))))}
