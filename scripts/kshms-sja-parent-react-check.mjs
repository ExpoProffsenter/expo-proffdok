import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { SJA_STATEMENT, sjaContent, sjaDraftKey } from '../src/modules/kshms/kshmsSja.mjs';
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const dir = process.cwd(), temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'kshms-sja-qa-')), entry = path.join(temporary, 'entry.jsx');
fs.writeFileSync(entry, `import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Module from '${dir}/src/modules/kshms/KshmsModule.jsx';import Sja from '${dir}/src/modules/kshms/KshmsSja.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(context,mode='module',active=true)=>root.render(React.createElement(mode==='module'?Module:Sja,{context,active}));globalThis.__unmount=()=>root.render(null);`);
const bundle = await build({ root: dir, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"development"' }, build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'SjaProof', fileName: 'proof' } }, plugins: [react(), {
  name: 'qa-rpc', enforce: 'pre', resolveId(id) { if (/kshmsAccess\.js$/.test(id)) return '\0rpc'; if (/appSupabaseClientRegistry\.js$/.test(id)) return '\0client'; },
  load(id) { if (id === '\0rpc') return 'export const kshmsRpc=(...args)=>globalThis.__rpc(...args);'; if (id === '\0client') return 'export const getAppSupabaseClient=()=>null;'; },
}] });
const dom = new JSDOM('<main><div id="app"></div></main>', { url: 'https://example.invalid', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.IS_REACT_ACT_ENVIRONMENT = true;
window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder;
window.HTMLElement.prototype.scrollIntoView = function () {};
window.MessageChannel = class { constructor() { this.port1 = { onmessage: null }; this.port2 = { postMessage: () => setImmediate(() => this.port1.onmessage?.()) }; } };
window.confirm = () => { throw Error('Unexpected native confirmation'); };
const company = '11111111-1111-4111-8111-111111111111', otherCompany = '22222222-2222-4222-8222-222222222222', user = '33333333-3333-4333-8333-333333333333', colleague = '44444444-4444-4444-8444-444444444444';
const context = { company_id: company, user_id: user, company_name: 'SJA QA', enabled: true, manage: false, publish: false, administer: false };
const identity = { id: user, name: 'QA Prosjektleder' }, otherIdentity = { id: colleague, name: 'QA Kollega' };
const rows = new Map(), receipts = new Map(), requests = [];
let failBefore = false, failAfterCommit = false, failReadback = false, lateState = null;
window.__rpc = async (name, args) => {
  if (name === 'kshms_job_choices') return { context: { ...context, company_id: args.p_company_id }, projects: [], project_total: 0, routines: [] };
  const scoped = { ...context, company_id: args.p_company_id };
  if (name === 'kshms_get_state') return { context: scoped, settings: null, routines: [], versions: [], members: [], assignments: [], acknowledgments: [], reviews: [] };
  if (name === 'kshms_sja_state') {
    if (lateState && args.p_company_id === company) await new Promise(resolve => { lateState.resolve = resolve; });
    const items = [...rows.values()].filter(row => row.company_id === args.p_company_id && (args.p_status === 'all' || row.status === args.p_status) && `${row.title} ${row.workplace}`.includes(args.p_query || '')).reverse();
    return { context: scoped, items: structuredClone(items), total: items.length, members: [{ id: user, identity }, { id: colleague, identity: otherIdentity }] };
  }
  if (name === 'kshms_sja_detail') {
    if (failReadback) { failReadback = false; throw Error('Syntetisk tapt bekreftelse'); }
    return { context: scoped, sja: structuredClone(rows.get(args.p_id) || null) };
  }
  assert.equal(name, 'kshms_sja_command'); requests.push(structuredClone(args));
  if (failBefore) { failBefore = false; throw Error('Syntetisk nettfeil'); }
  if (receipts.has(args.p_request_id)) return receipts.get(args.p_request_id);
  const payload = args.p_payload, old = rows.get(payload.id);
  if (old?.status === 'signed') throw Error('Signert analyse kan ikke endres');
  if (old && old.revision !== payload.revision) throw Object.assign(Error('En kollega har lagret en nyere SJA.'), { code: '40001' });
  const content = sjaContent(payload.content), signed = args.p_action === 'sign';
  const row = { id: payload.id, company_id: args.p_company_id, content, title: content.title, workplace: content.workplace, project_reference: content.project_reference, revision: (old?.revision || 0) + 1, status: signed ? 'signed' : 'draft', created_by: old?.created_by || user, leader_id: content.leader_id || null, leader_identity: content.leader_id === user ? identity : content.leader_id === colleague ? otherIdentity : null, updated_at: '2026-10-07T21:00:00Z', signed_by: signed ? user : null, signed_identity: signed ? identity : null, signed_at: signed ? '2026-10-07T21:00:00Z' : null, statement: signed ? SJA_STATEMENT : null };
  rows.set(row.id, row); const result = { sja: structuredClone(row) }; receipts.set(args.p_request_id, result);
  if (failAfterCommit) { failAfterCommit = false; throw Error('Svaret ble borte etter lagring'); }
  return result;
};
window.eval((Array.isArray(bundle) ? bundle[0] : bundle).output.find(value => value.type === 'chunk').code);
const act = window.__act, document = window.document;
const button = text => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === text);
const field = key => document.querySelector(`[data-sja-field="${key}"]`);
const click = async node => { assert(node, 'Missing action'); assert(!node.matches(':disabled'), `Disabled action ${node.textContent}`); await act(async () => node.click()); };
const input = async (key, value) => {
  const node = field(key); assert(node, `Missing field ${key}`); assert(!node.matches(':disabled'), `Read-only field ${key}`);
  const proto = node.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : node.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, value); node.dispatchEvent(new window.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); });
};
const open = async title => click([...document.querySelectorAll('.sja-list-row')].find(node => node.querySelector('strong').textContent === title));
const fillComplete = async title => {
  for (const [key, value] of Object.entries({ title, workplace: 'QA arbeidssted', project_reference: 'QA-1', planned_on: '2026-10-08', leader_id: user, task: 'QA arbeidsoppgave', equipment: 'QA kontrollert utstyr', ppe: 'QA verneutstyr', emergency: 'QA beredskap', stop_conditions: 'QA stans ved endring', reviewed_on: '2026-10-07', communication: 'QA felles gjennomgang', 'steps.0.activity': 'QA arbeidstrinn', 'steps.0.hazard': 'QA fare', 'steps.0.consequence': 'QA konsekvens', 'steps.0.measures': 'QA tiltak', 'steps.0.owner': 'QA ansvarlig', 'steps.0.check': 'QA kontroll', 'participants.0.name': 'QA deltaker', 'participants.0.role': 'QA utførende', 'participants.0.involvement': 'QA innspill og gjennomgang' })) await input(key, value);
};

