import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/analytics.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {surgeryAnalytics,bounds,reportOverview,sortAppointments}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const row=(id,at,category='minor',final=true)=>({id,performedAt:at,category,final,status:'completed'});
test('WIB day includes previous UTC evening and excludes next WIB midnight',()=>{
 const result=surgeryAnalytics([row('before','2026-10-07T16:59:59Z'),row('start','2026-10-07T17:00:00Z'),row('end','2026-10-08T16:59:59Z'),row('after','2026-10-08T17:00:00Z')],'day','2026-10-08','','');
 assert.equal(result.total,2);assert.equal(result.points.length,24);
});
test('weekly period uses Monday through Sunday even across month boundaries',()=>{
 const b=bounds('week','2026-11-01','','');assert.equal(b.start.toISOString(),'2026-10-25T17:00:00.000Z');assert.equal(b.end.toISOString(),'2026-11-01T17:00:00.000Z');
});
test('inclusive range end, unique procedures and finalized records only',()=>{
 const a=row('a','2026-10-08T16:59:59Z','major');const result=surgeryAnalytics([a,a,row('draft','2026-10-08T04:00:00Z','minor',false),row('outside','2026-10-08T17:00:00Z')],'range','2026-10-08','2026-10-08','2026-10-08');assert.equal(result.total,1);assert.equal(result.major,1);assert.equal(result.minor,0);
});
test('month overview always includes Jan through Dec, even without reports',()=>{const r=surgeryAnalytics([],'month','2026-02-15','','');assert.equal(r.points.length,12);assert.equal(r.points[0].label,'Jan');assert.equal(r.points[11].label,'Dec');assert.ok(r.points.every(p=>p.total===0))});
test('all time fills missing months and year includes the preceding three years',()=>{const r=surgeryAnalytics([row('a','2026-01-02T00:00:00Z'),row('b','2026-03-02T00:00:00Z')],'all','2026-10-08','','');assert.deepEqual(r.points.map(p=>p.total),[1,0,1]);assert.deepEqual(surgeryAnalytics([],'year','2026-10-08','','').points.map(p=>p.label),['2023','2024','2025','2026'])});

test('report overview shares a continuous axis and never combines surgery and fire IDs',()=>{const a=row('same','2026-01-02T00:00:00Z','major'),b=row('same','2026-03-02T00:00:00Z');const r=reportOverview([a],[b],'all','2026-10-08','','');assert.equal(r.surgery.total,1);assert.equal(r.fire.total,1);assert.deepEqual(r.points.map(p=>[p.surgery,p.bigFire]),[[1,0],[0,0],[0,1]])});
test('appointment schedule and status sort both directions without changing input',()=>{const rows=[{id:'b',date:'2026-10-10',status:'Pending',createdAt:'',name:''},{id:'a',date:'2026-10-09',status:'Done',createdAt:'',name:''}];assert.equal(sortAppointments(rows,'soon')[0].id,'a');assert.equal(sortAppointments(rows,'late')[0].id,'b');assert.equal(sortAppointments(rows,'statusAsc')[0].id,'a');assert.equal(sortAppointments(rows,'statusDesc')[0].id,'b');assert.equal(rows[0].id,'b')});

test('weekly overview groups WIB dates into weeks of the anchor month',()=>{const r=surgeryAnalytics([row('before','2026-09-30T16:59:59Z'),row('first','2026-09-30T17:00:00Z'),row('second','2026-10-07T17:00:00Z'),row('last','2026-10-31T16:59:59Z'),row('outside','2026-10-31T17:00:00Z')],'week','2026-10-09','','');assert.deepEqual(r.points.map(p=>p.label),['Week 1','Week 2','Week 3','Week 4','Week 5']);assert.deepEqual(r.points.map(p=>p.total),[1,1,0,0,1]);assert.equal(r.total,3)});
test('year overview counts reports across all four WIB calendar years',()=>{const r=reportOverview([row('old','2022-12-31T16:59:59Z'),row('first','2022-12-31T17:00:00Z'),row('current','2026-12-31T16:59:59Z')],[row('fire','2024-01-01T00:00:00Z')],'year','2026-10-09','','');assert.deepEqual(r.points.map(p=>[p.label,p.surgery,p.bigFire]),[['2023',1,0],['2024',0,1],['2025',0,0],['2026',1,0]]);assert.equal(r.surgery.total,2)});
