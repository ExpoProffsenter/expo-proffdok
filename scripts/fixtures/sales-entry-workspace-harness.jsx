import React,{useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {WORK_PROFILE_EVENT} from '../../src/modules/access/workProfileClient.js';
import Entry from '../../src/modules/sales/components/SalesRequestForm.jsx';
import SalesEntryPanel from '../../src/modules/sales/components/SalesEntryPanel.jsx';
import Survey from '../../src/modules/sales/components/SalesSurveyPlan.jsx';
import Inspection from '../../src/modules/sales/components/SalesInspectionNote.jsx';
import StandardOffer from '../../src/modules/sales/components/SalesOfferBuilderCore.jsx';
import GeneralOffer from '../../src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx';
import Detail from '../../src/modules/sales/components/SalesDetailView.jsx';
import Workspace from '../../src/modules/sales/components/SalesCaseWorkspace.jsx';
import {emptyForm} from '../../src/modules/sales/constants/salesConstants.js';
import {createRequestId} from '../../src/modules/sales/utils/salesUtils.js';
import {buildOfferFormFromRequest,createEmptyOfferLine} from '../../src/modules/sales/utils/salesOfferLogic.js';
import {markStoreOfferLaunch,clearStoreOfferLaunch,isStoreOfferSource} from '../../src/modules/sales/services/salesStoreOffers.js';
import {validateSalesCaseHandler,salesCaseHandlerFields} from '../../src/modules/sales/services/salesCaseHandlers.js';
import {buildSalesStorageKey,loadSalesNavigation,saveSalesNavigation} from '../../src/modules/sales/services/salesLocalStorage.js';
import {markSalesWorkspaceResumeSnapshot} from '../../src/modules/sales/services/salesResumeRecovery.mjs';
import '../../src/style.css';
import '../../src/modules/sales/sales.css';
import '../../src/modules/app/mobileResponsive41A.css';
import '../../src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '../../src/modules/app/appRuntimeStyles.js';
const style=document.createElement('style');style.textContent=APP_RUNTIME_STYLES;document.head.appendChild(style);

/* QA_OFFER_TYPE_PICKER */

const candidate={userId:'10000000-0000-4000-8000-000000000001',displayName:'QA Saksbehandler',email:'qa@example.invalid'};
const storageKey=buildSalesStorageKey({integrationMode:'app',companyName:'QA Firma',userId:'reader'});
loadSalesNavigation(storageKey);
window.qa={records:[],calls:[],support:false,fail:false,hold:false,back:0,candidates:[candidate],storedCustomers:[{id:'customer-a',revision:1,customer:{customer:'Lagret QA Kunde',email:'stored@example.invalid',address:'Registerveien 1',postnr:'0001',city:'Oslo',phone:'123'}}]};
window.qa.customerRpc=async(name,args)=>{
 window.qa.calls.push({name,args});
 if(name==='search_company_customers')return {company_id:'company-a',customers:window.qa.storedCustomers};
 if(name==='save_company_customer')throw Error('No customer writes in this fixture');
 throw Error('Unexpected customer RPC '+name);
};
const client={rpc:async(name,args)=>{
 window.qa.calls.push({name,args});
 if(name!=='sales_case_handler_candidates')throw Error('Unexpected handler RPC');
 if(window.qa.hold)await new Promise(resolve=>window.qa.release=resolve);
 return window.qa.fail?{error:Error('QA lesefeil')}:{data:window.qa.candidates};
}};
function App(){
 const [mode,setMode]=useState('list'),[kind,setKind]=useState('request'),[form,setForm]=useState(emptyForm),[generation,setGeneration]=useState(0),[company,setCompany]=useState('company-a'),[allowed,setAllowed]=useState(true),[storeAllowed,setStoreAllowed]=useState(true);
 const [requests,setRequests]=useState([]),[selectedRequestId,setSelectedRequestId]=useState(''),[offerForm,setOfferForm]=useState({lines:[],options:[]}),[offerDraftSaveStatus,setOfferDraftSaveStatus]=useState('saved');
 const [surveyForm,setSurveyForm]=useState({date:'',time:'',note:'',sendConfirmation:false}),[inspectionForm,setInspectionForm]=useState({customerWishes:'',existingConditions:'',measurements:'',observations:'',photos:[]});
 const caseHandlerRequestScopeRef=useRef({key:'company-a',active:true}),latestRequestsRef=useRef([]),offerFormHydratedRequestIdRef=useRef(''),offerFormSavedBaselineRef=useRef('');
 const activeSupabase=client,salesCompanyId=company,setOfferFormReady=()=>{},createOfferFormChangeSignature=JSON.stringify;
 const resetForm=()=>setForm(emptyForm);
 const persistRequests=async rows=>{if(window.qa.persistFail)throw Error('QA lagring feilet');window.qa.records=structuredClone(rows);window.qa.calls.push({name:'persist',rows:structuredClone(rows)});};
 /* QA_CREATION_HANDLERS */
 const back=()=>{window.qa.back++;setMode('list');};
 const start=(type)=>{saveSalesNavigation(storageKey,type==='request'?'new':'new-offer',null);clearStoreOfferLaunch();if(type==='general')markStoreOfferLaunch();setKind(type);setForm(emptyForm);setGeneration(value=>value+1);setMode(type==='request'?'new':'new-offer');};
 window.qa.scope=(next,grant=true,store=true)=>{caseHandlerRequestScopeRef.current={key:next,active:grant};setCompany(next);setAllowed(grant);setStoreAllowed(store);setMode('list');setForm(emptyForm);};
 window.qa.backgroundRemount=()=>{markSalesWorkspaceResumeSnapshot({storageKey,navigation:{mode:kind==='request'?'new':'new-offer',selectedRequestId:null}},{localStorage,now:Date.now()});setForm(emptyForm);setGeneration(value=>value+1);};
 window.qa.sameProfile=()=>window.dispatchEvent(new CustomEvent(WORK_PROFILE_EVENT));
 window.qa.reopen=()=>{setRequests(structuredClone(window.qa.records));setMode('detail');};
 window.qa.openPlan=()=>setMode('survey-plan');
 const request=requests.find(row=>row.id===selectedRequestId);
 useLayoutEffect(()=>{window.qa.committed={mode,kind,company,allowed,storeAllowed,generation,form:structuredClone(form),selectedRequestId};});
 const updateOfferForm=(key,value)=>setOfferForm(current=>({...current,[key]:value}));
 const saveOffer=event=>{event?.preventDefault?.();const next={...request,offerTitle:offerForm.title,offerLines:offerForm.lines,offerOptions:offerForm.options};setRequests(rows=>rows.map(row=>row.id===next.id?next:row));window.qa.records=structuredClone(requests.map(row=>row.id===next.id?next:row));window.qa.calls.push({name:'offer-save'});};
 let content;
 if(mode==='new'||mode==='new-offer')content=<Entry key={company+generation} form={form} isDirectOffer={mode==='new-offer'} onUpdateForm={(key,value)=>setForm(current=>({...current,[key]:value}))} caseHandlerClient={client} caseHandlerCompanyId={company} onChooseCaseHandler={handler=>setForm(current=>({...current,responsibleUserId:handler.userId,responsibleName:handler.displayName}))} onBack={back} onCancel={()=>{resetForm();back();}} onSubmit={mode==='new-offer'?handleCreateDirectOffer:handleCreateRequest}/>;
 else if(mode==='picker')content=<OfferTypePicker canUseStoreOffers={storeAllowed} onWetroom={()=>start('wetroom')} onStore={()=>start('general')} onClose={back}/>;
 else if(mode==='offer-builder'&&request){const props={selectedRequest:request,offerForm,offerDraftSaveStatus,onBack:()=>setMode('detail'),handleSaveOffer:saveOffer,updateOfferForm,addOfferLine:()=>setOfferForm(current=>({...current,lines:[...current.lines,createEmptyOfferLine()]})),updateOfferLine:(id,key,value)=>setOfferForm(current=>({...current,lines:current.lines.map(row=>row.id===id?{...row,[key]:value}:row)}))};content=<Workspace request={request} companyProfile={{companyName:'QA Firma'}}>{isStoreOfferSource(request.source)?<GeneralOffer {...props}/>:<StandardOffer {...props}/>}</Workspace>;}
 else if(mode==='survey-plan'&&request)content=<Workspace request={request}><Survey selectedRequest={request} surveyForm={surveyForm} loggedInResponsible="QA Saksbehandler" onBack={()=>setMode('detail')} onUpdateSurveyForm={(key,value)=>setSurveyForm(current=>({...current,[key]:value}))} onSubmit={event=>{event.preventDefault();window.qa.savedPlan=structuredClone(surveyForm);setMode('detail');}}/></Workspace>;
 else if(mode==='inspection-note'&&request)content=<Workspace request={request}><Inspection selectedRequest={request} inspectionForm={inspectionForm} loggedInResponsible="QA Saksbehandler" onUpdateInspectionForm={(key,value)=>setInspectionForm(current=>({...current,[key]:value}))} onBack={()=>setMode('detail')} onSubmit={event=>{event.preventDefault();window.qa.savedInspection=structuredClone(inspectionForm);setMode('detail');}}/></Workspace>;
 else if(mode==='detail'&&request)content=<><Detail selectedRequest={request} summary={{}} loggedInResponsible="QA Saksbehandler" goToList={back} openEditRequest={()=>{}} openSurveyPlanning={()=>setMode('survey-plan')} openInspectionNote={()=>setMode('inspection-note')} openOfferBuilder={()=>{setOfferForm(buildOfferFormFromRequest(request));setMode('offer-builder');}}/><button onClick={()=>window.qa.openPlan()}>Åpne plan i prøve</button><button onClick={()=>setMode('inspection-note')}>Åpne notat i prøve</button></>;
 else content=<><button onClick={()=>start('request')}>Ny forespørsel</button><button onClick={()=>setMode('picker')}>Nytt tilbud</button><button onClick={()=>window.qa.reopen()}>Les lagret prøvesak</button></>;
 return <div data-expo-app-shell="true"><header style={{padding:20}}>Expo ProffDok · QA Firma</header><main data-sales-resume-workspace="true">{allowed?content:<p>Tilgangen er borte</p>}</main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);
