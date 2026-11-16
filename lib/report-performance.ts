import type {Profile,Surgery} from './portal-data';

const leadership=new Set(['director','deputy director','advisor','chief','cheif','deputy']);
export function canSeeReportPerformance(position?:string|null){
 return !!position?.split(',').some(title=>leadership.has(title.trim().toLowerCase()));
}
export type MemberPerformance={id:string;surgery:number;bigFire:number;others:number};
export function reportPerformance(members:Profile[],surgeries:Surgery[],fires:Surgery[],others:Surgery[]):MemberPerformance[]{
 const counts=new Map(members.map(m=>[m.id,{id:m.id,surgery:0,bigFire:0,others:0}]));
 const names=new Map<string,string|null>();
 for(const member of members){
  const name=member.name.trim().toLowerCase();
  if(name)names.set(name,names.has(name)?null:member.id);
 }
 const categories={surgery:surgeries,bigFire:fires,others} as const;
 for(const key of ['surgery','bigFire','others'] as const){
  for(const report of categories[key]){
   const ids=new Set([key!=='surgery'?report.createdBy:undefined,report.doctorId,...report.participantIds||[]]);
   for(const name of [!report.doctorId?report.doctorName:undefined,...report.assistantNames||[]]){
    const id=name&&names.get(name.trim().toLowerCase());
    if(id)ids.add(id);
   }
   for(const id of ids){const row=id&&counts.get(id);if(row)row[key]++;}
  }
 }
 return [...counts.values()];
}

export type PerformanceReports={surgery:Surgery[];bigFire:Surgery[];others:Surgery[]};
export type PerformanceType='all'|'major'|'minor'|'bigFire'|'others';
export function filterPerformanceReports(reports:PerformanceReports,filters:{type:PerformanceType;from:string;to:string}):PerformanceReports{
 const wib=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'});
 const within=(report:Surgery)=>{
  if(!filters.from&&!filters.to)return true;
  const timestamp=Date.parse(report.performedAt);
  if(!Number.isFinite(timestamp))return false;
  const date=wib.format(timestamp);
  return (!filters.from||date>=filters.from)&&(!filters.to||date<=filters.to);
 };
 return {
  surgery:['all','major','minor'].includes(filters.type)?reports.surgery.filter(r=>(filters.type==='all'||filters.type===r.category)&&within(r)):[],
  bigFire:filters.type==='all'||filters.type==='bigFire'?reports.bigFire.filter(within):[],
  others:filters.type==='all'||filters.type==='others'?reports.others.filter(within):[],
 };
}
