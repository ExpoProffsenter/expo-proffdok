import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readDraft,persistDraft} from '../src/modules/kshms/kshmsDraft.mjs';
import {ROUTINE_CATALOG,suggestedRoutines,currentVersionSnapshot,ACK_STATEMENT} from '../src/modules/kshms/kshmsCatalog.mjs';
import {createGlobalAppTabs,createProjectWorkspaceTabs} from '../src/modules/project/projectNavigationTabs.mjs';
// Actual refresh hook: stale responses may never revive old company access.
const source=fs.readFileSync('src/modules/kshms/kshmsAccess.js','utf8');
const hook=source.slice(source.indexOf('export function useKshmsAccess')).replace('export function','function');
const requests=[],cleanups=[];let context,surface=null;
const window=new EventTarget();
const rpc=()=>new Promise((resolve,reject)=>requests.push({resolve,reject}));
const run=new Function('useState','useEffect','kshmsRpc','window','MANAGED_ACCESS_EVENT','MODULE_ACCESS_EVENT','WORK_PROFILE_EVENT',hook+';return useKshmsAccess;');
// Mirror the App's actual scope-keyed mount gate: losing enabled context
// unmounts KS/HMS and resets its local screen/setup on the next mount.
const renderSurface=()=>{if(!context?.enabled)surface=null;else if(surface?.company!==context.company_id)surface={company:context.company_id,screen:'handbook',activities:''};};
run(v=>{context=v;return[v,next=>{context=typeof next==='function'?next(context):next;renderSurface();}]},f=>cleanups.push(f()),rpc,window,'managed','module','profile')('u1');
assert.equal(context,null);
requests[0].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context.company_id,'a');
surface.screen='setup';surface.activities='Ulagret oppstart for firma A';
window.dispatchEvent(new Event('focus'));assert.equal(context.company_id,'a','Background focus discarded visible draft context');
const profile=company=>{const event=new Event('profile');event.detail={active_company_id:company};window.dispatchEvent(event);};
profile('a');
assert.equal(surface?.screen,'setup','Same-company work-profile refresh remounted KS/HMS to its start screen');
assert.equal(surface.activities,'Ulagret oppstart for firma A','Same-company foreground refresh lost the unsaved setup');
requests[2].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();
requests[1].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(surface.screen,'setup');
window.dispatchEvent(new Event('focus'));profile('b');assert.equal(context,null);assert.equal(surface,null,'Real work-profile change must immediately unmount the old firm');
requests[4].resolve({user_id:'u1',company_id:'b',enabled:false});await Promise.resolve();
requests[3].resolve({user_id:'u1',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context.company_id,'b');assert.equal(context.enabled,false);
window.dispatchEvent(new Event('managed'));assert.equal(context,null);
requests[5].resolve({user_id:'another-user',company_id:'a',enabled:true});await Promise.resolve();assert.equal(context,null);
window.dispatchEvent(new Event('module'));requests[6].reject(new Error('network'));await Promise.resolve();await Promise.resolve();assert.equal(context,null);
window.dispatchEvent(new Event('focus'));cleanups[0]();requests[7].resolve({user_id:'u1',enabled:true});await Promise.resolve();assert.equal(context,null);
const count=requests.length;window.dispatchEvent(new Event('profile'));assert.equal(requests.length,count);
// A new auth identity must not render the prior user's context before effects run.
const renderHook=run(()=>[{user_id:'u1',company_id:'a',enabled:true},()=>{}],()=>{},rpc,window,'managed','module','profile');
assert.equal(renderHook('u1').company_id,'a');assert.equal(renderHook('u2'),null);assert.equal(renderHook(null),null);
// Company/user draft recovery is explicit and keeps the original server revision.
const memory=new Map();const storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
persistDraft(storage,'u1','a',{id:'r1',revision:4,draft:{title:'Meaningful local text',procedure:'Local work'}});
assert.equal(readDraft(storage,'u1','a').revision,4);
assert.equal(readDraft(storage,'u2','a'),null);assert.equal(readDraft(storage,'u1','b'),null);
memory.set('expo:kshms:draft:v1:u1:a','{broken');assert.equal(readDraft(storage,'u1','a'),null);
assert(!createGlobalAppTabs().some(([id])=>id==='kshms'));assert(createGlobalAppTabs({canUseKshms:true}).some(([id])=>id==='kshms'));
assert(!createProjectWorkspaceTabs().some(([id])=>id==='kshms'));
assert(suggestedRoutines(['maler'],'våtrom').some(r=>r.key==='wetroom'));
assert(!suggestedRoutines(['maler'],'fasade').some(r=>r.key==='wetroom'));
assert(!suggestedRoutines(['tomrer'],'montering').some(r=>r.key==='chemicals'));
assert(ROUTINE_CATALOG.length===12);
for(const routine of ROUTINE_CATALOG){assert(routine.procedure && routine.references.length);for(const ref of routine.references)assert(ref.checked_on==='2026-10-05'&&/^https:\/\//.test(ref.url));}
assert.deepEqual(currentVersionSnapshot({routines:[{id:'r1'},{id:'r2',archived:true}],versions:[{routine_id:'r1',id:'v2',content_hash:'new'},{routine_id:'r1',id:'v1',content_hash:'old'}]}),[{id:'v2',hash:'new'}]);
const coverage=JSON.parse(fs.readFileSync('docs/kshms/coverage.json','utf8'));
assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')).length,105);assert.equal(coverage.topics.filter(r=>r.id.startsWith('K')&&r.personal_pages!=='—').length,88);
for(const [field,total] of [['quality_pages',148],['personal_pages',127]]){
 const pages=new Set();for(const row of coverage.topics)for(const section of row[field].split(';')){const range=section.split('–').map(Number);if(range.every(Number.isFinite))for(let page=range[0];page<=(range[1]||range[0]);page++)pages.add(page);}
 for(let page=1;page<=total;page++)assert(pages.has(page),`Source page ${field}:${page} missing`);
}
assert(fs.readFileSync('supabase/migrations/20261005195941_kshms_handbook_foundation.sql','utf8').includes(ACK_STATEMENT));
console.log('critical-kshms-check: OK – grant/profile races, cleanup, scoped draft recovery, navigation, relevance and 275 source pages');
