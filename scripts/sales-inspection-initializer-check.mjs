import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inspectionInitialForm,inspectionNeedsTextChoice,inspectionServerText} from '../src/modules/sales/services/salesInspectionInitialForm.mjs';
const source=process.env.INSPECTION_INITIALIZER_BASELINE
  ? execFileSync('git',['show',process.env.INSPECTION_INITIALIZER_BASELINE+':src/modules/sales/SalesModuleCore.jsx'],{encoding:'utf8'})
  : fs.readFileSync('src/modules/sales/SalesModuleCore.jsx','utf8');
const start=source.indexOf('  const [inspectionForm, setInspectionForm] = useState(');
assert(start>=0);const end=source.indexOf('\n  const [inspectionDraftDirty',start);assert(end>start);
// Execute the actual Core initializer in isolation, with the same already-hydrated
// request list and scoped draft lookup. No replacement initializer in the fixture.
const initialize=new Function('useState','initialNavigation','requests','salesStorageKey','buildInspectionDraftKey','loadInspectionDraft','inspectionInitialForm',source.slice(start,end)+'\nreturn inspectionForm;');
const request={id:'QA-RESUME',inspectionCustomerWishes:'Serverønske',inspectionExistingConditions:'Serverforhold',inspectionMeasurements:'2 x 3 m',inspectionObservations:'Serverobservasjon',inspectionPhotos:[{id:'photo',path:'qa/photo'}]};
const initialNavigation={mode:'inspection-note',selectedRequestId:request.id};
const expected={customerWishes:'Serverønske',existingConditions:'Serverforhold',measurements:'2 x 3 m',observations:'Serverobservasjon',photos:request.inspectionPhotos};
let checks=0;const eq=(a,b,n)=>{assert.deepEqual(a,b,n);checks++;};
let draft=null;const calls=[];
const run=(navigation=initialNavigation,rows=[request],scope='firma-a:user-a')=>initialize(value=>[typeof value==='function'?value():value,()=>{}],navigation,rows,scope,(s,id)=>s+':inspection-draft:'+id,key=>{calls.push(key);return draft;},inspectionInitialForm);
eq(run(),expected,'direct inspection remount starts with all server fields before first autosave');
eq(calls.at(-1),'firma-a:user-a:inspection-draft:QA-RESUME','lookup remains company/user/case scoped');
draft={form:{customerWishes:'Usynkronisert lokal endring',existingConditions:'',measurements:'',observations:'',photos:[{id:'local',localDraftKey:'indexeddb:qa'}]}};
eq(run(),draft.form,'meaningful offline draft and its intentional empty fields remain intact');
draft={form:{customerWishes:'',existingConditions:'',measurements:'',observations:'',photos:[]}};
eq(run(),expected,'structurally empty initial draft cannot blank existing server case');
draft=null;eq(run({...initialNavigation,selectedRequestId:'missing'},[]),{customerWishes:'',existingConditions:'',measurements:'',observations:'',photos:[]},'new case remains empty');
const before=calls.length;eq(run({mode:'detail',selectedRequestId:request.id}),{customerWishes:'',existingConditions:'',measurements:'',observations:'',photos:[]},'ordinary detail mount keeps existing empty non-editor state');eq(calls.length,before,'ordinary case does not read an inspection draft prematurely');
eq(inspectionNeedsTextChoice(request,{photos:request.inspectionPhotos}),true,'old media-only local draft requires explicit text choice');
eq(inspectionNeedsTextChoice(request,{customerWishes:'Lokal tekst'}),false,'meaningful local text does not trigger choice');
eq(inspectionNeedsTextChoice({},{}),false,'truly new empty note needs no recovery choice');
eq(Object.keys(inspectionServerText(request)).includes('photos'),false,'text recovery never replaces local photos');
console.log('sales-inspection-initializer-check: '+checks+' PASS – actual Core initial state, server fields, meaningful offline draft, empty draft, scope and ordinary navigation.');
