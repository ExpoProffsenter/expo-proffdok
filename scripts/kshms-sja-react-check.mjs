import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { blankSja, sjaContent, sjaDraftKey, SJA_STATEMENT } from '../src/modules/kshms/kshmsSja.mjs';

// Real component and handlers; only transport is replaced. No login or live data.
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const dir = process.cwd(), temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'kshms-sja-react-'));
const entry = path.join(temporary, 'entry.jsx');
fs.writeFileSync(entry, `import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Sja from '${dir}/src/modules/kshms/KshmsSja.jsx';import ProjectEntry from '${dir}/src/modules/kshms/ProjectSjaEntry.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=props=>root.render(React.createElement(Sja,{...props,key:props.context.company_id+':'+props.context.user_id}));globalThis.__renderProject=props=>root.render(React.createElement(ProjectEntry,{...props,key:props.projectId}));globalThis.__unmount=()=>root.render(null);`);
const bundled = await build({ root: dir, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"development"' }, build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'SjaProof', cssFileName: 'sja-proof' } }, plugins: [react(), { name: 'scoped-rpc', enforce: 'pre', resolveId(id) { if (/kshmsAccess\.js$/.test(id)) return '\0rpc'; }, load(id) { if (id === '\0rpc') return 'export const kshmsRpc=(...args)=>globalThis.__rpc(...args);'; } }] });
const dom = new JSDOM('<div id="app"></div>', { url: 'https://example.invalid', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.IS_REACT_ACT_ENVIRONMENT = true;
window.TextEncoder = TextEncoder;
window.MessageChannel = class { constructor() { this.port1 = { onmessage: null }; this.port2 = { postMessage: () => setImmediate(() => this.port1.onmessage?.()) }; } };
const company = '11111111-1111-4111-8111-111111111111', user = '22222222-2222-4222-8222-222222222222', colleague = '33333333-3333-4333-8333-333333333333';
const context = { company_id: company, user_id: user, enabled: true, manage: true, company_name: 'SJA QA' };
const members = [{ id: user, identity: { id: user, name: 'QA leader' } }, { id: colleague, identity: { id: colleague, name: 'QA colleague' } }];
const rows = new Map(), receipts = new Map(), commands = [];
const projectOne='55555555-5555-4555-8555-555555555555',projectTwo='66666666-6666-4666-8666-666666666666';
const projectName=id=>id===projectOne?'QA prosjekt én':'QA prosjekt to';
let mode = '', detailDeferred = null, stateDeferred = null, stateReads = 0;
const detail = (id, scope = context) => ({ context: scope, sja: structuredClone(rows.get(id) || null) });
window.__rpc = async (name, args) => {
  if (name === 'kshms_project_report' || name === 'kshms_project_execution_report') return { context: { ...context, project_id: args.p_project_id }, choices: { sjas: [...rows.values()].filter(row => row.project_id === args.p_project_id).map(row => ({ id: row.id, status: row.status })), ruhs: [], rounds: [], risks: [] } };
  if (name === 'kshms_job_choices') return { context: { ...context, company_id: args.p_company_id }, projects: [], project_total: 0, routines: [] };
  if (name === 'kshms_sja_state' || name === 'kshms_project_sja_state') {
    stateReads++;
    if (stateDeferred) return stateDeferred.promise;
    const items = [...rows.values()].filter(row => row.company_id === args.p_company_id&&(!args.p_project_id||row.project_id===args.p_project_id)).map(row => ({ ...row, ...row.content, content: undefined }));
    return { context: { ...context, company_id: args.p_company_id, project_id: args.p_project_id }, project:args.p_project_id?{id:args.p_project_id,name:projectName(args.p_project_id),locked:false}:null, members, total: items.length, items };
  }
  if (name === 'kshms_sja_detail') {
    if (detailDeferred) return detailDeferred.promise;
    if (mode === 'denied') throw Object.assign(Error('Synthetic access revoked'), { code: '42501' });
    return detail(args.p_id);
  }
  assert.equal(name, 'kshms_sja_command');
  commands.push(structuredClone(args));
  if (mode === 'fail-save') { mode = ''; throw Error('Synthetic network error'); }
  if (receipts.has(args.p_request_id)) return structuredClone(receipts.get(args.p_request_id));
  const before = rows.get(args.p_payload.id);
  if (before?.revision !== undefined && before.revision !== args.p_payload.revision) throw Object.assign(Error('Synthetic revision conflict'), { code: '40001' });
  const content = sjaContent(args.p_payload.content), signed = args.p_action === 'sign';
  const row = { id: args.p_payload.id, company_id: company, project_id:args.p_payload.project_id||null, project_name:args.p_payload.project_id?projectName(args.p_payload.project_id):null, content, revision: (before?.revision || 0) + 1, status: signed ? 'signed' : 'draft', created_by: user, leader_id: content.leader_id, leader_identity: members.find(member => member.id === content.leader_id)?.identity, signed_by: signed ? user : null, signed_identity: signed ? members[0].identity : null, signed_at: signed ? '2026-10-07T21:35:00Z' : null, statement: signed ? SJA_STATEMENT : null };
  rows.set(row.id, row); const result = { sja: row }; receipts.set(args.p_request_id, structuredClone(result));
  if (mode === 'lost-sign') { mode = ''; throw Error('Synthetic lost response after signature commit'); }
  return structuredClone(result);
};
window.eval((Array.isArray(bundled) ? bundled[0] : bundled).output.find(item => item.type === 'chunk').code);
const act = window.__act, doc = window.document;
const button = text => [...doc.querySelectorAll('button')].find(node => (node.getAttribute('aria-label') || node.textContent.trim()) === text);
const field = key => doc.querySelector(`[data-sja-field="${key}"]`);
const click = async node => { assert(node, 'Missing button'); assert(!node.matches(':disabled'), node.textContent); await act(async () => node.click()); };
const write = async (key, value) => {
  const input = field(key); assert(input, key); assert(!input.matches(':disabled'), `${key} disabled`);
  await act(async () => { const proto = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : input.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value); input.dispatchEvent(new window.Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); });
};
const defer = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const render = async props => act(async () => window.__render({ context, ...props }));

await render(); await click(button('Ny SJA'));
for (const input of doc.querySelectorAll('[data-sja-field]')) assert.equal(input.value, '', `New job inherited ${input.dataset.sjaField}`);
const hint = field('task').getAttribute('aria-describedby'); assert(doc.getElementById(hint));
assert(doc.getElementById(hint).compareDocumentPosition(field('task')) & window.Node.DOCUMENT_POSITION_FOLLOWING);
for(const node of doc.querySelectorAll('[data-sja-field]'))if(node.type!=='date'&&node.tagName!=='SELECT')assert(node.closest('.sja-field').querySelector('.sja-suggestions'),`No selectable suggestions for ${node.dataset.sjaField}`);
await click(button('Signer SJA'));assert.equal(commands.length,0,'Incomplete form sent a signature');
const missing=doc.querySelector('.sja-missing');assert.equal(doc.activeElement,missing,'Missing-field warning did not receive focus');assert(missing.textContent.includes('Arbeidstrinn 1: Mulige konsekvenser'));assert(missing.textContent.includes('Deltaker 1: Bidrag / gjennomgang'));assert(missing.textContent.includes('Bekreft egen gjennomgang'));
assert.equal(field('task').getAttribute('aria-invalid'),'true');await click(button('Arbeidsoppgave'));assert.equal(doc.activeElement,field('task'));await click(button('Signer SJA'));assert.equal(doc.activeElement,missing,'Second attempt left the warning out of view');
await write('title', 'QA SJA'); await write('steps.0.hazard', 'Own hazard'); await click(button('Trykk eller lagret energi'));
assert.equal(field('steps.0.hazard').value, 'Own hazard\nTrykk eller lagret energi');
await render({ active: false }); assert.equal(doc.querySelector('[role="dialog"]'), null);
await render({ active: true }); assert.equal(field('title').value, 'QA SJA');
mode = 'fail-save'; await click(button('Lagre utkast')); assert(field('title')); assert(window.localStorage.getItem(sjaDraftKey(user, company)));
await click(button('Lagre utkast')); assert.equal(commands[0].p_request_id, commands[1].p_request_id); assert.equal(rows.size, 1);
const savedId = [...rows.keys()][0]; assert.equal(window.localStorage.getItem(sjaDraftKey(user, company)), null);
const dialog = doc.querySelector('[role="dialog"]'); dialog.scrollTop = 420;
await write('task', 'Own unsaved task'); await click(button('Lagre utkast')); assert.equal(doc.querySelector('[role="dialog"]'), dialog); assert.equal(dialog.scrollTop, 420);

await write('task', 'Local continuation'); await click(button('Lukk'));
detailDeferred = defer(); await click(button('Fortsett lokal kladd'));
assert(field('task').matches(':disabled'), 'Local form enabled before server read'); assert(button('Lagre utkast').disabled);
await act(async () => detailDeferred.resolve(detail(savedId))); detailDeferred = null;
assert.equal(field('task').value, 'Local continuation'); assert(!button('Lagre utkast').disabled);
await click(button('Lukk'));
const changed = rows.get(savedId); rows.set(savedId, { ...changed, revision: changed.revision + 1, content: { ...changed.content, task: 'Colleague task' } });
await click(button('Fortsett lokal kladd')); assert(button('Lagre utkast').disabled);
assert(doc.body.textContent.includes('Colleague task')); assert.equal(field('task').value, 'Local continuation');
await click(button('Jeg har sammenlignet – fortsett med min kladd')); await click(button('Lagre utkast'));
assert.equal(rows.get(savedId).content.task, 'Local continuation');

await write('task', 'Keep this through denied read'); await click(button('Lukk')); mode = 'denied';
await click(button('Fortsett lokal kladd')); assert(field('task').matches(':disabled')); assert(button('Lagre utkast').disabled);
assert.equal(field('task').value, 'Keep this through denied read'); mode = ''; await click(button('Prøv å åpne igjen')); assert(!button('Lagre utkast').disabled);
await click(button('Lagre utkast'));
for (const [key, value] of Object.entries({ workplace: 'QA place', planned_on: '2026-10-08', reviewed_on: '2026-10-07', equipment: 'QA equipment checked', ppe: 'QA PPE', emergency: 'QA emergency', stop_conditions: 'Stop when conditions change', communication: 'QA joint review', 'steps.0.activity': 'QA work step', 'steps.0.consequence': 'QA harm', 'steps.0.measures': 'QA safeguards', 'steps.0.owner': 'QA owner', 'steps.0.check': 'QA before-start check', 'participants.0.name': 'QA worker', 'participants.0.role': 'Worker', 'participants.0.involvement': 'Reviewed work steps and safeguards' })) await write(key, value);
await write('leader_id', colleague); assert(button('Signer SJA').disabled, 'Other person allowed to sign');
await write('leader_id', user); const beforeSign = commands.length; await click(button('Signer SJA')); assert.equal(commands.length, beforeSign, 'Unchecked signature submitted');
assert.equal(doc.querySelectorAll('.sja-missing li').length,1,'Completed form still shows missing fields');await click(button('Bekreft egen gjennomgang'));assert.equal(doc.activeElement,doc.querySelector('.sja-confirm input'));
await click(doc.querySelector('.sja-confirm input')); mode = 'lost-sign'; await click(button('Signer SJA'));
assert(field('task')); assert(window.localStorage.getItem(sjaDraftKey(user, company)), 'Lost response erased draft');
await click(button('Signer SJA')); assert.equal(commands.at(-1).p_request_id, commands.at(-2).p_request_id);
assert.equal(rows.get(savedId).status, 'signed'); assert(field('task').matches(':disabled')); assert.equal(button('Lagre utkast'), undefined);
assert(doc.body.textContent.includes('Signert av QA leader')); assert.equal(window.localStorage.getItem(sjaDraftKey(user, company)), null);
await click(doc.querySelector('[aria-label="Lukk SJA"]')); await click(button('Ny SJA'));
for (const input of doc.querySelectorAll('[data-sja-field]')) assert.equal(input.value, '', 'Signed job copied into new SJA');
await click(button('Lukk'));

// A stale local text must never be displayed as the signed document.
const stale = { ...blankSja(), id: savedId, revision: 1, content: { ...rows.get(savedId).content, task: 'Different unsaved local task' } };
window.localStorage.setItem(sjaDraftKey(user, company), JSON.stringify({ userId: user, companyId: company, editor: stale }));
await act(async () => window.__unmount()); await render(); await click(button('Fortsett lokal kladd'));
assert.equal(field('task').value, rows.get(savedId).content.task); assert(field('task').matches(':disabled'));
assert(doc.body.textContent.includes('Different unsaved local task')); assert(window.localStorage.getItem(sjaDraftKey(user, company)));
await click(button('Bruk lagret SJA og forkast lokal kladd')); assert.equal(window.localStorage.getItem(sjaDraftKey(user, company)), null);
await click(doc.querySelector('[aria-label="Lukk SJA"]')); await click(button('Ny SJA')); await write('title', 'Abandoned new job'); await click(button('Lukk'));
await click(button('Forkast lokal kladd')); await click(button('Ja, forkast lokal kladd')); assert.equal(rows.size, 1, 'Discard removed server document');

// Late old-firm responses cannot reopen the old workspace or erase its draft.
await click(button('Ny SJA')); await write('title', 'Old company local work'); await click(button('Lukk'));
detailDeferred = defer(); await click(button('Fortsett lokal kladd')); const pendingDetail = detailDeferred; detailDeferred = null;
const foreign = { ...context, company_id: '44444444-4444-4444-8444-444444444444', company_name: 'Other QA company' };
await render({ context: foreign }); await act(async () => pendingDetail.resolve(detail(null)));
assert.equal(doc.querySelector('[role="dialog"]'), null); assert(!doc.body.textContent.includes('Old company local work'));
assert(window.localStorage.getItem(sjaDraftKey(user, company)), 'Company switch erased old draft');
stateDeferred = defer(); await act(async () => window.__unmount()); await render();
assert(button('Fortsett lokal kladd').disabled, 'Editor could open before initial server state');
await act(async () => stateDeferred.resolve({ context, members, total: 1, items: [] })); stateDeferred = null;
// The same editor is reused by a project. A separate scope preserves the global draft.
await act(async()=>window.__unmount());await render({projectId:projectOne});await click(button('Ny SJA'));
assert([...doc.querySelectorAll('[data-sja-field]')].every(node=>node.value===''),'Project context filled risk answers');
assert(doc.querySelector('.sja-project-link').textContent.includes('QA prosjekt én'));
await write('title','QA prosjektanalyse');await click(button('Lagre utkast'));const linked=[...rows.values()].find(row=>row.project_id===projectOne);assert(linked);assert.equal(linked.project_id,projectOne);assert(!doc.querySelector('.sja-list').textContent.includes('QA SJA'),'Project list included a standalone job');
await write('task','Prosjektkladd som skal bevares');await click(button('Lukk'));assert(window.localStorage.getItem(sjaDraftKey(user,company,projectOne)));assert(window.localStorage.getItem(sjaDraftKey(user,company)),'Project work erased previous global draft');
await act(async()=>window.__unmount());await render({projectId:projectTwo});assert.equal(doc.querySelectorAll('.sja-list-row').length,0);assert(!button('Fortsett lokal kladd'),'Another project inherited a local draft');await click(button('Ny SJA'));assert.equal(field('title').value,'');await click(button('Lukk'));
await act(async()=>window.__unmount());await render({projectId:projectOne});await click(button('Fortsett lokal kladd'));assert.equal(field('task').value,'Prosjektkladd som skal bevares');assert(doc.querySelector('.sja-project-link').textContent.includes('QA prosjekt én'));await click(button('Lagre utkast'));await click(button('Lukk'));
await render({projectId:projectOne,scopeReadOnly:true});assert(button('Ny SJA').disabled,'Read-only project allowed creation');await click(doc.querySelector('.sja-list-row'));assert(field('task').matches(':disabled'));assert(!button('Lagre utkast'),'Read-only project allowed changes');await click(doc.querySelector('[aria-label="Lukk SJA"]'));
await act(async()=>window.__unmount());const readsBeforeEntry=stateReads;
await act(async()=>window.__renderProject({context:{...context,enabled:false},projectId:projectOne}));assert(!button('Åpne SJA'));assert.equal(stateReads,readsBeforeEntry,'Unauthorized entry fetched SJA');
await act(async()=>window.__renderProject({context,projectId:projectOne}));assert(button('Åpne SJA'));assert.equal(stateReads,readsBeforeEntry,'Closed project entry fetched SJA');await click(button('Åpne SJA'));assert(doc.querySelector('.sja-list-row').textContent.includes('QA prosjektanalyse'));await click(button('Lukk SJA-oversikten'));assert(doc.querySelector('.ks-project-sja [hidden]'));await click(button('Åpne SJA'));await click(button('Ny SJA'));await write('title','Kladd fra prosjektinngang');
await act(async()=>window.__renderProject({context:{...context,enabled:false},projectId:projectOne}));assert(!doc.querySelector('[role="dialog"]'));assert(window.localStorage.getItem(sjaDraftKey(user,company,projectOne)),'Access change erased project draft');
await act(async () => window.__unmount()); dom.window.close(); fs.rmSync(temporary, { recursive: true, force: true });
console.log('Real React SJA: PASS — blank form, hints, chosen suggestions, hidden tabs, save failure/retry, stable scroll, server-first resume, conflict choice, revoked-read lock, own explicit signature, lost-response retry, immutable signed view, stale local comparison/discard and company-change cancellation.');
