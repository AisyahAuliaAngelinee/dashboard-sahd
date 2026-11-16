import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const model=(file)=>JSON.parse(readFileSync(new URL('../public/human-atlas/models/'+file+'.json',import.meta.url)));
for(const [sex,catalogue] of [['male','atlas'],['female','atlas-female']]){
 test(sex+' discovery scopes only contain selectable parts of the active model',()=>{
  const parts=new Set(model(catalogue).parts.map(part=>part.id));
  const {regions,areas}=model('discovery-'+sex);
  assert.equal(regions.length,9);
  assert.equal(areas.length,17);
  for(const group of [...regions,...areas]){
   assert.ok(group.elements.length);
   assert.equal(new Set(group.elements).size,group.elements.length);
   assert.ok(group.elements.every(id=>parts.has(id)));
  }
 });
}
