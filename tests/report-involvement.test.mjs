import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const module={exports:{}};
new Function('exports','module',ts.transpileModule(readFileSync(new URL('../lib/report-involvement.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module.exports,module);
const {involvesMember,reportPersonnelIds}=module.exports;
const doctor={id:'doctor-1',name:'Alex Lee'},other={id:'doctor-2',name:'Sam Reid'};
test('overview includes the author and participants while excluding unrelated reports',()=>{
 const members=[doctor,other];
 for(const report of [{createdBy:doctor.id},{doctorId:doctor.id},{participantIds:reportPersonnelIds([{id:doctor.id},null])},{assistantNames:['Alex Lee']}])assert.equal(involvesMember(report,doctor,members),true);
 assert.equal(involvesMember({createdBy:other.id},doctor,members),false);
 assert.equal(involvesMember({doctorId:other.id,doctorName:doctor.name},doctor,members),false);
 assert.equal(involvesMember({assistantNames:[doctor.name]},doctor,[...members,{id:'duplicate',name:doctor.name}]),false);
});

test('performance only accepts leadership titles and counts each report once per member',()=>{
 const perf={exports:{}};
 new Function('exports','module',ts.transpileModule(readFileSync(new URL('../lib/report-performance.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText)(perf.exports,perf);
 const {canSeeReportPerformance,reportPerformance,filterPerformanceReports}=perf.exports;
 for(const position of ['Director','Doctor Resident, Deputy Director','Advisor','Chief','Cheif','Deputy'])assert.equal(canSeeReportPerformance(position),true);
 for(const position of ['Captain','Trainee','Assistant Director',undefined])assert.equal(canSeeReportPerformance(position),false);
 assert.deepEqual(reportPerformance([doctor,other],[{createdBy:doctor.id,doctorId:doctor.id,assistantNames:[doctor.name,other.name]}],[{createdBy:other.id,participantIds:[doctor.id,doctor.id]}],[{createdBy:doctor.id}]),[{id:doctor.id,surgery:1,bigFire:1,others:1},{id:other.id,surgery:1,bigFire:1,others:0}]);
 const result=filterPerformanceReports({
  surgery:[{id:'before',category:'major',performedAt:'2026-11-15T16:59:59Z'},{id:'included',category:'major',performedAt:'2026-11-15T17:00:00Z'},{id:'minor',category:'minor',performedAt:'2026-11-16T01:00:00Z'}],
  bigFire:[{id:'fire',performedAt:'2026-11-16T01:00:00Z'}],others:[],
 },{type:'major',from:'2026-11-16',to:'2026-11-16'});
 assert.deepEqual(result.surgery.map(report=>report.id),['included']);
 assert.deepEqual(result.bigFire,[]);

});
