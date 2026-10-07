import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { sjaContent, sjaDraftKey } from '../src/modules/kshms/kshmsSja.mjs';
import { deviationDraftKey } from '../src/modules/kshms/kshmsDeviations.mjs';
import { createProjectWorkspaceTabs } from '../src/modules/project/projectNavigationTabs.mjs';

// Actual lazy project surface, SJA/RUH components and handlers. Transport only is simulated.
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const dir = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kshms-job-links-')), entry = path.join(temp, 'entry.jsx');
fs.writeFileSync(entry, `import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Entry from '${dir}/src/modules/kshms/ProjectSjaEntry.jsx';import Sja from '${dir}/src/modules/kshms/KshmsSja.jsx';import Cases from '${dir}/src/modules/kshms/KshmsDeviations.jsx';const root=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=(kind,props)=>root.render(React.createElement(kind==='entry'?Entry:kind==='sja'?Sja:Cases,{...props,key:kind+':'+props.context.company_id+':'+(props.projectId||'global')}));globalThis.__unmount=()=>root.render(null);`);
const bundle = await build({ root: dir, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"development"' }, build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'JobProof', cssFileName: 'job-proof' } }, plugins: [react(), { name: 'transport', enforce: 'pre', resolveId(id) { if (/kshmsAccess\.js$/.test(id)) return '\0rpc'; if (/appSupabaseClientRegistry\.js$/.test(id)) return '\0client'; }, load(id) { if (id === '\0rpc') return 'export const kshmsRpc=(...args)=>globalThis.__rpc(...args);'; if (id === '\0client') return 'export const getAppSupabaseClient=()=>null;'; } }] });
const dom = new JSDOM('<div id="app"></div>', { url: 'https://example.invalid', runScripts: 'outside-only', pretendToBeVisual: true }), { window } = dom, doc = window.document;
window.IS_REACT_ACT_ENVIRONMENT = true; window.TextEncoder = TextEncoder; window.HTMLElement.prototype.scrollIntoView = function () {};
window.MessageChannel = class { constructor() { this.port1 = { onmessage: null }; this.port2 = { postMessage: () => setImmediate(() => this.port1.onmessage?.()) }; } };
window.confirm = () => { throw Error('Unexpected confirmation'); };
const company = '11111111-1111-4111-8111-111111111111', user = '22222222-2222-4222-8222-222222222222', projectId = '33333333-3333-4333-8333-333333333333', otherProject = '44444444-4444-4444-8444-444444444444';
const context = { company_id: company, user_id: user, enabled: true, manage: true, company_name: 'QA byggefirma' }, identity = { id: user, name: 'QA arbeidsleder' }, members = [{ id: user, identity }];
const projects = [{ id: projectId, name: 'QA mur og flis', address: 'QA arbeidssted' }, { id: otherProject, name: 'QA tømrerordre', address: '' }];
const routines = [{ id: '55555555-5555-4555-8555-555555555555', routine_id: '66666666-6666-4666-8666-666666666666', reference_number: 12, number: 3, content: { title: 'Støv ved mur og flis', chapter: 'HMSK', procedure: 'QA godkjent arbeidsmetode' } }];
const sjas = new Map(), cases = new Map(), receipts = new Map(), calls = [];
let failCreate = false;
window.__rpc = async (name, args) => {
  calls.push({ name, args: structuredClone(args) });
  const scoped = { ...context, company_id: args.p_company_id, ...(args.p_project_id ? { project_id: args.p_project_id } : {}) };
  if (name === 'kshms_job_choices') { return { context: scoped, projects: projects.filter(row => row.name.includes(args.p_project_query || '')), project_total: 2, routines }; }
  if (name === 'kshms_sja_state' || name === 'kshms_project_sja_state') {
    const items = [...sjas.values()].filter(row => !args.p_project_id || row.project_id === args.p_project_id).map(row => ({ ...row, title: row.content.title }));
    return { context: scoped, project: args.p_project_id ? { id: args.p_project_id, name: projects.find(row => row.id === args.p_project_id).name, locked: false } : null, members, items, total: items.length };
  }
  if (name === 'kshms_sja_detail') return { context: scoped, sja: sjas.get(args.p_id) || null };
  if (name === 'kshms_sja_command') {
    const p = args.p_payload, row = { id: p.id, company_id: company, project_id: p.project_id || null, project_name: projects.find(row => row.id === p.project_id)?.name, content: sjaContent(p.content), revision: 1, status: 'draft', created_by: user };
    sjas.set(row.id, row); return { sja: row };
  }
  if (name === 'kshms_project_ruh_state' || name === 'kshms_deviation_state') {
    const available = [...cases.values()].filter(row => !args.p_project_id || row.project_id === args.p_project_id), visible = available.filter(row => args.p_status === 'closed' ? row.status === 'closed' : row.status !== 'closed');
    return { context: scoped, project: args.p_project_id ? { id: args.p_project_id, name: projects.find(row => row.id === args.p_project_id).name, locked: false } : null, members, cases: visible, counts: { open: available.filter(row => row.status !== 'closed').length, closed: available.filter(row => row.status === 'closed').length }, next: null };
  }
  if (name === 'kshms_deviation_files') return [];
  if (name === 'kshms_deviation_detail') return { case: structuredClone(cases.get(args.p_id)), events: [{ id: 'event-1', action: 'create', snapshot: cases.get(args.p_id), actor_identity: identity }], next: null };
  assert.equal(name, 'kshms_deviation_command');
  if (failCreate) { failCreate = false; throw Error('QA nettfeil'); }
  const p = args.p_payload;
  if (receipts.has(p.request_id)) return receipts.get(p.request_id);
  const row = { ...cases.get(p.id), ...p, id: p.id || window.crypto.randomUUID(), company_id: company, status: args.p_action === 'close' ? 'closed' : p.status || 'open', revision: (cases.get(p.id)?.revision || 0) + 1, created_by: user, creator_identity: identity, responsible_identity: identity, source_kind: p.source_kind || 'company', created_at: '2026-10-07T22:00:00Z', closed_by: args.p_action === 'close' ? user : null, closed_at: args.p_action === 'close' ? '2026-10-07T22:30:00Z' : null, closed_identity: args.p_action === 'close' ? identity : null };
  cases.set(row.id, row); if (p.request_id) receipts.set(p.request_id, row); return row;
};
window.eval((Array.isArray(bundle) ? bundle[0] : bundle).output.find(row => row.type === 'chunk').code);
const act = window.__act, button = text => [...doc.querySelectorAll('button')].find(node => node.textContent.trim() === text);
const click = async node => { assert(node, 'Missing action'); assert(!node.matches(':disabled'), node.textContent); await act(async () => node.click()); };
const write = async (node, value) => { assert(node, 'Missing field'); assert(!node.matches(':disabled')); await act(async () => { const proto = node.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : node.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, value); node.dispatchEvent(new window.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }); };
const field = label => { const node = [...doc.querySelectorAll('label')].find(row => (row.htmlFor ? row.textContent.trim() : row.querySelector('span')?.textContent.trim()) === label); return node?.control || node?.querySelector('input,textarea,select'); };
const render = async (kind, props = {}) => act(async () => window.__render(kind, { context, ...props }));

assert.equal(createProjectWorkspaceTabs().find(row => row[0] === 'avvik')[1], 'Avvik');
assert.equal(createProjectWorkspaceTabs({ canUseKshms: true, openDeviationCount: 2 }).find(row => row[0] === 'avvik')[1], 'Avvik/SJA/RUH (2)');
await render('entry', { projectId, context: { ...context, enabled: false } }); assert(!button('Opprett SJA')); assert(!button('Registrer RUH')); assert.equal(calls.length, 0);
await render('entry', { projectId }); assert(doc.body.textContent.includes('sikker jobbanalyse')); assert(doc.body.textContent.includes('rapport om uønsket hendelse')); assert.equal(calls.length, 0, 'Closed project entry fetched documentation');
await click(button('Opprett SJA')); assert(doc.querySelector('[role="dialog"]')); assert.equal(doc.querySelector('[data-sja-field="title"]').value, ''); assert.equal(doc.querySelector('[data-job-project]').value, projectId); assert(doc.querySelector('[data-job-project]').disabled);
await write(doc.querySelector('[data-sja-field="title"]'), 'QA murarbeid'); await click(button('Muring og pussing')); assert(doc.querySelector('[data-sja-field="title"]').value.includes('QA murarbeid · Muring og pussing'));
await click(doc.querySelector('[aria-label="Legg inn rutine R-012"]')); assert.equal(doc.querySelector('[data-sja-field="routines"]').value, 'R-012 – Støv ved mur og flis (versjon 3)');
await click(button('Lagre utkast')); assert.equal([...sjas.values()][0].project_id, projectId); assert.equal(doc.querySelector('[data-sja-field="workplace"]').value, '', 'Project filled a risk answer'); await click(button('Lukk'));
await act(async () => window.__unmount());
await render('sja'); await click(button('Ny SJA')); await write(doc.querySelector('[data-job-project]'), otherProject); await write(doc.querySelector('[data-sja-field="title"]'), 'QA valgt firmaprosjekt'); await click(button('Lagre utkast')); assert([...sjas.values()].some(row => row.project_id === otherProject)); assert(doc.querySelector('[data-job-project]').disabled); await click(button('Lukk'));
await click(button('Ny SJA')); await write(doc.querySelector('[data-sja-field="title"]'), 'QA ekstern oppgave'); await write(doc.querySelector('[data-sja-field="project_reference"]'), 'Ekstern ordre 123'); await click(button('Lagre utkast')); assert([...sjas.values()].some(row => row.project_id === null && row.content.project_reference === 'Ekstern ordre 123')); await click(button('Lukk'));

await render('entry', { projectId }); await click(button('Registrer RUH')); assert(doc.querySelector('[role="dialog"]')); assert.equal(field('Kort tittel').value, ''); assert.equal(doc.querySelector('[data-job-project]').value, projectId);
const createsBefore = calls.filter(row => row.name === 'kshms_deviation_command').length;
await click(button('Lagre RUH for oppfølging')); const warning = [...doc.querySelectorAll('[role="alert"]')].find(row => row.textContent.includes('Dette mangler')); assert(warning); assert.equal(doc.activeElement, warning); assert(warning.textContent.includes('Ansvarlig medarbeider')); assert(warning.textContent.includes('Gyldig frist')); assert.equal(calls.filter(row => row.name === 'kshms_deviation_command').length, createsBefore);
await write(field('Kort tittel'), 'QA nestenulykke'); await write(field('Hva skjedde / hva er feil?'), 'QA materialer falt under transport'); await write(field('Ansvarlig'), user); await write(field('Frist'), '2026-10-10'); await click(doc.querySelector('[aria-label="Legg inn rutine R-012"]'));
failCreate = true; await click(button('Lagre RUH for oppfølging')); assert(field('Kort tittel')); assert(window.localStorage.getItem(deviationDraftKey(user, company, projectId)));
await click(button('Lagre RUH for oppfølging')); const createCalls = calls.filter(row => row.name === 'kshms_deviation_command' && row.args.p_action === 'create'); assert.equal(createCalls.at(-1).args.p_payload.request_id, createCalls.at(-2).args.p_payload.request_id); const ruh = [...cases.values()][0]; assert.equal(ruh.project_id, projectId); assert.equal(ruh.category, 'ruh'); assert(ruh.routines.includes('R-012')); assert.equal(window.localStorage.getItem(deviationDraftKey(user, company, projectId)), null);
await write(field('Årsak'), 'OK'); await write(field('Utførte tiltak / forbedring'), 'OK'); await write(field('Egen kontroll av resultatet'), 'OK'); await click(doc.querySelector('.ks-case-closure input[type="checkbox"]')); await click(button('Lagre og lukk RUH')); assert.equal(cases.get(ruh.id).closed_by, user); assert.equal(doc.querySelector('[role="dialog"]'), null);
await click(button('Lukkede (1)')); assert(doc.querySelector('.ks-case-list').textContent.includes('QA nestenulykke'));
await act(async () => window.__unmount()); await render('entry', { projectId: otherProject }); await click(button('Åpne RUH')); assert(!doc.querySelector('.ks-case-list').textContent.includes('QA nestenulykke'));
await render('entry', { projectId, readOnly: true }); assert(button('Opprett SJA').disabled); assert(button('Registrer RUH').disabled);

await render('cases'); await click(button('Registrer RUH')); await write(field('Kort tittel'), 'QA ekstern RUH'); await write(field('Hva skjedde / hva er feil?'), 'QA hendelse på ekstern byggeplass'); await write(field('Ansvarlig'), user); await write(field('Frist'), '2026-10-11'); await write(field('Ekstern ordre / egen referanse'), 'Ekstern ordre 456'); await click(button('Lagre RUH for oppfølging')); assert([...cases.values()].some(row => !row.project_id && row.project_reference === 'Ekstern ordre 456'));
await act(async () => window.__unmount()); dom.window.close(); fs.rmSync(temp, { recursive: true, force: true });
console.log('Real React project/SJA/RUH: PASS – module-only navigation/actions, direct blank creation, real project choices/manual references, numbered exact routine edition, optional trade prompts, complete missing-field alert, network retry/draft retention, own closure, scoped history and read-only actions.');
