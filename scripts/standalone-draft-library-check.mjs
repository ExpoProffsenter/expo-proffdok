import assert from 'node:assert/strict';
import {readStandaloneDraft,readStandaloneDrafts,persistStandaloneDraft,removeStandaloneDraft,standaloneDraftKey,standaloneDraftsKey} from '../src/modules/checklist/standaloneChecklists.mjs';
const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const old={id:'old',requestId:'frozen-request',revision:0,definition:{title:'Old work',points:[]},answers:{A:{status:'Avvik',comment:'Keep this',photos:[{data:'photo'}]}},pendingAction:'save'};
const fresh={id:'new',requestId:'new-request',revision:0,definition:{title:'New work',points:[]},answers:{}};
memory.set(standaloneDraftKey('u','c'),JSON.stringify(old));
persistStandaloneDraft(storage,'u','c',fresh);assert.deepEqual(readStandaloneDrafts(storage,'u','c').find(r=>r.id==='old'),old);assert.deepEqual(readStandaloneDraft(storage,'u','c'),fresh);
persistStandaloneDraft(storage,'u','c',old);assert.equal(readStandaloneDrafts(storage,'u','c').length,2);assert.deepEqual(readStandaloneDraft(storage,'u','c'),old);
assert.deepEqual(readStandaloneDrafts(storage,'other','c'),[]);assert.deepEqual(readStandaloneDrafts(storage,'u','other'),[]);
removeStandaloneDraft(storage,'u','c','new');assert.deepEqual(readStandaloneDraft(storage,'u','c'),old);assert.equal(readStandaloneDrafts(storage,'u','c').length,1);
for(const failingKey of [standaloneDraftsKey('u','c'),standaloneDraftKey('u','c')]){
 memory.clear();memory.set(standaloneDraftKey('u','c'),JSON.stringify(old));const failing={...storage,setItem:(k,v)=>{if(k===failingKey)throw Error('quota');storage.setItem(k,v);}};
 assert.throws(()=>persistStandaloneDraft(failing,'u','c',fresh),/quota/);assert.deepEqual(readStandaloneDraft(storage,'u','c'),old);assert.deepEqual(readStandaloneDrafts(storage,'u','c').find(r=>r.id==='old'),old);
}
memory.clear();memory.set(standaloneDraftKey('u','c'),JSON.stringify(old));memory.set(standaloneDraftsKey('u','c'),'broken');assert.throws(()=>persistStandaloneDraft(storage,'u','c',fresh));assert.throws(()=>removeStandaloneDraft(storage,'u','c','old'));assert.deepEqual(readStandaloneDraft(storage,'u','c'),old);
console.log('Standalone draft library PASS: legacy pending payload unchanged; new draft, independent reopen/removal, user/firm isolation, corrupt cache and both storage failure boundaries preserve old work.');
