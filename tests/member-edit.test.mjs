import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
function load(path,deps={}){const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports,m,n=>deps[n]);return m.exports}
const {normalizeMemberEdit,memberEditError}=load('../lib/member-edit.ts',{'./member-options':load('../lib/member-options.ts')});
const payload={name:'Leopold De Montegard',role:'SAHD',division:'Medical Service',position:'Chief',teams:['Human Resource'],access:'Admin'};
test('Chief with HR assignment can receive Admin access',()=>{assert.equal(memberEditError(normalizeMemberEdit(payload),false),null)});
test('form whitespace and comma spacing normalize before assignment validation',()=>{const data=normalizeMemberEdit({...payload,role:' SAHD ',position:'Doctor Resident,Chief ',teams:['Human Resource '],access:' Admin '});assert.equal(data.position,'Doctor Resident, Chief');assert.equal(memberEditError(data,false),null)});
test('invalid access and cross-division positions remain rejected',()=>{assert.match(memberEditError(normalizeMemberEdit({...payload,access:'Superadmin'}),false),/akses/);assert.match(memberEditError(normalizeMemberEdit({...payload,position:'Captain'}),false),/jabatan/)});
