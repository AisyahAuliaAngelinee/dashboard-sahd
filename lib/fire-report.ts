export type FireDraft={location:string;incidentAt:string;reportDate:string;status:'pending'|'resolved';chronology:string;actions:string;damage:string;civilians:number;locals:number;cause:string;closing:string;commanderId:string;commanderName:string;commanderBadge:string;commanderPosition:string;personnel?:{id:string;name:string;badge:string}[];rich:Record<string,string>};
export type FireReport={id:string;title:string;status:'pending'|'resolved';created_by:string;created_by_name:string;created_at:string;updated_at?:string;draft:FireDraft;report_text:string;deleted_at?:string|null;purge_after?:string|null};
export const fireTitle=(draft:FireDraft)=>`LAPORAN KEJADIAN KEBAKARAN ${draft.location.trim()}`;
export function freshFireDraft(name='',position=''):FireDraft{const date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());return {location:'',incidentAt:`${date} 00:00:00 GMT+7`,reportDate:date,status:'pending',chronology:'',actions:'',damage:'',civilians:0,locals:0,cause:'',closing:'',commanderId:'',commanderName:name,commanderBadge:'',commanderPosition:position,rich:{}}}
export function fireReportText(d:FireDraft){const [date,...time]=d.incidentAt.split(' ');return `${fireTitle(d)}

Tanggal Kejadian: ${date}
Waktu Kejadian: ${time.join(' ')}
Lokasi: ${d.location}
Jenis Kejadian: Kebakaran
Status: ${d.status==='resolved'?'Teratasi':'Penanganan Darurat'}

Kronologi Kejadian
${d.chronology}

Tindakan yang Dilakukan
${d.actions}

Kerusakan: ${d.damage}

Korban: ${d.civilians} civilian | ${d.locals} warga lokal
Penyebab Kebakaran: ${d.cause}

Penutup
${d.closing}

Incident Commander: (${d.commanderBadge}) ${d.commanderName}
Jabatan: ${d.commanderPosition}
Personil: ${(d.personnel||[]).map(m=>`(${m.badge||'-'}) ${m.name}`).join(', ')||'-'}
Tanggal Laporan: ${d.reportDate}`}
const dateValid=(value:string)=>{const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);if(!m)return false;const date=new Date(Date.UTC(+m[3],+m[2]-1,+m[1]));return date.getUTCFullYear()===+m[3]&&date.getUTCMonth()===+m[2]-1&&date.getUTCDate()===+m[1]};
export function validFireDraft(value:unknown):value is FireDraft{if(!value||typeof value!=='object'||Array.isArray(value))return false;const d=value as FireDraft;const texts=['location','incidentAt','reportDate','chronology','actions','damage','cause','closing','commanderId','commanderName','commanderBadge','commanderPosition'] as const;if(texts.some(k=>typeof d[k]!=='string'||d[k].length>15000)||!['pending','resolved'].includes(d.status)||!d.location.trim()||d.location.length>500||!d.chronology.trim()||!d.actions.trim()||!d.damage.trim()||!d.cause.trim()||!d.closing.trim()||!d.commanderName.trim()||!d.commanderBadge.trim()||!d.commanderPosition.trim())return false;if(d.personnel!==undefined&&(!Array.isArray(d.personnel)||d.personnel.length>500||d.personnel.some(m=>!m||typeof m.id!=='string'||typeof m.name!=='string'||m.name.length>100||typeof m.badge!=='string'||m.badge.length>20)))return false;return dateValid(d.reportDate)&&/^\d{2}\/\d{2}\/\d{4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d GMT\+7$/.test(d.incidentAt)&&dateValid(d.incidentAt.split(' ')[0])&&[d.civilians,d.locals].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=100000)&&!!d.rich&&typeof d.rich==='object'&&!Array.isArray(d.rich)&&Object.values(d.rich).every(v=>typeof v==='string'&&v.length<=30000)&&JSON.stringify(d).length<=200000}
