import test from 'node:test';import assert from 'node:assert/strict';
import {demo,blank,normalizeProposal,totals,money,markdown,readiness,MAX_ITEMS} from '../src/model.mjs';
test('sample uses explicitly fictional organizations',()=>{const d=demo();assert.equal(d.client,'Fable Coffee');assert.equal(d.items.length,3);});
test('blank form contains no client contact information',()=>{const p=blank();assert.equal(p.client,'');assert.equal(p.studio,'');});
test('calculates quoted subtotal',()=>assert.equal(totals(demo()).subtotal,4600));
test('discount is applied before tax and deposit after tax',()=>{const p=demo();p.discount=10;p.tax=20;p.deposit=25;const t=totals(p);assert.equal(t.discount,460);assert.equal(t.tax,828);assert.equal(t.total,4968);assert.equal(t.deposit,1242);assert.equal(t.balance,3726);});
test('empty invoice totals zero',()=>assert.equal(totals(blank()).total,0));
test('formatting currency works',()=>assert.match(money(1234.5,'USD'),/1,234\.50/));
test('rounded deposit and remaining balance reconcile to the quoted total',()=>{
  const p={...blank(),items:[{qty:1,rate:0.05}],deposit:50};
  const t=totals(p);
  assert.equal(t.total,0.05);assert.equal(t.deposit,0.03);assert.equal(t.balance,0.02);
  assert.equal(Math.round((t.deposit+t.balance)*100),Math.round(t.total*100));
});
test('subtotal adds rounded line amounts and rounds tax separately',()=>{
  const p={...blank(),items:[{qty:0.5,rate:0.01},{qty:0.5,rate:0.01}],tax:25,deposit:0};
  const t=totals(p);assert.equal(t.subtotal,0.02);assert.equal(t.tax,0.01);assert.equal(t.total,0.03);
});
test('JPY totals and formatting respect whole-yen minor units',()=>{
  const p={...blank(),currency:'JPY',items:[{qty:1,rate:5}],deposit:50};
  const t=totals(p);assert.equal(t.deposit,3);assert.equal(t.balance,2);assert.doesNotMatch(money(t.deposit,'JPY'),/\./);
});
test('protects against malicious JSON type input',()=>assert.throws(()=>normalizeProposal([]),/object/));
test('rejects unsupported formats',()=>assert.throws(()=>normalizeProposal({version:99,items:[]}),/Unsupported/));
test('rejects unbounded list of deliverables',()=>assert.throws(()=>normalizeProposal({...demo(),items:Array(MAX_ITEMS+1).fill({})}),/40/));
test('clamps numeric outliers',()=>{const p=normalizeProposal({...demo(),discount:999,tax:-22,items:[{title:'hello',qty:-9,rate:9e50}]});assert.equal(p.discount,100);assert.equal(p.tax,0);assert.equal(p.items[0].qty,0);assert.equal(p.items[0].rate,1_000_000);});
test('normalization does not trust arbitrary prototype keys',()=>{const p=normalizeProposal({...demo(),evil:'bad'});assert.equal('evil' in p,false);});
test('markdown escapes delimiter in table cells',()=>{const p=demo();p.items[0].title='Text | unsafe';assert.match(markdown(p),/Text   unsafe/);});
test('markdown includes essential scope boundaries',()=>{const m=markdown(demo());assert.match(m,/## Not included/);assert.match(m,/## Payment terms/);});
test('sample satisfies readiness checklist',()=>{const r=readiness(demo());assert.equal(r.done,r.total);});
test('blank proposal prompts for missing information',()=>{const r=readiness(blank());assert.ok(r.done<r.total);});
