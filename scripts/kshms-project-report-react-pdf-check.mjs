import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import {round as roundFixture,risk as riskFixture} from './critical-kshms-execution-pdf-check.mjs';

// Real hook, dialog, Report/CustomerReport, print handlers and complete PDF
// generator. Only transport and browser download are replaced. jsPDF is real.
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const { getDocument } = await import(process.env.KSHMS_PDFJS_PATH || 'pdfjs-dist/legacy/build/pdf.mjs');
const jspdf = process.env.KSHMS_JSPDF_PATH;
assert(jspdf, 'Set KSHMS_JSPDF_PATH to jsPDF 2.5.1 dist/jspdf.es.min.js');
const root = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ks-project-report-'));
const entry = path.join(temp, 'entry.jsx');
fs.writeFileSync(entry, `import React,{act} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {useKshmsProjectReport,KshmsProjectReportChoice,KshmsProjectReportDialog} from '${root}/src/modules/kshms/KshmsProjectReport.jsx';
import {createReportViewTools} from '${root}/src/modules/report/reportViewTools.js';import {createReportTools} from '${root}/src/modules/report/reportTools.js';
const Box=({children,label,value,name})=><div>{label}{value}{name}{children}</div>;const Link=({href,children})=><a href={href}>{children}</a>;
const {Report,CustomerReport}=createReportViewTools({Brand:Box,Grid:Box,PdfSafeLink:Link,hasValue:v=>v!=null&&String(v).trim()!=='',projectHasOvertagelse:()=>false,InfoCard:Box,SignatureCard:Box,normalizeExternalUrl:v=>v||'',publicProjectFileUrl:()=>'',buildBathroomEquipmentReportGroups:()=>[]});
function App(props){const report=useKshmsProjectReport(props);const tools=createReportTools({...window.__deps,projectId:props.projectId,prepareKshmsReport:report.prepareExport,isKshmsReportCurrent:report.isCurrent});window.__tools=tools;window.__report=report;return <><button onClick={tools.downloadClickablePdfReport}>Lag test-PDF</button><button onClick={tools.printVisibleReport}>Skriv ut test</button><button onClick={tools.printReport}>Åpne rapport og skriv ut test</button><KshmsProjectReportChoice report={report}/><KshmsProjectReportDialog chooser={report.chooser}/>{props.portal?<CustomerReport {...window.__viewProps} kshmsReport={window.__allDocuments}/>:<Report {...window.__viewProps} kshmsReport={report.reportData}/>}</>}
const host=createRoot(document.getElementById('app'));globalThis.__act=act;globalThis.__render=props=>host.render(<App {...props}/>);globalThis.__unmount=()=>host.unmount();`);
const bundle = await build({ root, resolve: { alias: { react: path.join(root, 'node_modules/react'), 'react-dom': path.join(root, 'node_modules/react-dom') } }, configFile: false, logLevel: 'silent', define: { 'process.env.NODE_ENV': '"development"' }, build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'KshmsReportProof', cssFileName: 'kshms-report-proof' } }, plugins: [
  { name: 'report-proof-transport', enforce: 'pre', resolveId(id) { if (id === 'https://esm.sh/jspdf@2.5.1') return '\0report-proof-jspdf'; },
    load(id) { if (id.endsWith('/src/modules/kshms/kshmsAccess.js')) return 'export const kshmsRpc=(name,args)=>window.__rpc(name,args);'; if (id === '\0report-proof-jspdf') return `import {jsPDF as Real} from '${jspdf}';export function jsPDF(args){const doc=new Real(args);doc.save=name=>window.__save(name,doc.output('arraybuffer'));return doc;}`; } }, react(),
] });
const dom = new JSDOM('<div id="app"></div>', { url: 'https://ks-report.example.invalid/?progressTest=safe', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom, doc = window.document; window.IS_REACT_ACT_ENVIRONMENT = true; window.MessageChannel = class { constructor() { this.port1 = {}; this.port2 = { postMessage: () => window.setTimeout(() => this.port1.onmessage?.({ data: null }), 0) }; } };
window.HTMLCanvasElement.prototype.getContext = () => null;
window.fetch = async () => { throw Error('Fixture must not fetch external assets'); };
window.confirm = () => true; const alerts = []; window.alert = value => alerts.push(value);
const exports = [], printed = [], calls = []; window.__save = (name, bytes) => exports.push({ name, bytes: new Uint8Array(bytes) });
window.open = () => ({ closed: false, close() { this.closed = true; }, document: { open() {}, write(value) { printed.push(value); }, close() {} } });
const company = '11111111-1111-4111-8111-111111111111', userId = '22222222-2222-4222-8222-222222222222', projectId = '33333333-3333-4333-8333-333333333333', otherProject = '44444444-4444-4444-8444-444444444444';
const context = { enabled: true, company_id: company, user_id: userId, manage: false }, props = { context, userId, projectId };
const signed = { id: '55555555-5555-4555-8555-555555555555', company_id: company, project_id: projectId, revision: 2, status: 'signed', leader_identity: { name: 'QA historisk leder' }, signed_identity: { name: 'QA historisk signatur' }, signed_at: '2026-10-07T22:00:00Z', statement: 'QA lagret signert bekreftelse', content: { title: 'QA SIGNERT FLISKAPPING – Øyvind Åse '.repeat(4).slice(0, 160), workplace: 'QA arbeidssted', task: 'QA arbeidsoppgave', planned_on: '2026-10-08', reviewed_on: '2026-10-08', project_reference: 'QA egen referanse', routines: 'R-012 – Støv ved mur og flis (versjon 3)', equipment: 'QA verktøy kontrollert', ppe: 'QA verneutstyr vurdert', emergency: 'QA førstehjelp og varsling', stop_conditions: 'QA stans ved nye farer', communication: 'QA gjennomgang med arbeidslaget', steps: [{ activity: 'QA kapping', hazard: 'QA kvartsstøv', consequence: 'QA lungeskade', measures: 'QA våtkapping og avsug', owner: 'QA ansvar for tiltak', check: 'QA kontroll før arbeid' }], participants: [{ name: 'QA deltaker Ærlig', role: 'Flislegger', company: 'QA eksternt firma', involvement: 'QA medvirkning om støv' }] } };
const draft = { ...signed, id: '66666666-6666-4666-8666-666666666666', revision: 1, status: 'draft', signed_identity: null, signed_at: null, statement: null, content: { title: 'QA UTKAST TØMRERJOBB', steps: [], participants: [] } };
const closed = { id: '77777777-7777-4777-8777-777777777777', company_id: company, project_id: projectId, revision: 2, category: 'ruh', title: 'QA LUKKET RUH', status: 'closed', creator_identity: { name: 'QA registrert av' }, created_at: '2026-10-07T22:10:00Z', event: 'QA LANG HENDELSE: ' + 'Materialer ble sikret på arbeidsstedet etter nestenulykken. '.repeat(330) + 'QA HENDELSE SLUTT', immediate_action: 'QA midlertidig sikring', routines: 'R-007 – Materialtransport (versjon 2)', responsible_identity: { name: 'QA ansvarlig' }, handler_identity: { name: 'QA behandler' }, due_on: '2026-10-10', cause: 'QA årsak til hendelsen', improvement_action: 'QA permanente tiltak', control_note: 'QA egen kontroll dokumentert', follow_up: 'QA videre oppfølging', closed_identity: { name: 'QA historisk lukker' }, closed_at: '2026-10-08T10:30:00Z' };
const open = { ...closed, id: '88888888-8888-4888-8888-888888888888', revision: 1, title: 'QA ÅPEN RUH', status: 'open', event: 'QA åpen hendelse', closed_at: null, closed_identity: null, control_note: '' };
const rows = { sjas: [signed, draft], ruhs: [closed, open] }; window.__allDocuments = structuredClone(rows);
const project = { projectName: 'QA prosjektrapport', address: 'QA adresse', customer: 'QA kunde', responsible: 'QA prosjektansvarlig', projectDeviations: [{ ks_deviation_id: closed.id, title: 'QA LEGACY RUH SPEIL', includeInReport: true, description: 'QA legacy-prosjektavvik', status: 'Lukket' }, { id: 'legacy-other', title: 'QA LEGACY AVVIK BEVART', includeInReport: true, status: 'Åpent', description: 'QA eldre avvik' }] };
const before = JSON.stringify({ rows, project });
window.__viewProps = { company: { companyName: 'QA firma' }, name: 'QA firma', project, selected: [], manualProducts: [], other: {}, surf: {}, bathroomEquipment: {}, photos: [], access: [], inst: [], files: [], checklist: { Kontroll: { Punkt: { status: 'Ok', comment: 'QA eksisterende sjekkpunkt' } } }, tilbud: { enabled: false }, overtagelse: {}, projectLog: {} };
window.__deps = { ...window.__viewProps, user: { name: 'QA bruker' }, authUser: { id: userId }, manualSelected: [], DEFAULT_REPORT_HERO_IMAGE_URL: '', activeChecklistTemplate: [], warranty: { enabled: false }, warrantyReadiness: {}, emptyWarranty: () => ({ enabled: false }), getOpenDeviationCount: () => 0, getPhotoIdentity: p => p.id, getWarrantyYears: () => 10, hasValue: v => v != null && String(v).trim() !== '', isProjectLocked: true, makeProjectLink: () => '', normalizeExternalUrl: v => /^https?:/.test(v || '') ? v : '', projectHasOvertagelse: () => false, publicProjectFileUrl: () => '', buildBathroomEquipmentReportGroups: () => [], shouldIncludeProductReportDoc: () => false, productReportDocumentOptions: [], setTab: () => {}, setWarranty: () => { throw Error('Read-only report modified warranty'); } };
const roundRow={...structuredClone(roundFixture),company_id:company,project_id:projectId,content:{...structuredClone(roundFixture.content),title:'QA SAVED ROUND'}};
const riskRow={...structuredClone(riskFixture),company_id:company,project_id:projectId,content:{...structuredClone(riskFixture.content),title:'QA SAVED RISK'}};
const realPhoto=process.env.KSHMS_QA_PHOTO; if(realPhoto){const data='data:image/png;base64,'+fs.readFileSync(realPhoto).toString('base64');roundRow.content.answers[roundRow.content.points[0].id].photos[0].data=data;riskRow.content.risks[0].photos[0].data=data;}
rows.rounds=[roundRow,{...structuredClone(roundRow),id:'66666666-6666-4666-8666-666666666660',status:'draft',content:{...roundRow.content,title:'QA DRAFT ROUND'}}];rows.risks=[riskRow];
let failExport = false, wrongScope = false, deferList = null;
window.__rpc = async (name, args) => {
  if(name==='kshms_project_execution_report')return {context:{...context,project_id:args.p_project_id},...(args.p_round_ids===null?{choices:Object.fromEntries(['rounds','risks'].map(key=>[key,rows[key].filter(row=>row.project_id===args.p_project_id).map(row=>({id:row.id,title:row.content.title,status:row.status,completed_at:row.completed_at}))]))}:{rounds:structuredClone(rows.rounds.filter(row=>args.p_round_ids.includes(row.id))),risks:structuredClone(rows.risks.filter(row=>args.p_risk_ids.includes(row.id)))})};
  assert.equal(name, 'kshms_project_report'); calls.push(structuredClone(args));
  if (args.p_sja_ids === null && deferList) await deferList.promise;
  if (args.p_sja_ids !== null && failExport) { failExport = false; throw Error('QA valgt dokument mistet tilgang'); }
  const scoped = { ...context, company_id: args.p_company_id, project_id: wrongScope ? otherProject : args.p_project_id };
  if (args.p_sja_ids === null) return { context: scoped, choices: Object.fromEntries(Object.entries(rows).filter(([key])=>['sjas','ruhs'].includes(key)).map(([key, list]) => [key, list.filter(row => row.project_id === args.p_project_id).map(row => ({ id: row.id, title: key === 'sjas' ? row.content.title : row.title, status: row.status, signed_at: row.signed_at }))])) };
  return { context: scoped, sjas: structuredClone(rows.sjas.filter(row => args.p_sja_ids.includes(row.id))), ruhs: structuredClone(rows.ruhs.filter(row => args.p_ruh_ids.includes(row.id))) };
};
window.eval((Array.isArray(bundle) ? bundle[0] : bundle).output.find(row => row.type === 'chunk' && row.isEntry).code);
const act = window.__act, pause = ms => new Promise(resolve => window.setTimeout(resolve, ms));
const render = async value => act(async () => { window.__render(value); await pause(25); });
const button = title => [...doc.querySelectorAll('button')].find(node => node.textContent === title);
const click = async node => { assert(node, 'Missing actual button'); await act(async () => { node.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); await pause(25); }); };
const choose = async index => click([...doc.querySelectorAll('[role="dialog"] input')][index]);
const settle = () => act(async () => { await pause(200); });
const textOf = async item => { const pdf = await getDocument({ data: new Uint8Array(item.bytes), useSystemFonts: true }).promise; const pages = []; for (let i = 1; i <= pdf.numPages; i++) pages.push((await (await pdf.getPage(i)).getTextContent()).items.map(item => item.str).join(' ')); await pdf.destroy(); return { pages, text: pages.join(' ') }; };

await render({ ...props, context: { ...context, enabled: false } }); assert(!button('Velg KS/HMS til rapport'));
await click(button('Lag test-PDF')); await settle(); assert.equal(calls.length, 0); assert.equal(exports.length, 1, alerts.join('\n'));
let pdf = await textOf(exports.at(-1)); assert(pdf.text.replace(/\s+/g,'').includes('QALEGACYAVVIKBEVART')); assert(!pdf.text.includes('QA SIGNERT FLISKAPPING'));
await render(props); await click(button('Lag test-PDF')); assert(doc.querySelector('[role="dialog"]')); assert([...doc.querySelectorAll('[role="dialog"] input')].every(input => !input.checked));
await choose(0); await choose(2); await click(button('Lag PDF med valget')); await settle();
assert.equal(exports.length, 2, alerts.join('\n')); pdf = await textOf(exports.at(-1));
for (const required of ['QA SIGNERT FLISKAPPING', 'R-012', 'versjon 3', 'QA historisk signatur', 'QA deltaker Ærlig', 'QA medvirkning om støv', 'QA kontroll før arbeid', '08.10.2026 kl. 00:00:00', 'QA LUKKET RUH', 'QA HENDELSE SLUTT', 'QA historisk lukker', 'QA egen kontroll dokumentert', '10.10.2026', 'QA LEGACY AVVIK BEVART']) assert(pdf.text.replace(/\s+/g,'').includes(required.replace(/\s+/g,'')), `Actual PDF missing ${required}`);
assert(!pdf.text.includes('QA UTKAST TØMRERJOBB')); assert(!pdf.text.includes('QA ÅPEN RUH')); assert(!pdf.text.includes('QA LEGACY RUH SPEIL'), 'Selected RUH duplicated its project mirror'); assert(pdf.pages.length > 6);
const output = process.env.KSHMS_REPORT_PDF_OUTPUT || path.join(temp, 'kshms-selected-report.pdf'); fs.writeFileSync(output, exports.at(-1).bytes);
assert(doc.querySelector('.report').textContent.includes('QA historisk signatur')); assert(!doc.querySelector('.report').textContent.includes('QA ÅPEN RUH'));
assert.equal(JSON.stringify({ rows:{sjas:rows.sjas,ruhs:rows.ruhs}, project }), before, 'Report/PDF mutated source or project JSON');

await click(button('Skriv ut test')); await click(button('Skriv ut med valget')); await settle(); assert.equal(printed.length, 1); assert(printed.at(-1).includes('QA historisk signatur')); assert(printed.at(-1).includes('QA HENDELSE SLUTT')); assert(!printed.at(-1).includes('QA ÅPEN RUH')); assert(!printed.at(-1).includes('Velg KS/HMS til rapport'));
await click(button('Åpne rapport og skriv ut test')); await click(button('Skriv ut med valget')); await act(async () => { await pause(750); }); assert.equal(printed.length, 2);
await click(button('Lag test-PDF')); await click(button('Avbryt')); await settle(); assert.equal(exports.length, 2); assert(doc.querySelector('.report').textContent.includes('QA historisk signatur'));
await click(button('Lag test-PDF')); failExport = true; await click(button('Lag PDF med valget')); assert(doc.querySelector('[role="alert"]').textContent.includes('mistet tilgang')); assert.equal(exports.length, 2);
await click(button('Oppdater listen')); assert([...doc.querySelectorAll('[role="dialog"] input')].every(input => !input.checked)); await choose(1); await choose(3); await click(button('Lag PDF med valget')); await settle();
assert.equal(exports.length, 3); pdf = await textOf(exports.at(-1)); assert(pdf.text.includes('UTKAST')); assert(pdf.text.includes('IKKE SIGNERT')); assert(pdf.text.includes('QA UTKAST TØMRERJOBB')); assert(pdf.text.includes('QA ÅPEN RUH')); assert(pdf.text.includes('Oppfølging gjenstår')); assert(!pdf.text.includes('QA historisk signatur')); assert(!pdf.text.includes('QA LUKKET RUH'));

await click(button('Lag test-PDF')); wrongScope = true; await click(button('Lag PDF med valget')); assert(doc.querySelector('[role="alert"]').textContent.includes('tilgang er endret')); assert.equal(exports.length, 3);
await click(button('Fortsett uten KS/HMS')); await settle(); assert.equal(exports.length, 4); pdf = await textOf(exports.at(-1)); assert(!pdf.text.includes('QA UTKAST TØMRERJOBB')); assert(!doc.querySelector('.ks-project-report-documents')); wrongScope = false;
deferList = {}; deferList.promise = new Promise(resolve => { deferList.resolve = resolve; });
await click(button('Lag test-PDF')); assert(doc.querySelector('[role="status"]')); await click(button('Fortsett uten KS/HMS')); await settle(); assert.equal(exports.length, 5, 'Explicit skip waited for a stalled list request'); deferList.resolve(); deferList = null; await settle(); assert(!doc.querySelector('[role="dialog"]'));
deferList = {}; deferList.promise = new Promise(resolve => { deferList.resolve = resolve; });
await click(button('Lag test-PDF')); await render({ ...props, projectId: otherProject }); assert(!doc.querySelector('[role="dialog"]')); deferList.resolve(); deferList = null; await settle(); assert.equal(exports.length, 5); assert(!doc.querySelector('.ks-project-report-documents'));
await render({ ...props, context: { ...context, user_id: 'other-user' } }); assert(!button('Velg KS/HMS til rapport'));
await render({ ...props, disabled: true }); assert(!button('Velg KS/HMS til rapport'));
await render(props); await click(button('Velg KS/HMS til rapport')); await choose(0); await click(button('Bruk valget i rapporten')); assert(doc.querySelector('.ks-project-report-documents'));
await render({ ...props, projectId: otherProject }); await render(props); assert(!doc.querySelector('.ks-project-report-documents'), 'Previous project choice resurfaced after returning');
await render({ ...props, context: { ...context, manage: true } }); await click(button('Velg KS/HMS til rapport')); await choose(0); await click(button('Bruk valget i rapporten')); assert(doc.querySelector('.ks-project-report-documents'));
await render({ ...props, context: { ...context, manage: false } }); assert(!doc.querySelector('.ks-project-report-documents'), 'Role downgrade retained cached report documents');
await render({ ...props, portal: true, disabled: true }); assert(!doc.querySelector('.ks-project-report-documents'), 'Private module documents appeared in CustomerReport');
await click(button('Skriv ut test')); await settle(); assert.equal(printed.length, 3, 'Ordinary portal print was blocked');
await render(props);await click(button('Lag test-PDF'));await choose(4);await choose(6);await click(button('Lag PDF med valget'));await settle();pdf=await textOf(exports.at(-1));
for(const required of ['QA SAVED ROUND','QA SAVED RISK','Lagret fullfører','Lagret egen bekreftelse','R-001 utgave 2','forventet effekt - ikke kontrollert','Videre tiltak kreves','5x5: sannsynlighet x konsekvens'])assert(pdf.text.replace(/\s+/g,'').includes(required.replace(/\s+/g,'')),`Actual combined PDF missing ${required}`);
assert(!pdf.text.includes('QA DRAFT ROUND'));assert.equal(doc.querySelectorAll('.ks-project-report-documents img').length,2);assert(doc.querySelector('.ks-project-report-documents table'));fs.writeFileSync(path.join(path.dirname(output),'combined-control-risk.pdf'),exports.at(-1).bytes);
await click(button('Skriv ut test'));await click(button('Skriv ut med valget'));await settle();assert(printed.at(-1).includes('data:image/png;base64,'));assert(printed.at(-1).includes('sannsynlighet'));
await click(button('Lag test-PDF'));await choose(4);await choose(6);await choose(5);await click(button('Lag PDF med valget'));await settle();pdf=await textOf(exports.at(-1));assert(pdf.text.includes('QA DRAFT ROUND'));assert(pdf.text.includes('IKKE FULLFØRT'));assert(!pdf.text.includes('QA SAVED RISK'));assert(!pdf.text.includes('QA SAVED ROUND'));
await act(async () => window.__unmount()); dom.window.close(); fs.rmSync(temp, { recursive: true, force: true });
console.log(JSON.stringify({ result: 'PASS', actualPdfs: exports.length, actualPrints: printed.length, selectedPdfPages: (await textOf(exports[1])).pages.length, pdf: output, scenarios: 'module-only chooser; initially empty selection; exact signature/routines/participants; closure and dates; unselected and mirrored exclusion; draft/open markers; both print paths; cancel; revoked/malformed-scope export; explicit skip during stalled fetch; late response/project switch and return; role downgrade clears choice; support/portal gates; no source mutation' }));
