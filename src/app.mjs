import {demo, blank, normalizeProposal, totals, money, markdown, readiness, MAX_ITEMS} from './model.mjs';
let proposal=demo();
const $=id=>document.getElementById(id);
const fields=[...document.querySelectorAll('[data-field]')];
const text=(id,value)=>$(id).textContent=value;
const formatDate=v=>v&&/^\d{4}-\d{2}-\d{2}$/.test(v)?new Date(`${v}T12:00:00`).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}):'To be agreed';
function message(value){const toast=$('toast');toast.textContent=value;toast.hidden=false;clearTimeout(message.timeout);message.timeout=setTimeout(()=>toast.hidden=true,3200);}
function loadForm(){for(const el of fields)el.value=proposal[el.dataset.field]??'';document.querySelectorAll('[data-theme]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.theme===proposal.theme)));renderItemsEditor();renderPreview();}
function el(tag,klass='',value){const node=document.createElement(tag);if(klass)node.className=klass;if(value!==undefined)node.textContent=String(value);return node;}
function control(label,field,index,type='text'){
 const wrap=el('label');wrap.append(document.createTextNode(label));const input=el(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;
 if(type==='number'){input.min='0';input.max=field==='qty'?'10000':'1000000';input.step=field==='qty'?'0.5':'0.01';}
 input.value=proposal.items[index][field];input.dataset.itemIndex=index;input.dataset.itemField=field;input.maxLength=field==='title'?200:field==='detail'?700:undefined;wrap.append(input);return wrap;
}
function renderItemsEditor(){const root=$('itemEditor');root.replaceChildren();proposal.items.forEach((item,index)=>{
  const card=el('div','item-card');const head=el('div','item-head');head.append(el('span','',`DELIVERABLE ${String(index+1).padStart(2,'0')}`));
  const remove=el('button','remove-item','Remove');remove.type='button';remove.dataset.removeItem=index;remove.setAttribute('aria-label',`Remove deliverable ${index+1}`);head.append(remove);card.append(head);
  card.append(control('Deliverable', 'title',index),control('Description','detail',index,'textarea'));
  const row=el('div','item-row');row.append(control('Quantity','qty',index,'number'),control('Rate','rate',index,'number'));card.append(row);root.append(card);
 });$('addItem').disabled=proposal.items.length>=MAX_ITEMS;
}
function renderList(id,value){const root=$(id);root.replaceChildren();const items=String(value).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);for(const item of items.slice(0,60))root.append(el('li','',item));if(!items.length)root.append(el('li','','To be confirmed'));}
function renderPreview(){const t=totals(proposal),m=v=>money(v,proposal.currency),r=readiness(proposal);
  $('paper').dataset.theme=proposal.theme;
  text('p-studio',proposal.studio||'Your studio');text('p-reference',proposal.reference||'PROPOSAL');text('p-client',proposal.client||'Your client');
  text('p-created',formatDate(proposal.created));text('p-valid',formatDate(proposal.validUntil));text('p-title',proposal.title||'Your next great project');text('p-summary',proposal.summary||'A clear overview of the work, the value, and what comes next.');
  const root=$('p-items');root.replaceChildren();for(const item of proposal.items){const row=el('div','paper-item');const details=el('div');details.append(el('strong','',item.title||'New deliverable'));if(item.detail)details.append(el('p','',item.detail));details.append(el('p','',`${item.qty} × ${m(item.rate)}`));row.append(details,el('span','item-amount',m(item.qty*item.rate)));root.append(row);}
  text('p-subtotal',m(t.subtotal));text('p-discount-label',`Discount (${proposal.discount}%)`);text('p-discount',`−${m(t.discount)}`);text('p-tax-label',`Tax (${proposal.tax}%)`);text('p-tax',m(t.tax));text('p-total',m(t.total));renderList('p-included',proposal.included);renderList('p-excluded',proposal.excluded);
  text('p-assumptions',`Assumptions · ${proposal.assumptions||'To be confirmed'}`);text('p-days',proposal.days?`${proposal.days} working days`:'To be agreed');text('p-deposit',m(t.deposit));text('p-balance',m(t.balance));text('p-payment',proposal.payment||'Payment terms to be agreed.');text('p-next',proposal.next||'The next step is yours.');
  text('readinessCount',`${r.done}/${r.total}`);text('readinessLabel',r.done===r.total?'Ready for your final review':'Proposal completeness');$('readinessProgress').style.width=`${100*r.done/r.total}%`;
  text('workspaceStatus',`${proposal.client||'New client'} · Unsaved in this tab`);document.title=`${proposal.title||'Create a proposal'} — Clariquote`;
}
function setTab(tab){document.querySelectorAll('[data-tab]').forEach(b=>{const selected=b.dataset.tab===tab;b.setAttribute('aria-selected',String(selected));});document.querySelectorAll('.editor-panel').forEach(panel=>{const active=panel.id===`panel-${tab}`;panel.classList.toggle('active',active);panel.hidden=!active;});}
for(const btn of document.querySelectorAll('[data-tab]'))btn.addEventListener('click',()=>setTab(btn.dataset.tab));
for(const el of fields)el.addEventListener('input',()=>{const key=el.dataset.field;proposal[key]=['deposit','tax','discount'].includes(key)?Math.max(0,Math.min(100,Number(el.value)||0)):el.value;renderPreview();});
for(const btn of document.querySelectorAll('[data-theme]'))btn.addEventListener('click',()=>{proposal.theme=btn.dataset.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));renderPreview();});
$('itemEditor').addEventListener('input',event=>{const target=event.target;if(!target.matches('[data-item-index]'))return;const index=Number(target.dataset.itemIndex),key=target.dataset.itemField;if(!proposal.items[index])return;proposal.items[index][key]=['qty','rate'].includes(key)?Math.min(key==='qty'?10000:1_000_000,Math.max(0,Number(target.value)||0)):target.value;renderPreview();});
$('itemEditor').addEventListener('click',event=>{const target=event.target.closest('[data-remove-item]');if(!target)return;const index=Number(target.dataset.removeItem);if(proposal.items.length===1){message('Keep at least one deliverable.');return;}proposal.items.splice(index,1);renderItemsEditor();renderPreview();});
$('addItem').addEventListener('click',()=>{if(proposal.items.length>=MAX_ITEMS){message('Maximum of 40 deliverables.');return;}proposal.items.push({title:'',detail:'',qty:1,rate:0});renderItemsEditor();renderPreview();const inputs=$('itemEditor').querySelectorAll('[data-item-field="title"]');inputs[inputs.length-1]?.focus();});
function useSample(){proposal=demo();loadForm();setTab('details');message('A fictional example is ready to explore.');}
$('sampleBtn').addEventListener('click',useSample);$('heroDemo').addEventListener('click',useSample);
$('newBtn').addEventListener('click',()=>{if(!confirm('Start a new proposal? Your current unsaved changes will be lost.'))return;proposal=blank();loadForm();setTab('details');message('Blank proposal created.');});
function download(name,blob){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('saveBtn').addEventListener('click',()=>{download('clariquote-proposal.json',new Blob([JSON.stringify(proposal,null,2)],{type:'application/json'}));message('Editable backup downloaded.');});
$('importBtn').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>500_000){message('The JSON file is too large.');return;}try{proposal=normalizeProposal(JSON.parse(await file.text()));loadForm();setTab('details');message('Proposal loaded locally.');}catch(err){message(`Unable to import: ${err.message}`);}});
$('copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(markdown(proposal));message('Markdown copied to clipboard.');}catch{download('proposal.md',new Blob([markdown(proposal)],{type:'text/markdown'}));message('Markdown downloaded (clipboard unavailable).');}});
function print(){const r=readiness(proposal);if(r.done<r.total)message(`Review the proposal before sending (${r.done}/${r.total} checks).`);window.print();}
$('printBtn').addEventListener('click',print);$('printBtn2').addEventListener('click',print);
loadForm();
if('serviceWorker' in navigator && location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
