import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import ts from 'typescript';
const source=readFileSync(new URL('../lib/member-options.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {validAssignment}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('positions are restricted to their division and unassigned members only allow Trainee',()=>{
 assert.equal(validAssignment('SAHD','Medical Service','General Practitioner',['Finance']),true);
 assert.equal(validAssignment('SAHD','Fire Department','Captain',[]),true);
 assert.equal(validAssignment('Director','Fire Department','Medical Student',[]),false);
 assert.equal(validAssignment('SAHD',null,'General Practitioner',[]),false);
 assert.equal(validAssignment('SAHD',null,null,[]),true);assert.equal(validAssignment('SAHD',null,'Trainee',[]),true);assert.equal(validAssignment('SAHD','Fire Department','Trainee',[]),true);
});
test('unknown roles and teams and duplicate teams cannot be assigned',()=>{
 assert.equal(validAssignment('Owner','Medical Service',null,[]),false);
 assert.equal(validAssignment('SAHD','Police',null,[]),false);
 assert.equal(validAssignment('SAHD','Medical Service',null,['Payroll']),false);
 assert.equal(validAssignment('SAHD','Medical Service',null,['Finance','Finance']),false);
});

test("multiple positions validate without bypassing Trainee restrictions",()=>{assert.equal(validAssignment("SAHD","Medical Service","Doctor Resident, Chief",[]),true);assert.equal(validAssignment("SAHD","Medical Service","Trainee, Chief",[]),false);assert.equal(validAssignment("SAHD","Medical Service","Captain, Chief",[]),false);assert.equal(validAssignment("Deputy","Medical Service","Doctor Resident",[]),false)});
