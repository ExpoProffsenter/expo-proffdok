import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installPageScrollMemory} from '../src/modules/app/pageScrollMemory.mjs';
function fixture(){
 const win=new EventTarget(),doc=new EventTarget();let id=0;const timers=new Map(),frames=new Map(),storage=new Map(),jumps=[];
 Object.assign(win,{scrollY:920,sessionStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)},setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:i=>timers.delete(i),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),scrollTo:o=>{jumps.push(o.top);win.scrollY=o.top;}});doc.hidden=false;
 const flush=()=>{for(const m of [frames,timers]){const f=[...m.values()];m.clear();for(const fn of f)fn();}};
 return {win,doc,jumps,storage,flush,event:(target,type)=>target.dispatchEvent(new Event(type)),hide(){doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));},show(){doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));}};
}
// Ensure the real main effect uses the tested shared listener.
const old=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');assert(old.includes('return installPageScrollMemory({projectId,tab})'));assert(!old.includes('window.addEventListener("focus", restoreScroll)'));
for(const tab of ['tilgang','hr','kshms','sjekklister','prosjektering','tilbud']){
 let f=fixture(),cleanup=installPageScrollMemory({projectId:'p',tab,win:f.win,doc:f.doc});f.storage.set(`expoProffDokScroll:p:${tab}`,'100');f.event(f.doc,'keydown');f.event(f.win,'blur');f.event(f.win,'focus');f.flush();assert.deepEqual(f.jumps,[],tab+' screenshot/focus jumped');assert.equal(f.win.scrollY,920);
 f.hide();f.win.scrollY=0;f.show();f.flush();assert.equal(f.win.scrollY,920,tab+' background lost position');
 f.hide();f.show();f.flush();const before=f.jumps.length;assert.equal(before,1,'stable position scrolled again');
 f.hide();f.win.scrollY=0;f.show();f.event(f.doc,'keydown');f.win.scrollY=400;f.flush();assert.equal(f.win.scrollY,400,'keyboard intent overwritten');
 f.hide();f.win.scrollY=0;f.show();f.event(f.doc,'pointerdown');f.win.scrollY=250;f.flush();assert.equal(f.win.scrollY,250,'pointer intent overwritten');
 f.hide();f.win.scrollY=0;f.show();cleanup();f.flush();assert.equal(f.win.scrollY,0,'unmounted tab still scrolled');
 f=fixture();cleanup=installPageScrollMemory({tab,win:f.win,doc:f.doc});f.win.scrollY=0;f.hide();f.win.scrollY=350;f.show();f.flush();assert.equal(f.win.scrollY,0,'intentional zero treated as stale');cleanup();
}
console.log('Page scroll memory PASS: screenshot/focus does not jump across six tabs, actual hide/resume preserves position including zero, keyboard/pointer cancels retries, cleanup prevents stale-tab scroll.');
