import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compiled=ts.transpileModule(fs.readFileSync(new URL('../lib/medical-report.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};new Function('exports','module',compiled)(module.exports,module);
const {reportText,sections,radiologySvg}=module.exports;
test('report retains supplied facts, all sections and vital units without inventing findings',()=>{const text=reportText({caseText:'RP case',fields:{'Patient Name':'Demo RP','Anamnesis':'User supplied observation','Before Surgery — BP':'120/80','Assistant Operation':'A\nB','Anesthetic Medications':'User supplied drug','Follow Up Care':'- One\n- Two\n- Three\n- Four'},times:{},category:'minor',preview:''},'Author');for(const section of sections)assert.ok(text.includes(section.title));assert.ok(text.includes('Blood Pressure (BP) : 120/80 mmHg'));assert.ok(text.includes('- A\n- B'));assert.ok(text.includes('- Four'));assert.ok(text.includes('User supplied observation'));assert.ok(!text.includes('Supportive Medications'));assert.ok(!text.includes('normal'))});
test('radiology schematic escapes user input and labels its limitation',()=>{const svg=radiologySvg('MRI','<script>alert(1)</script>');assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('Not a scan or case-specific finding'))});
