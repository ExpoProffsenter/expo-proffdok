import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { executionContent, executionIssues } from '../src/modules/kshms/kshmsExecutions.mjs';

// Actual project tools, task banner and execution dialog. Only RPC transport is replaced.
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const dir = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ks-project-executions-')), entry = path.join(temp, 'entry.jsx');
fs.writeFileSync(entry, `import React,{act} from '${dir}/node_modules/react/index.js';import {createRoot} from '${dir}/node_modules/react-dom/client.js';import Entry from '${dir}/src/modules/kshms/ProjectSjaEntry.jsx';import Tasks from '${dir}/src/modules/kshms/KshmsTasks.jsx';import Executions from '${dir}/src/modules/kshms/KshmsExecutions.jsx';const root=createRoot(document.getElementById('app'));window.__act=act;window.__render=(mode,props)=>root.render(React.createElement(mode==='project'?Entry:mode==='tasks'?Tasks:Executions,{...props,key:mode+':'+props.context.company_id+':'+props.context.user_id+':'+(props.projectId||'global')}));window.__unmount=()=>root.render(null);`);
const bundle = await build({ root: dir, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"development"' }, build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'ProjectExecutionProof', cssFileName: 'proof' } }, plugins: [react(), {
  name: 'execution-test-transport', enforce: 'pre', resolveId(id) { if (/kshmsAccess\.js$/.test(id)) return '\0rpc'; if (/appSupabaseClientRegistry\.js$/.test(id)) return '\0client'; },
  load(id) { if (id === '\0rpc') return 'export const kshmsRpc=(...args)=>window.__rpc(...args);'; if (id === '\0client') return 'export const getAppSupabaseClient=()=>null;'; }
}] });
const dom = new JSDOM('<div id="app"></div>', { url: 'https://execution-qa.example.invalid', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom, doc = window.document;
window.IS_REACT_ACT_ENVIRONMENT = true; window.TextEncoder = TextEncoder; window.structuredClone = structuredClone;
window.HTMLElement.prototype.scrollIntoView = function () {};
window.MessageChannel = class { constructor() { this.port1 = { onmessage: null }; this.port2 = { postMessage: () => setImmediate(() => this.port1.onmessage?.()) }; } };
window.confirm = () => true;
const company = '11111111-1111-4111-8111-111111111111', user = '22222222-2222-4222-8222-222222222222', colleague = '33333333-3333-4333-8333-333333333333';
const project = '44444444-4444-4444-8444-444444444444', secondProject = '55555555-5555-4555-8555-555555555555';
let context = { company_id: company, user_id: user, enabled: true, manage: true, company_name: 'QA firma' }, failReadback = false, offlineTasks = false, missingProjectAccess = false;
const members = [{ id: user, identity: { name: 'QA melder' } }, { id: colleague, identity: { name: 'QA ansvarlig' } }];
const routines = [{ id: '66666666-6666-4666-8666-666666666666', reference_number: 12, number: 3, content: { title: 'Støv ved arbeid', chapter: 'HMSK', procedure: 'QA godkjent rutine' } }];
const rows = new Map(), receipts = new Map(), calls = [];
window.__rpc = async (name, args) => {
  calls.push({ name, args: structuredClone(args) });
  const scoped = { ...context, company_id: args.p_company_id, ...(args.p_project_id ? { project_id: args.p_project_id } : {}) };
  if (name === 'kshms_job_choices') return { context: scoped, projects: [{ id: project, name: 'QA prosjekt A' }, { id: secondProject, name: 'QA prosjekt B' }], project_total: 2, routines };
  if (name === 'kshms_deviation_tasks') return { company_id: company, user_id: scoped.user_id, count: 1, overdue: 0, items: [{ id: '77777777-7777-4777-8777-777777777777', title: 'QA eksisterende avvik', due_on: '2026-10-09' }] };
  if (name === 'kshms_execution_tasks') {
    if (offlineTasks) throw Error('QA offline');
    const items = [...rows.values()].filter(row => row.status === 'draft' && row.responsible_id === scoped.user_id).map(row => ({ id: row.id, kind: row.kind, project_id: row.project_id, title: row.content.title, due_on: row.content.planned_on, accessible: !missingProjectAccess }));
    return { company_id: company, user_id: scoped.user_id, count: items.length, overdue: 0, items };
  }
  if (name === 'kshms_execution_state' || name === 'kshms_project_execution_state') {
    const records = [...rows.values()].filter(row => row.kind === args.p_kind && (!args.p_project_id || row.project_id === args.p_project_id) && (args.p_status === 'all' || row.status === args.p_status)).map(row => ({ ...row, title: row.content.title, workplace: row.content.workplace, planned_on: row.content.planned_on }));
    return { context: scoped, records: structuredClone(records), members, templates: [], next: null, project: args.p_project_id ? { id: args.p_project_id, name: args.p_project_id === project ? 'QA prosjekt A' : 'QA prosjekt B', locked: false } : null };
  }
  if (name === 'kshms_execution_detail') {
    if (failReadback) { failReadback = false; throw Error('QA lost readback'); }
    return { context: scoped, record: structuredClone(rows.get(args.p_id)), links: [] };
  }
  assert.equal(name, 'kshms_execution_command');
  if (receipts.has(args.p_request_id)) return structuredClone(receipts.get(args.p_request_id));
  const p = args.p_payload, before = rows.get(p.id), content = executionContent(p.content, p.kind);
  if (before && before.revision !== p.revision) throw Object.assign(Error('QA conflict'), { code: '40001' });
  const completed = args.p_action === 'complete';
  if (completed) { assert.equal(content.responsible_id, scoped.user_id); assert(p.confirmed); assert.equal(executionIssues(content, p.kind).length, 0); }
  const row = { ...p, content, company_id: company, responsible_id: content.responsible_id, revision: (before?.revision || 0) + 1, status: completed ? 'completed' : 'draft', completed_by: completed ? scoped.user_id : null, completed_at: completed ? '2026-10-08T18:00:00Z' : null, completed_identity: completed ? { name: 'QA ansvarlig' } : null, statement: completed ? p.statement : null };
  rows.set(row.id, structuredClone(row)); const result = { record: { id: row.id, company_id: company, revision: row.revision } }; receipts.set(args.p_request_id, result); return result;
};
window.eval((Array.isArray(bundle) ? bundle[0] : bundle).output.find(item => item.type === 'chunk').code);
const style = doc.createElement('style');
style.textContent = 'input{display:block;width:100%;padding:12px}' + (Array.isArray(bundle) ? bundle[0] : bundle).output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => String(item.source)).join('\n');
doc.head.append(style);
const act = window.__act;
const render = async (mode, extra = {}) => act(async () => window.__render(mode, { context, onOpen: () => false, ...extra }));
const button = text => [...doc.querySelectorAll('button')].find(node => node.textContent.trim() === text || node.getAttribute('aria-label') === text);
const click = async node => { assert(node, 'Missing button'); assert(!node.matches(':disabled'), node.textContent); await act(async () => node.click()); };
const field = label => [...doc.querySelectorAll('[role="dialog"] label')].find(node => node.firstElementChild?.textContent === label)?.querySelector('input,textarea,select');
const writeNode = async (node, value) => { assert(node, 'Missing field'); assert(!node.matches(':disabled')); await act(async () => { const prototype = node.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : node.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(node, value); node.dispatchEvent(new window.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }); };
const write = async (label, value) => writeNode(field(label), value);
const common = async title => { for (const [label, value] of Object.entries({ 'Navn': title, 'Arbeidssted / område': 'QA lager', 'Dato for gjennomføring': '2026-10-08', 'Deltakere og medvirkning': 'QA ansatte og verneombud deltok.', 'Gjennomgang og videre oppfølging': 'QA gjennomgått; tiltak følges opp.' })) await write(label, value); };
const addRoutine = async () => { await click(button('Legg inn rutine R-012')); await click(button('Legg inn rutine R-012')); assert.equal(field('Rutiner / utgaver som brukes').value, 'R-012 – Støv ved arbeid (versjon 3)'); };
const complete = async label => { const box = doc.querySelector('.ks-execution-completion'), checkbox = doc.querySelector('[data-execution-field="confirmation"]'); assert(box.contains(checkbox) && box.contains(button(label)), 'Confirmation is separated from completion'); assert.equal(window.getComputedStyle(checkbox).width, '24px'); assert.equal(window.getComputedStyle(checkbox).height, '24px'); assert.equal(window.getComputedStyle(checkbox).padding, '0px'); assert.equal(window.getComputedStyle(checkbox.closest('label')).display, 'grid'); await click(checkbox); await click(button(label)); };

await render('project', { projectId: project, context: { ...context, enabled: false } });
assert(!button('Opprett vernerunde') && !button('Opprett risikovurdering 5×5')); assert.equal(calls.length, 0);
await render('project', { projectId: project }); assert(button('Opprett SJA') && button('Registrer RUH'));
await click(button('Opprett vernerunde')); assert(doc.querySelector('[role="dialog"]')); assert.equal(doc.querySelector('[data-job-project]').value, project); assert(doc.querySelector('[data-job-project]').disabled);
await common('QA prosjektkontroll'); await write('Tekst for sjekkpunktet', 'QA ryddig ferdsel'); await write('Svar', 'ok'); await addRoutine(); await write('Ansvarlig for gjennomføringen', colleague);
assert(button('Kontroll fullført').disabled); await click(button('Lagre utkast'));
const round = [...rows.values()].find(row => row.kind === 'round'); assert.equal(round.project_id, project); assert(round.content.routines.includes('R-012'));
await click(button('Lukk gjennomføring')); await render('project', { projectId: secondProject }); await click(button('Åpne vernerunder'));
assert(!doc.querySelector('.ks-execution-list').textContent.includes('QA prosjektkontroll'), 'Other project listed the control');
await render('project', { projectId: project }); await click(button('Åpne vernerunder')); await click(button('Fortsett gjennomføring')); assert.equal(field('Navn').value, 'QA prosjektkontroll');
await write('Gjennomgang og videre oppfølging', 'QA lokal kladd i prosjekt A'); await click(button('Lukk gjennomføring'));
await render('project', { projectId: secondProject }); await click(button('Opprett vernerunde')); assert.equal(field('Navn').value, '');
await render('project', { projectId: project }); await click(button('Åpne vernerunder')); await click(button('Fortsett lokal kladd')); assert.equal(field('Gjennomgang og videre oppfølging').value, 'QA lokal kladd i prosjekt A');
await click(button('Lagre utkast')); await click(button('Lukk gjennomføring'));
await render('tasks'); assert(!doc.querySelector('[aria-label="Dine vernerunder og risikovurderinger"]'), 'Reporter received responsible alert');
context = { ...context, user_id: colleague, manage: false }; await render('tasks'); assert(doc.body.textContent.includes('1 gjennomføring'));
assert(doc.querySelector('[aria-label="Dine åpne KS/HMS-avvik"]'), 'Existing deviation alert disappeared');
missingProjectAccess = true; await act(async () => window.dispatchEvent(new window.Event('focus')));
assert(doc.body.textContent.includes('Prosjekttilgang kreves')); assert(!button('Åpne gjennomføring')); assert(!doc.body.textContent.includes('QA prosjektkontroll'), 'Inaccessible task exposed its title');
missingProjectAccess = false; await act(async () => window.dispatchEvent(new window.Event('focus')));

offlineTasks = true; await act(async () => window.dispatchEvent(new window.Event('focus'))); assert(doc.body.textContent.includes('1 gjennomføring')); assert(doc.body.textContent.includes('Sist bekreftede oppgaver er beholdt')); offlineTasks = false;
await click(button('Åpne gjennomføring')); assert.equal(field('Navn').value, 'QA prosjektkontroll'); assert(!button('Kontroll fullført').disabled);
await click(doc.querySelector('[data-execution-field="confirmation"]')); failReadback = true; await click(button('Kontroll fullført'));
assert(doc.body.textContent.includes('1 gjennomføring'), 'Failed confirmation removed alert'); assert(doc.body.textContent.includes('Kladden er beholdt')); assert(doc.querySelector('[role="dialog"]'), 'Failed readback closed the dialog');
await click(button('Kontroll fullført')); assert(!doc.querySelector('[aria-label="Dine vernerunder og risikovurderinger"]')); assert(doc.querySelector('[aria-label="Dine åpne KS/HMS-avvik"]'), 'Control completion removed the existing deviation task'); assert.equal(rows.get(round.id).completed_by, colleague); assert(!doc.querySelector('[role="dialog"]'), 'Verified completion left the task popup open');

context = { ...context, user_id: user, manage: true }; await render('project', { projectId: project }); await click(button('Opprett risikovurdering 5×5'));
assert.equal(doc.querySelector('[data-job-project]').value, project); await common('QA prosjektrisiko'); await addRoutine();
for (const [label, value] of Object.entries({ 'Vurderingsgrunnlag og skala 1–5': 'QA personskade og sannsynlighet for dagens jobb.', 'Hva krever firmaet før risiko kan aksepteres?': 'QA utførte og kontrollerte tiltak.', 'Arbeidsoppgave': 'QA kapping', 'Fare / uønsket hendelse': 'QA støv', 'Mulig konsekvens': 'QA personskade', 'Tiltak som allerede er på plass': 'QA avskjerming', 'Nye tiltak som skal gjennomføres': 'QA avsug', 'Tiltaksansvarlig': user, 'Frist for tiltak': '2026-10-09', 'Hvordan og når kontrolleres tiltakene?': 'QA verneombud kontrollerer avsuget.', 'Beslutning': 'needs_action', 'Begrunnelse for vurdering og beslutning': 'QA videre tiltak før oppstart.' })) await write(label, value);
await click([...doc.querySelectorAll('label')].find(node => node.textContent.includes('Grensene og kravene er vurdert')).querySelector('input'));
for (const phase of ['before', 'after']) for (const [key, value] of [['probability', phase === 'before' ? '3' : '1'], ['consequence', phase === 'before' ? '4' : '2']]) await writeNode(doc.querySelector(`[data-execution-field$="-${key}_${phase}"]`), value);
await click(button('Lagre utkast')); const risk = [...rows.values()].find(row => row.kind === 'risk'); assert.equal(risk.project_id, project); await click(button('Lukk gjennomføring'));
await render('tasks'); assert(doc.body.textContent.includes('1 gjennomføring')); await click(button('Åpne gjennomføring')); assert.equal(field('Navn').value, 'QA prosjektrisiko'); await complete('Vurdering fullført');
assert(!doc.querySelector('[aria-label="Dine vernerunder og risikovurderinger"]')); assert(doc.querySelector('[aria-label="Dine åpne KS/HMS-avvik"]'), 'Risk completion removed the existing deviation task'); assert.equal(rows.get(risk.id).content.risks[0].decision, 'needs_action'); assert(!doc.querySelector('[role="dialog"]'), 'Verified risk completion left the task popup open');
await render('project', { projectId: secondProject }); await click(button('Åpne risikovurderinger')); assert(!doc.body.textContent.includes('QA prosjektrisiko'));
await render('project', { projectId: project, readOnly: true }); assert(button('Opprett vernerunde').disabled && button('Opprett risikovurdering 5×5').disabled); await click(button('Åpne vernerunder')); await click(button('Åpne dokumentasjon')); assert(field('Navn').matches(':disabled')); assert(!button('Kontroll fullført'));
window.history.replaceState({}, '', `/?kshmsExecution=${risk.id}&kshmsCompany=${company}`); await render('tasks');
assert(button('Åpne gjennomføringen fra e-posten')); await click(button('Åpne gjennomføringen fra e-posten')); assert.equal(field('Navn').value, 'QA prosjektrisiko'); assert(field('Navn').matches(':disabled')); await click(button('Lukk gjennomføring'));
window.history.replaceState({}, '', `/?kshmsExecution=${risk.id}&kshmsCompany=ffffffff-ffff-4fff-8fff-ffffffffffff`); await render('tasks'); const beforeForeignEmail = calls.length;
assert(doc.body.textContent.includes('Lenken gjelder et annet firma')); assert(!button('Åpne gjennomføringen fra e-posten')); assert.equal(calls.length, beforeForeignEmail);
window.history.replaceState({}, '', '/');
await render('tasks', { context: { ...context, enabled: false } }); assert(!doc.querySelector('[role="dialog"]')); assert(!doc.querySelector('.ks-task-banner'));
await act(async () => window.__unmount()); dom.window.close(); fs.rmSync(temp, { recursive: true, force: true });
console.log('kshms-project-executions-react-check: PASS — actual project buttons/lists, routine editions, scoped local drafts, responsible task dialog, failed-readback retry and both completion types');