// Use the actual KS/HMS parent: ordinary readers get SJA, and tab changes retain the editor.
await act(async () => window.__render(context)); await click(button('SJA')); await click(button('Ny SJA'));
assert([...document.querySelectorAll('[data-sja-field]')].every(node => node.value === ''), 'A fresh SJA inherited answers');
assert(field('task').previousElementSibling.classList.contains('ks-field-hint'), 'Help moved below its field');
await input('title', 'QA utkast'); await input('task', 'Min egen avgrensning'); await input('steps.0.hazard', 'Min egen vurdering');
await click(button('Trykk eller lagret energi')); assert.equal(field('steps.0.hazard').value, 'Min egen vurdering\nTrykk eller lagret energi');
await click(button('Trykk eller lagret energi')); assert.equal(field('steps.0.hazard').value.split('\n').length, 2);
await click(button('Legg til arbeidstrinn')); assert(field('steps.1.activity')); await click(button('Fjern arbeidstrinn 2')); assert(!field('steps.1.activity'));
await click(button('Les og bekreft (0)')); assert(!document.querySelector('[role="dialog"]')); await click(button('SJA')); assert.equal(field('task').value, 'Min egen avgrensning');
await click(button('Lukk')); assert(button('Fortsett lokal kladd')); await act(async () => window.__unmount()); await act(async () => window.__render(context, 'sja'));
await click(button('Fortsett lokal kladd')); assert.equal(field('task').value, 'Min egen avgrensning'); assert.equal(document.querySelector('.sja-confirm input').checked, false);

// Failure and lost response keep the editor, focus, text and command identity for retry.
const dialog = document.querySelector('[role="dialog"]'); field('task').focus(); failBefore = true; await click(button('Lagre utkast'));
assert.equal(document.querySelector('[role="dialog"]'), dialog); assert.equal(field('task').value, 'Min egen avgrensning'); assert.equal(document.activeElement, field('task')); assert(document.body.textContent.includes('Kladden er beholdt'));
failAfterCommit = true; await click(button('Lagre utkast')); const draftRequest = requests.at(-1).p_request_id; assert.equal(rows.size, 1);
await click(button('Lagre utkast')); assert.equal(requests.at(-1).p_request_id, draftRequest); assert.equal(rows.size, 1); assert.equal(window.localStorage.getItem(sjaDraftKey(user, company)), null);
await click(button('Lukk')); await open('QA utkast'); assert.equal(field('task').value, 'Min egen avgrensning');
await input('task', 'Bekreftet utkast etter tapt svar'); failReadback = true; await click(button('Lagre utkast')); await click(button('Lukk')); await click(button('Fortsett lokal kladd'));
assert.equal(field('task').value, 'Bekreftet utkast etter tapt svar'); assert(!button('Fortsett lokal kladd'), 'Confirmed draft readback retained an obsolete revision');
await input('leader_id', colleague); assert(button('Signer SJA').disabled); assert(document.querySelector('.sja-confirm input').disabled); await click(button('Lagre utkast'));

