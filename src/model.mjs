export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'EGP', 'INR', 'AED', 'SAR', 'JPY'];
export const THEMES = ['plum', 'forest', 'mono'];
export const MAX_ITEMS = 40;
const TEXT_LIMIT = 5000;
const number = (value, max = 1_000_000) => Math.min(max, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
const clean = (v, max = TEXT_LIMIT) => String(v ?? '').slice(0, max).trim();
export const demo = () => ({
  version: 1, theme: 'plum', currency: 'USD',
  studio: 'Northstar Studio', client: 'Fable Coffee',
  title: 'A fresh digital home for Fable', reference: 'PROPOSAL / 001',
  summary: 'A thoughtful, accessible website that tells your story, highlights the menu and makes it easier for visitors to find their next favorite coffee.',
  created: '2026-10-21', validUntil: '2026-11-20', days: '21',
  items: [
    { title: 'Discovery & direction', detail: 'Kickoff, content audit, and visual direction', qty: 1, rate: 600 },
    { title: 'Website design', detail: 'Responsive layouts for five core pages', qty: 1, rate: 1800 },
    { title: 'Build & launch', detail: 'Implementation, QA, and handover', qty: 1, rate: 2200 }
  ],
  included: 'Five responsive pages\nAccessible navigation and forms\nTwo rounds of consolidated feedback',
  excluded: 'Ongoing hosting and maintenance\nNew photography or copywriting\nThird-party subscriptions',
  assumptions: 'Client supplies approved content and feedback within three working days.',
  deposit: 40, tax: 0, discount: 0,
  payment: 'Deposit confirms the schedule. Remaining balance is due on delivery.',
  next: 'Approve the scope, confirm a kickoff date, and share existing brand assets.'
});
export const blank = () => ({ ...demo(), studio: '', client: '', title: '', reference: '', summary: '', created: '', validUntil: '', days: '', items: [{ title: '', detail: '', qty: 1, rate: 0 }], included: '', excluded: '', assumptions: '', deposit: 40, tax: 0, discount: 0, payment: '', next: '' });
export function normalizeProposal(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('A proposal object is required.');
  if (input.version !== 1) throw Error('Unsupported file format. Expected Clariquote version 1.');
  if (!Array.isArray(input.items) || input.items.length > MAX_ITEMS) throw Error('The proposal must contain at most 40 deliverables.');
  const safe = blank();
  for (const k of ['studio','client','title','reference','summary','created','validUntil','days','included','excluded','assumptions','payment','next']) safe[k] = clean(input[k],k==='included'||k==='excluded'?2500:TEXT_LIMIT);
  safe.currency = CURRENCIES.includes(input.currency) ? input.currency : 'USD';
  safe.theme = THEMES.includes(input.theme) ? input.theme : 'plum';
  safe.deposit = number(input.deposit,100);
  safe.tax = number(input.tax,100);
  safe.discount = number(input.discount,100);
  safe.items = input.items.map(item => ({
    title: clean(item?.title,200), detail: clean(item?.detail,700), qty: number(item?.qty,10000), rate: number(item?.rate,1_000_000)
  }));
  if (!safe.items.length) safe.items = [{title:'',detail:'',qty:1,rate:0}];
  return safe;
}
export function totals(p) {
  const subtotal = p.items.reduce((sum, item) => sum + number(item.qty,10000) * number(item.rate,1_000_000), 0);
  const discount = subtotal * number(p.discount,100)/100;
  const taxable = subtotal - discount;
  const tax = taxable * number(p.tax,100)/100;
  const total = taxable + tax;
  const deposit = total * number(p.deposit,100)/100;
  return {subtotal, discount, taxable, tax, total, deposit, balance: total-deposit};
}
export function money(v, currency='USD') {
  try { return new Intl.NumberFormat('en', {style:'currency',currency: CURRENCIES.includes(currency)?currency:'USD',maximumFractionDigits:2}).format(v); }
  catch { return `${Number(v).toFixed(2)} ${currency}`; }
}
export function markdown(p) {
  const t=totals(p), m=n=>money(n,p.currency), lines=s=>s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>`- ${x}`).join('\n') || 'To be confirmed';
  const items=p.items.map(x=>`| ${cell(x.title)||'Deliverable'} | ${cell(x.detail)} | ${x.qty} | ${m(x.rate)} | ${m(x.qty*x.rate)} |`).join('\n');
  return `# ${p.title||'Project proposal'}\n\n**Prepared by:** ${p.studio||'—'}  \n**Prepared for:** ${p.client||'—'}  \n**Reference:** ${p.reference||'—'}  \n**Date:** ${p.created||'—'}  \n**Valid until:** ${p.validUntil||'—'}\n\n## The opportunity\n${p.summary||'To be confirmed'}\n\n## Scope & investment\n| Deliverable | Details | Qty | Rate | Amount |\n|---|---|---:|---:|---:|\n${items}\n\nSubtotal: ${m(t.subtotal)}  \nDiscount (${p.discount}%): −${m(t.discount)}  \nTax (${p.tax}%): ${m(t.tax)}  \n**Total: ${m(t.total)}**  \nDeposit (${p.deposit}%): ${m(t.deposit)}  \nBalance: ${m(t.balance)}\n\n## Included\n${lines(p.included)}\n\n## Not included\n${lines(p.excluded)}\n\n## Assumptions\n${p.assumptions||'To be confirmed'}\n\n## Timeline\n${p.days ? `${p.days} working days (estimated)`:'To be agreed'}\n\n## Payment terms\n${p.payment||'To be agreed'}\n\n## Next steps\n${p.next||'To be agreed'}\n\n---\n*Review and agree on scope, price and terms before work begins. This document is not a legal contract.*\n`;
}
function cell(x) { return String(x).replace(/[|\r\n]/g,' ').trim(); }
export function readiness(p) {
  const checks=[['A project title', !!p.title],['Your studio or name',!!p.studio],['A client name',!!p.client],['A project summary',!!p.summary],['Described deliverables',p.items.length>0&&p.items.every(x=>x.title&&x.rate>=0)],['Scope boundaries',!!p.included&&!!p.excluded],['Payment terms',!!p.payment],['Proposal validity date',!!p.validUntil]];
  return {checks, done:checks.filter(x=>x[1]).length, total:checks.length};
}
