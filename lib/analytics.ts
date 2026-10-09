import type { Surgery } from './portal-data';
export type Period = 'all'|'day'|'week'|'month'|'year'|'range';
export const wibDate = (date:Date) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function bounds(period:Period, anchor:string, from:string, to:string) {
 const d=new Date(`${anchor}T00:00:00+07:00`); const end=new Date(d); let start=new Date(d);
 if(period==='week'){const weekday=new Date(`${anchor}T00:00:00Z`).getUTCDay();start=new Date(d.getTime()-((weekday+6)%7)*86400000);end.setTime(start.getTime()+7*86400000)}
 else if(period==='month'){start=new Date(`${anchor.slice(0,7)}-01T00:00:00+07:00`);const next=new Date(`${anchor.slice(0,7)}-01T00:00:00Z`);next.setUTCMonth(next.getUTCMonth()+1);end.setTime(new Date(`${next.toISOString().slice(0,10)}T00:00:00+07:00`).getTime())}
 else if(period==='year'){start=new Date(`${anchor.slice(0,4)}-01-01T00:00:00+07:00`);end.setTime(new Date(`${Number(anchor.slice(0,4))+1}-01-01T00:00:00+07:00`).getTime())}
 else if(period==='range'){start=new Date(`${from}T00:00:00+07:00`);end.setTime(new Date(`${to}T00:00:00+07:00`).getTime()+86400000)}
 else end.setTime(d.getTime()+86400000);
 return {start,end};
}
/** Overview granularity differs from the date filters used in announcement lists. */
export function overviewBounds(period:Period,anchor:string,from:string,to:string){
 if(period==='week')return bounds('month',anchor,from,to);
 if(period==='month')return bounds('year',anchor,from,to);
 if(period==='year')return {start:new Date(`${Number(anchor.slice(0,4))-3}-01-01T00:00:00+07:00`),end:new Date(`${Number(anchor.slice(0,4))+1}-01-01T00:00:00+07:00`)};
 return bounds(period,anchor,from,to);
}
export function surgeryAnalytics(rows:Surgery[],period:Period,anchor:string,from:string,to:string){
 const {start,end}=overviewBounds(period,anchor,from,to);
 const unique=[...new Map(rows.filter(r=>r.status==='completed'&&r.final&&Number.isFinite(Date.parse(r.performedAt))).map(r=>[r.id,r])).values()];
 const included=unique.filter(r=>period==='all'||(new Date(r.performedAt)>=start&&new Date(r.performedAt)<end));
 const mode=period==='day'?'hour':period==='week'?'week':period==='year'?'year':period==='all'||period==='month'?'month':'day';
 // Week 1 is days 1–7; Week 2 is days 8–14, including the final partial week.
 const key=(d:Date)=>{const date=wibDate(d);return mode==='hour'?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',hourCycle:'h23'}).format(d):mode==='week'?`${date.slice(0,7)}-W${Math.ceil(Number(date.slice(8,10))/7)}`:mode==='year'?date.slice(0,4):mode==='month'?date.slice(0,7):date};
 const bucket=new Map<string,number>();
 if(period==='day'){for(let i=0;i<24;i++)bucket.set(String(i).padStart(2,'0'),0)}
 else if(period==='week'){const days=new Date(Date.UTC(Number(anchor.slice(0,4)),Number(anchor.slice(5,7)),0)).getUTCDate();for(let i=1;i<=Math.ceil(days/7);i++)bucket.set(`${anchor.slice(0,7)}-W${i}`,0)}
 else if(period==='month'){for(let i=1;i<=12;i++)bucket.set(`${anchor.slice(0,4)}-${String(i).padStart(2,'0')}`,0)}
 else if(period==='year'){for(let y=Number(anchor.slice(0,4))-3;y<=Number(anchor.slice(0,4));y++)bucket.set(String(y),0)}
 else if(period==='all'&&included.length){const dates=included.map(r=>wibDate(new Date(r.performedAt)).slice(0,7)).sort();let cursor=new Date(`${dates[0]}-01T00:00:00Z`);const last=dates.at(-1)!;while(cursor.toISOString().slice(0,7)<=last){bucket.set(cursor.toISOString().slice(0,7),0);cursor.setUTCMonth(cursor.getUTCMonth()+1)}}
 else if(period!=='all'){for(let t=start.getTime();t<end.getTime();t+=86400000)bucket.set(key(new Date(t)),0)}
 for(const r of included){const k=key(new Date(r.performedAt));bucket.set(k,(bucket.get(k)||0)+1)}
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 return {total:included.length,minor:included.filter(r=>r.category==='minor').length,major:included.filter(r=>r.category==='major').length,points:[...bucket].sort(([a],[b])=>a.localeCompare(b)).map(([date,total])=>({date,label:mode==='hour'?`${date}:00`:mode==='week'?`Week ${date.split('-W')[1]}`:mode==='year'?date:mode==='month'?`${months[Number(date.slice(5,7))-1]}${period==='all'?` ${date.slice(2,4)}`:''}`:new Date(`${date}T00:00:00Z`).toLocaleDateString('id-ID',{day:'numeric',month:'short',timeZone:'UTC'}),total}))};
}

export function reportOverview(surgeries:Surgery[],bigFires:Surgery[],period:Period,anchor:string,from:string,to:string){
 const surgery=surgeryAnalytics(surgeries,period,anchor,from,to),fire=surgeryAnalytics(bigFires,period,anchor,from,to);
 const axis=surgeryAnalytics([...surgeries.map(r=>({...r,id:`surgery:${r.id}`})),...bigFires.map(r=>({...r,id:`fire:${r.id}`}))],period,anchor,from,to);
 const surgeryCounts=new Map(surgery.points.map(p=>[p.date,p.total])),fireCounts=new Map(fire.points.map(p=>[p.date,p.total]));
 return {surgery,fire,points:axis.points.map(p=>({date:p.date,label:p.label,surgery:surgeryCounts.get(p.date)||0,bigFire:fireCounts.get(p.date)||0}))};
}
export function sortAppointments<T extends {id:string;createdAt:string;date:string;name:string;status:string}>(rows:T[],sort:string){return [...rows].sort((a,b)=>{const cmp=sort==='newest'?b.createdAt.localeCompare(a.createdAt):sort==='oldest'?a.createdAt.localeCompare(b.createdAt):sort==='soon'?a.date.localeCompare(b.date):sort==='late'?b.date.localeCompare(a.date):sort==='statusAsc'?a.status.localeCompare(b.status):sort==='statusDesc'?b.status.localeCompare(a.status):sort==='az'?a.name.localeCompare(b.name):b.name.localeCompare(a.name);return cmp||a.id.localeCompare(b.id)})}
