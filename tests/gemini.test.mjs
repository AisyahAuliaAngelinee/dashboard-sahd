import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compiled=ts.transpileModule(fs.readFileSync(new URL('../lib/gemini.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};new Function('exports','module',compiled)(module.exports,module);
const {parseSuggestion,geminiGenerate}=module.exports;
test('Gemini recommendation ignores thought text and rejects malformed or oversized output',()=>{
 assert.deepEqual(parseSuggestion([{thought:true,text:'private reasoning'},{text:'{"title":"Case title","narrative":"English narrative"}'}]),{title:'Case title',narrative:'English narrative'});
 for(const text of ['{}','{"title":"","narrative":"x"}',JSON.stringify({title:'x'.repeat(201),narrative:'x'})])assert.throws(()=>parseSuggestion([{text}]));
});
test('Gemini request keeps key in header and sanitizes provider errors',async()=>{
 const original=global.fetch,key=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-key';
 try{global.fetch=async(url,options)=>{assert.ok(!url.includes('test-key'));assert.equal(options.headers['x-goog-api-key'],'test-key');return {ok:false,status:429}};await assert.rejects(()=>geminiGenerate('test-model','case',{}),/Kuota Gemini/);
 global.fetch=async()=>({ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial'}]}}]})});await assert.rejects(()=>geminiGenerate('test-model','case',{}),/tidak menyelesaikan/);
 }finally{global.fetch=original;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key}
});
