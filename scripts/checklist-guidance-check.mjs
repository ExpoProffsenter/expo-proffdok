import assert from 'node:assert/strict';
import {checklistDisplayState,matchesChecklistFilter} from '../src/modules/checklist/checklistDisplay.mjs';
import {completionProblem} from '../src/modules/checklist/checklistRuns.mjs';
import {signatureProblem} from '../src/modules/checklist/checklistSignatures.mjs';
let checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const field={id:'00000000-0000-4000-8000-000000000001',type:'text',label:'Måling',required:true};
const photo={url:'https://example.invalid/synthetic-proof'};
const cases=[
 ['required image missing',{image_required:true},{status:'Ok'},false,1],
 ['required comment missing',{comment_required:true},{status:'Ok'},false,1],
 ['alternative documentation missing',{documentation_either:true},{status:'Ok'},false,1],
 ['required image supplied',{image_required:true},{status:'Ok',photos:[photo]},true,0],
 ['required comment supplied',{comment_required:true},{status:'Ok',comment:'Kontrollert'},true,0],
 ['alternative comment supplied',{documentation_either:true},{status:'Ok',comment:'Kontrollert'},true,0],
 ['alternative photo supplied',{documentation_either:true},{status:'Ok',photos:[photo]},true,0],
 ['both requirements: comment missing',{image_required:true,comment_required:true},{status:'Ok',photos:[photo]},false,1],
 ['both requirements: image missing',{image_required:true,comment_required:true},{status:'Ok',comment:'Kontrollert'},false,1],
 ['both requirements satisfied',{image_required:true,comment_required:true},{status:'Ok',photos:[photo],comment:'Kontrollert'},true,0],
 ['alternative has precedence',{image_required:true,comment_required:true,documentation_either:true},{status:'Ok',comment:'Kontrollert'},true,0],
 ['blank comment is missing',{comment_required:true},{status:'Ok',comment:'  \n '},false,1],
 ['blank photo URL is missing',{image_required:true},{status:'Ok',photos:[{url:' '}]},false,1],
 ['required subfield missing',{fields:[field]},{status:'Ok'},false,1],
 ['required subfield supplied',{fields:[field]},{status:'Ok',values:{[field.id]:'12'}},true,0],
 ['not assessed',{}, {},false,0],
 ['allowed not applicable',{image_required:true,comment_required:true,fields:[field]},{status:'Ikke aktuelt'},true,0],
 ['forbidden not applicable',{allow_na:false},{status:'Ikke aktuelt'},false,0],
 ['open deviation is not silently closed',{}, {status:'Avvik'},true,0],
 ['closed deviation remains closed',{}, {status:'Lukket avvik'},true,0]
];
for(const [label,requirement,answer,ready,missing] of cases){
 const definition={category:'Syntetisk kontroll',items:['Punkt'],requirements:{Punkt:requirement}};
 const answers={Punkt:answer},before=JSON.stringify({definition,answers});
 const display=checklistDisplayState(definition,answers,false);
 eq(display.ready,ready,label+': readiness');
 eq(display.missingDocumentation,missing,label+': missing documentation');
 eq(display.problem,completionProblem(definition,answers),label+': same completion guidance');
 eq(display.stage,ready?'ready':'work',label+': work stage');
 eq(matchesChecklistFilter(display,'images'),missing>0,label+': documentation filter');
 eq(matchesChecklistFilter(display,'ready'),ready,label+': final-review filter');
 eq(matchesChecklistFilter(display,'work'),!ready,label+': remaining-work filter');
 eq(matchesChecklistFilter(display,'unfinished'),true,label+': unfinished preserved');
 eq(display.complete,false,label+': never implicitly completed');
 eq(JSON.stringify({definition,answers}),before,label+': no mutation');
 const completed=checklistDisplayState(definition,answers,true);
 eq(completed.complete,true,label+': historic completion preserved');
 eq(completed.ready,false,label+': no review suggestion for completed control');
 eq(matchesChecklistFilter(completed,'completed'),true,label+': completed filter');
 eq(matchesChecklistFilter(completed,'unfinished'),false,label+': completed not unfinished');
}
const condition={id:'00000000-0000-4000-8000-000000000002',type:'yesno',label:'Behov',required:true};
const conditional={...field,when:{field_id:condition.id,equals:'Ja'}};
const definition={category:'Betinget',items:['Punkt'],requirements:{Punkt:{fields:[condition,conditional]}}};
eq(checklistDisplayState(definition,{Punkt:{status:'Ok',values:{[condition.id]:'Nei'}}}).ready,true,'hidden required field does not block');
eq(checklistDisplayState(definition,{Punkt:{status:'Ok',values:{[condition.id]:'Ja'}}}).ready,false,'visible required field blocks');
eq(checklistDisplayState({items:[]}).ready,false,'empty list is not ready');
eq(checklistDisplayState({}).ready,false,'missing items is not ready');
eq(checklistDisplayState({items:['Punkt']},{Punkt:{status:'Avvik'}}).deviations,1,'open deviation remains visible');
eq(checklistDisplayState({items:['Punkt']},{Punkt:{status:'Lukket avvik'}}).deviations,0,'closed deviation not reopened');
eq(Boolean(signatureProblem({})),true,'content-ready still requires own signature');
console.log(`Checklist guidance: ${checks} assertions PASS — content requirements, documentation, filters, immutable history and unchanged signature requirement`);
