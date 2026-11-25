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
// Execute the actual hydration/local-autosave effects in their React order.
// Pending state commits deliberately lag refs, reproducing the dangerous first-render window.
const hydrationStart=source.indexOf('  // Inspection hydration follows');
const hydrationEnd=source.indexOf('\n  useEffect(() => {\n    if (mode !== "inspection-note" || !selectedRequestId) return;',hydrationStart);
assert(hydrationStart>=0&&hydrationEnd>hydrationStart);
const saveEnd=source.indexOf('\n\n',hydrationEnd+2);
const args=['useEffect','mode','selectedRequestId','selectedRequest','integrationMode','inspectionFormHydratedRequestIdRef','loadInspectionDraft','buildInspectionDraftKey','salesStorageKey','setInspectionForm','setInspectionDraftDirty','inspectionInitialForm','setInspectionFormReady','inspectionFormReady','inspectionForm','saveInspectionDraft'];
const hydrate=new Function(...args,source.slice(hydrationStart,hydrationEnd));
const autoSave=new Function(...args,source.slice(hydrationEnd,saveEnd));
let currentForm={customerWishes:'',existingConditions:'',measurements:'',observations:'',photos:[]},ready='',pendingForm,pendingReady;
const ref={current:''},saved=[];let reads=0,localDraft=null;
const effectArgs=(selected,mode='inspection-note')=>[fn=>fn(),mode,selected.id,selected,'app',ref,()=>{reads++;return localDraft;},(scope,id)=>scope+':'+id,'qa-scope',value=>{pendingForm=value;},()=>{},inspectionInitialForm,value=>{pendingReady=value;},ready,currentForm,value=>saved.push(value)];
const summary={id:request.id,__summaryOnly:true};hydrate(...effectArgs(summary));autoSave(...effectArgs(summary));
eq(reads,0,'summary cannot initialize draft');eq(saved.length,0,'summary mount cannot autosave empty form');eq(ready,'','summary remains gated');
hydrate(...effectArgs(request));autoSave(...effectArgs(request));eq(saved.length,0,'first hydration render cannot save before state commit');
currentForm=pendingForm;ready=pendingReady;autoSave(...effectArgs(request));eq(saved.at(-1),expected,'first permitted local save contains server text and photos');
currentForm={...currentForm,customerWishes:'Unsent user edit'};hydrate(...effectArgs({...request,inspectionCustomerWishes:'Late server text'}));eq(pendingForm.customerWishes,'Serverønske','same-case late refresh does not overwrite user form');
autoSave(...effectArgs(request,'detail'));eq(saved.length,1,'intentional exit cannot save stale inspection state');
ref.current='another-case';autoSave(...effectArgs(summary));eq(saved.length,1,'another case cannot inherit ready flag for local save');
const another={...request,id:'QA-OTHER',inspectionCustomerWishes:'Other case text'};
ref.current=request.id;hydrate(...effectArgs(another));autoSave(...effectArgs(another));eq(saved.length,1,'new complete case cannot save previous form while state commit is pending');
currentForm=pendingForm;ready=pendingReady;autoSave(...effectArgs(another));eq(saved.at(-1).customerWishes,'Other case text','first save in new case has its own text');
console.log('sales-inspection-initializer-check: '+checks+' PASS – actual Core initial state, server fields, meaningful offline draft, empty draft, scope and ordinary navigation.');
