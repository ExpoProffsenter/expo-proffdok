import assert from 'node:assert/strict';
import fs from 'node:fs';
import {kshmsNavigationGroups} from '../src/modules/kshms/kshmsNavigation.mjs';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '../src/modules/project/projectNavigationTabs.mjs';

const groups=kshmsNavigationGroups({canManage:true,pendingCount:10});
assert.deepEqual(groups.map(g=>g.label),['Daglig arbeid','Mine rutiner','Forvaltning']);
assert.deepEqual(groups.flatMap(g=>g.items.map(i=>i[0])),['deviations','sja','rounds','risk','reading','personal','organization','handbook','checklists','followup','extract','setup']);
assert.equal(groups[1].items[0][1],'Les og bekreft (10)');
assert.equal(kshmsNavigationGroups().length,2);
assert(!createGlobalAppTabs({canUseKshms:true,canUseAdminProjectSync:true}).some(([id])=>id==='hr'));
assert(createGlobalAppTabs({canUseHr:true}).some(([id,label])=>id==='hr'&&label==='HR'));
assert(!createProjectWorkspaceTabs({canUseHr:true}).some(([id])=>id==='hr'));

// Exercise the actual hook's lifecycle and stale-response gate.
const source=fs.readFileSync('src/modules/hr/hrAccess.js','utf8');
const hook=source.slice(source.indexOf('export function useHrAccess')).replace('export function','function');
const window=new EventTarget(),document=new EventTarget();document.visibilityState='visible';
const pending=[],cleanup=[];let state;
const useState=()=>[state,value=>state=typeof value==='function'?value(state):value];
const useEffect=fn=>cleanup.push(fn());
const useHook=new Function('useState','useEffect','hrRpc','window','document','MANAGED_ACCESS_EVENT','MODULE_ACCESS_EVENT','WORK_PROFILE_EVENT',hook+';return useHrAccess;')(useState,useEffect,()=>new Promise((resolve,reject)=>pending.push({resolve,reject})),window,document,'managed','module','profile');
const context={company_id:'a',user_id:'self',available:true,administer:false};
useHook('self');assert.equal(state,null);pending.shift().resolve(context);await Promise.resolve();assert.equal(state.company_id,'a');
window.dispatchEvent(new Event('profile'));assert.equal(state,null);const old=pending.shift();window.dispatchEvent(new Event('profile'));const fresh=pending.shift();old.resolve(context);await Promise.resolve();assert.equal(state,null);fresh.resolve({...context,company_id:'b'});await Promise.resolve();assert.equal(state.company_id,'b');
window.dispatchEvent(new Event('managed'));assert.equal(state,null);pending.shift().resolve({...context,user_id:'other'});await Promise.resolve();assert.equal(state,null);
window.dispatchEvent(new Event('focus'));pending.shift().reject(Error('offline'));await Promise.resolve();await Promise.resolve();assert.equal(state,null);
window.dispatchEvent(new Event('focus'));const late=pending.shift();document.visibilityState='hidden';document.dispatchEvent(new Event('visibilitychange'));assert.equal(state,null);late.resolve(context);await Promise.resolve();assert.equal(state,null);
document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));pending.shift().resolve({...context,available:false});await Promise.resolve();assert.equal(state,null);
window.dispatchEvent(new Event('focus'));const disposed=pending.shift();cleanup.forEach(fn=>fn());disposed.resolve(context);await Promise.resolve();assert.equal(state,null);
const ui=fs.readFileSync('src/modules/hr/HrModule.jsx','utf8'),main=fs.readFileSync('src/main.jsx','utf8');
assert(!/localStorage|sessionStorage|indexedDB|signedUrl|\.storage\./.test(ui+source));
assert(ui.includes('session.get(payload.id)')&&ui.includes('payload.revision'));
assert(main.includes('useHrAccess(authUser?.id)')&&main.includes('tab === "hr"')&&main.includes('!hasActiveProjectWorkspace'));
const migration=fs.readFileSync('supabase/migrations/20261009185827_hr_navigation_context.sql','utf8');
assert(migration.includes('hr_private.require_actor(c)')&&migration.includes('content_enabled\',false'));
assert(migration.includes('from public,anon,authenticated,service_role'));
assert(!/is_systemadmin|kshms_private|user_metadata|create policy/i.test(migration));
// Real Preview regression: app-wide header rule made module titles stick over
// the app logo at scrollY>0. Only the actual app header may own that layer.
for(const [file,selector] of [['src/modules/hr/hr.css','.hr-module>header.hr-heading'],['src/modules/kshms/kshms.css','.ks-module>header.ks-heading']]){
 const css=fs.readFileSync(file,'utf8');assert(css.includes(selector+'{position:static;top:auto;z-index:auto}'),'Module header inherited app sticky positioning');
}
const workspaceCss=fs.readFileSync('src/modules/ui/moduleWorkspace.css','utf8');
assert(workspaceCss.includes('position:static;top:auto;z-index:auto')&&workspaceCss.includes('.hr-module .module-heading h2{color:#fff'),'Shared module headings must avoid the app sticky layer and inherited dark heading color');
console.log('✅ HR/menu H2: stable grouped routes, isolated global gate, foreground/background revocation, stale identity/offline/dispose and closed content surface PASS');
