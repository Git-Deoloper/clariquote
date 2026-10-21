import test from 'node:test';import assert from 'node:assert/strict';import {server} from '../scripts/serve.mjs';
async function request(path,method='GET') {const app=server().listen(0,'127.0.0.1');try {await new Promise(resolve=>app.once('listening',resolve));const res=await fetch(`http://127.0.0.1:${app.address().port}${path}`,{method});return {status:res.status,headers:res.headers,body:await res.text()};}finally{app.close();}}
test('serves website with privacy CSP',async()=>{const r=await request('/');assert.equal(r.status,200);assert.match(r.body,/Clariquote/);assert.match(r.headers.get('content-security-policy'),/connect-src 'none'/);});
test('serves browser modules with correct MIME type',async()=>{const r=await request('/src/model.mjs');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/javascript/);});
test('rejects non-read methods',async()=>assert.equal((await request('/','POST')).status,405));
test('rejects dotfiles',async()=>assert.equal((await request('/.gitignore')).status,403));
test('returns 404 for unknown assets',async()=>assert.equal((await request('/not-here.js')).status,404));