// Newer colleague changes require deliberate comparison, while preserving local text.
await input('task', 'Min videre vurdering'); const id = [...rows.keys()][0]; rows.set(id, { ...rows.get(id), revision: rows.get(id).revision + 1, content: { ...rows.get(id).content, task: 'Kollegaens vurdering', planned_on: '2026-10-09' } });
await click(button('Lagre utkast')); assert(document.querySelector('.sja-conflict')); assert.equal(field('task').value, 'Min videre vurdering'); assert(button('Lagre utkast').disabled);
assert(document.querySelector('.sja-comparison').textContent.includes('2026-10-09')); assert(document.querySelector('.sja-comparison').textContent.includes('QA Kollega'));
await click(button('Jeg har sammenlignet – fortsett med min kladd')); assert.equal(field('task').value, 'Min videre vurdering'); await click(button('Lagre utkast')); assert.equal(rows.get(id).content.task, 'Min videre vurdering');

// Own explicit signature, confirmed readback, immutable history and a blank next job.
await fillComplete('QA signert'); await click(button('Signer SJA')); assert(document.querySelector('.sja-missing').textContent.includes('Bekreft egen gjennomgang')); assert.equal(document.querySelectorAll('.sja-missing li').length,1); assert.equal(rows.get(id).status, 'draft');
await click(document.querySelector('.sja-confirm input')); failReadback = true; await click(button('Signer SJA')); assert.equal(rows.get(id).status, 'signed'); assert.equal(field('title').value, 'QA signert'); assert(button('Signer SJA'));
const signRequest = requests.at(-1).p_request_id; await click(button('Signer SJA')); assert.equal(requests.at(-1).p_request_id, signRequest); assert(!button('Signer SJA')); assert(field('title').matches(':disabled')); assert(document.body.textContent.includes('Signert av QA Prosjektleder'));
const first = structuredClone(rows.get(id)); await click(document.querySelector('[aria-label="Lukk SJA"]')); await act(async () => window.__unmount()); await act(async () => window.__render(context, 'sja')); await open('QA signert');
assert.equal(field('task').value, first.content.task); assert(field('task').matches(':disabled')); assert(!button('Lagre utkast')); await click(document.querySelector('[aria-label="Lukk SJA"]')); await click(button('Ny SJA'));
assert([...document.querySelectorAll('[data-sja-field]')].every(node => node.value === '')); await fillComplete('QA signert med tapt svar'); await click(document.querySelector('.sja-confirm input')); failAfterCommit = true; await click(button('Signer SJA'));
assert.equal(rows.size, 2); await click(button('Lukk')); await click(button('Fortsett lokal kladd')); assert(field('title').matches(':disabled')); assert(!button('Fortsett lokal kladd'), 'Confirmed signed job left a blocking local draft');
await click(document.querySelector('[aria-label="Lukk SJA"]')); await click(button('Ny SJA')); assert.equal(field('title').value, ''); assert.deepEqual(rows.get(id), first);

// Unsaved text can only be discarded after an explicit confirmation.
await input('title', 'QA lokal tekst'); await click(button('Lukk')); await click(button('Forkast lokal kladd')); assert(button('Fortsett lokal kladd')); await click(button('Behold kladden')); assert(button('Fortsett lokal kladd')); await click(button('Forkast lokal kladd')); await click(button('Ja, forkast lokal kladd')); assert(!button('Fortsett lokal kladd')); assert.deepEqual(rows.get(id), first);

// An old company's delayed reply cannot repopulate the active company's page.
await act(async () => window.__unmount()); lateState = {}; await act(async () => window.__render(context, 'sja')); await act(async () => window.__render({ ...context, company_id: otherCompany, company_name: 'Annet firma' }, 'sja')); await act(async () => lateState.resolve()); lateState = null;
assert.equal(document.querySelectorAll('.sja-list-row').length, 0); await click(button('Ny SJA')); assert.equal(field('title').value, ''); assert.equal(document.querySelector('.deviation-dialog-header').textContent.includes('Annet firma'), true);
await act(async () => window.__unmount()); dom.window.close(); fs.rmSync(temporary, { recursive: true, force: true });
console.log('SJA actual React flow: PASS — blank form, hints above fields, opt-in suggestions, parent tabs, draft recovery, failed/lost replies, colleague conflict, own signature, immutable history and company change. Transport is simulated; SQL is verified separately.');
