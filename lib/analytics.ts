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
export function surgeryAnalytics(rows:Surgery[],period:Period,anchor:string,from:string,to:string){
 const {start,end}=bounds(period,anchor,from,to);const unique=[...new Map(rows.filter(r=>r.status==='completed'&&r.final).map(r=>[r.id,r])).values()];const included=unique.filter(r=>period==='all'||(new Date(r.performedAt)>=start&&new Date(r.performedAt)<end));
 const mode=period==='day'?'hour':period==='all'||period==='year'?'month':'day';
 const key=(d:Date)=>mode==='hour'?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',hourCycle:'h23'}).format(d):mode==='month'?wibDate(d).slice(0,7):wibDate(d);
 const bucket=new Map<string,number>();
 if(period==='day'){for(let i=0;i<24;i++)bucket.set(String(i).padStart(2,'0'),0)}
 else if(period==='year'){for(let i=1;i<=12;i++)bucket.set(`${anchor.slice(0,4)}-${String(i).padStart(2,'0')}`,0)}
 else if(period==='all'&&included.length){const dates=included.map(r=>wibDate(new Date(r.performedAt)).slice(0,7)).sort();let cursor=new Date(`${dates[0]}-01T00:00:00Z`);const last=dates.at(-1)!;while(cursor.toISOString().slice(0,7)<=last){bucket.set(cursor.toISOString().slice(0,7),0);cursor.setUTCMonth(cursor.getUTCMonth()+1)}}
 else if(period!=='all'){for(let t=start.getTime();t<end.getTime();t+=86400000)bucket.set(key(new Date(t)),0)}
 for(const r of included){const k=key(new Date(r.performedAt));bucket.set(k,(bucket.get(k)||0)+1)}
 return {total:included.length,minor:included.filter(r=>r.category==='minor').length,major:included.filter(r=>r.category==='major').length,points:[...bucket].sort(([a],[b])=>a.localeCompare(b)).map(([date,total])=>({date,label:mode==='hour'?`${date}:00`:mode==='month'?new Date(`${date}-01T00:00:00Z`).toLocaleDateString('id-ID',{month:'short',year:'2-digit',timeZone:'UTC'}):new Date(`${date}T00:00:00Z`).toLocaleDateString('id-ID',{day:'numeric',month:'short',timeZone:'UTC'}),total}))};
}
