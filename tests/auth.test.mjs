import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/auth-feedback.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {authFeedback,passwordValidation}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('registration rejects short passwords and mismatched confirmation',()=>{
 assert.ok(passwordValidation('short','short'));
 assert.ok(passwordValidation('valid-passphrase','different-passphrase'));
 assert.equal(passwordValidation('valid-passphrase','valid-passphrase'),null);
});
test('untrusted callback errors never become displayed messages',()=>{
 const supplied='https://malicious.example/?token=secret';
 assert.ok(!authFeedback(supplied).includes(supplied));
 assert.match(authFeedback('email_not_confirmed'),/verifikasi/);
 assert.match(authFeedback('access_denied'),/dibatalkan/);
});

test('provider exchange failures are distinguished from expired links',()=>{assert.match(authFeedback('provider_exchange'),/Client Secret/);assert.ok(!authFeedback('provider_exchange').includes('kedaluwarsa'))});
