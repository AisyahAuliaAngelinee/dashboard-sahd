import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const transpile=(name)=>ts.transpileModule(readFileSync(new URL('../lib/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {readReportTemplate,validateTemplateFile}=await import(asModule(transpile('report-template-file').replace("'./medical-report'",JSON.stringify(asModule(transpile('medical-report'))))));

test('report template picker accepts supported extensions and enforces per-format size limits',()=>{
 assert.equal(validateTemplateFile({name:'layout.PDF',size:4*1024*1024}),'pdf');
 assert.equal(validateTemplateFile({name:'layout.docx',size:128000}),'docx');
 assert.equal(validateTemplateFile({name:'layout.txt',size:64000}),'txt');
 assert.throws(()=>validateTemplateFile({name:'layout.txt',size:64001}));
 assert.throws(()=>validateTemplateFile({name:'layout.pdf',size:4*1024*1024+1}));
 for(const name of ['layout.doc','layout.html','txt'])assert.throws(()=>validateTemplateFile({name,size:10}));
});

test('text imports preserve placeholders and line breaks and reject empty or binary text',async()=>{
 assert.equal(await readReportTemplate(new File(['\uFEFF{{Title}}\r\n{{Doctor}}\r\n'],'layout.txt')),'{{Title}}\n{{Doctor}}');
 for(const content of ['   ','\0text'])await assert.rejects(readReportTemplate(new File([content],'layout.txt')));
});
