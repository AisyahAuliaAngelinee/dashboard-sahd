import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync('lib/demo-preview.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022}}).outputText;
const {demoPreviewProfile,demoPreviews}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const profile={id:'demo',name:'Character',role:'SAHD',accessRole:'Member',division:'Medical Service',position:'General Practitioner'};
test('demo preview applies selected access without changing identity or original profile',()=>{const fd=demoPreviewProfile(profile,'demo','admin-fd');assert.equal(fd.accessRole,'Admin');assert.equal(fd.division,'Fire Department');assert.equal(fd.name,profile.name);assert.equal(profile.accessRole,'Member');assert.equal(demoPreviews.length,6)});
test('preview settings never elevate live access and disabling restores the original profile',()=>{assert.equal(demoPreviewProfile(profile,'live','superadmin'),profile);assert.equal(demoPreviewProfile(profile,'demo',''),profile);assert.equal(demoPreviewProfile(profile,'demo','invalid'),profile)});
