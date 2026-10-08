import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/analytics.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {surgeryAnalytics,bounds}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
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
test('empty month has zero buckets for every day',()=>{const r=surgeryAnalytics([],'month','2026-02-15','','');assert.equal(r.points.length,28);assert.ok(r.points.every(p=>p.total===0))});
test('all time fills missing months and year has twelve buckets',()=>{const r=surgeryAnalytics([row('a','2026-01-02T00:00:00Z'),row('b','2026-03-02T00:00:00Z')],'all','2026-10-08','','');assert.deepEqual(r.points.map(p=>p.total),[1,0,1]);assert.equal(surgeryAnalytics([],'year','2026-10-08','','').points.length,12)});
