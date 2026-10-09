export const trashKinds=['fire_report','medical_report','patient_consent','consultation','announcement'] as const;
export type TrashKind=typeof trashKinds[number];
export type TrashRow={id:string;kind:TrashKind;title:string;created_by:string;created_by_name:string;deleted_at:string;purge_after:string};
export const trashLabels:Record<TrashKind,string>={fire_report:'Big Fire Report',medical_report:'Medical Report',patient_consent:'Patient Consent',consultation:'Consultation',announcement:'Announcement'};
export function deadline(deletedAt:string,purgeAfter?:string|null){return purgeAfter||new Date(new Date(deletedAt).getTime()+30*86400000).toISOString()}
export function expired(row:Pick<TrashRow,'purge_after'>,now=Date.now()){return new Date(row.purge_after).getTime()<=now}
export function validTrashRequest(value:unknown):value is {action:'restore'|'delete';items:{id:string;kind:TrashKind}[]}{if(!value||typeof value!=='object')return false;const b=value as {action:string;items:{id:string;kind:TrashKind}[]};return ['restore','delete'].includes(b.action)&&Array.isArray(b.items)&&b.items.length>0&&b.items.length<=1000&&b.items.every(i=>i&&trashKinds.includes(i.kind)&&typeof i.id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(i.id))&&new Set(b.items.map(i=>`${i.kind}:${i.id}`)).size===b.items.length}
