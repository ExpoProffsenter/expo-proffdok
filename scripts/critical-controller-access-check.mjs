import assert from 'node:assert/strict';import fs from 'node:fs';
import {controllerGroups,controllerSafeUrl,controllerExpiry} from '../src/modules/controller/controllerAccess.mjs';
const rows=controllerGroups({project:{workflowType:'simple_order',kshmsChecklistInstances:[{category:'Firmaliste',content:{points:[{title:'Registrert uten svar'}]}}],customChecklistGroups:[{trade:'Rørlegger',text:'Eget punkt'}]},checklist:{'Gammel garanti':{'Historisk punkt':{status:'Ok'}}},runs:[{category:'Tidligere kontroll',definition:{category:'Tidligere kontroll',items:['Bevart']}}],product_checklists:[{category:'Valgt produkt',items:['Produktkrav']} ]});
for(const name of ['Firmaliste','Egne sjekkpunkter – Rørlegger','Gammel garanti','Tidligere kontroll','Valgt produkt','Prosjektering – kontroll av grunnlag og løsninger'])assert(rows.some(r=>r.category===name),name);
assert(!rows.some(r=>r.category==='Tildekning/forarbeid'));assert.equal(controllerSafeUrl('javascript:alert(1)'),'');assert.equal(controllerSafeUrl('https://example.invalid/image.png'),'https://example.invalid/image.png');assert.throws(()=>controllerExpiry('2000-01-01'));assert.throws(()=>controllerExpiry('invalid'));
const sql=fs.readFileSync('supabase/migrations/20261013114131_controller_project_access.sql','utf8');
for(const text of ['expires_at>clock_timestamp()','code_hash=sha256','revoked_at is null','p.company_scope_id is distinct from public.current_active_company_scope_id()','p_revision','alter table controller_private.links enable row level security','from public,anon,authenticated','p.id and r.company_id=l.company_id'])assert(sql.includes(text),text);
const read=sql.slice(sql.indexOf('create function public.controller_project_read'));
assert(!/update public.projects|insert into public.projects|tilbud|internalNotes|projectLog/.test(read));
const view=fs.readFileSync('src/modules/controller/ControllerPortal.jsx','utf8');assert(!/\.from\(|controller_access_command|save_underleverandor|setChecklistValue/.test(view));assert(view.includes('clearTimeout')&&view.includes('setInterval(refresh,30000)'));assert(view.includes('setData(null);setBusy(false)'));
console.log('Controller access PASS: separate read-only endpoint, hashed capability, server expiry/revoke, exact project/firm guards, all checklist categories, no commercial/HR/portal codes, safe file links and expiry retry.');

await import('./controller-access-email-check.mjs');
