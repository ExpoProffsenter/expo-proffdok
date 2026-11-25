import {fieldProblem} from './checklistFields.mjs';
import {completionProblem} from './checklistRuns.mjs';

export function checklistDisplayState(definition,answers={},completed=false) {
  const items=definition.items||[];
  const assessed=items.filter(item=>answers[item]?.status).length;
  const deviations=items.filter(item=>answers[item]?.status==='Avvik').length;
  const missingImages=items.filter(item=>{
    const answer=answers[item]||{},requirement=definition.requirements?.[item]||{};
    if(answer.status==='Ikke aktuelt')return false;
    if(requirement.documentation_either&&String(answer.comment||'').trim())return false;
    return (requirement.image_required||requirement.documentation_either)&&!(answer.photos||[]).some(photo=>String(photo.url||'').trim());
  }).length;
  const fieldsReady=items.every(item=>{const a=answers[item]||{},r=definition.requirements?.[item]||{};return a.status==='Ikke aktuelt'?r.allow_na!==false:!fieldProblem(r.fields,a.values);});
  return {assessed,deviations,missingImages,complete:completed,ready:!completed&&assessed===items.length&&items.length>0&&fieldsReady};
}


// Presentation only: use the same content requirements as the existing completion
// command. Ready is a review/signing stage, never a completed or persisted run.
export function projectChecklistDisplayState(definition,answers={},completed=false) {
  const items=definition.items||[];
  const base=checklistDisplayState(definition,answers,completed);
  const missingDocumentation=items.filter(item=>{
    const answer=answers[item]||{},requirement=definition.requirements?.[item]||{};
    if(answer.status==='Ikke aktuelt')return false;
    const photo=(answer.photos||[]).some(value=>String(value.url||'').trim());
    const comment=String(answer.comment||'').trim();
    return Boolean(fieldProblem(requirement.fields,answer.values)) || (requirement.documentation_either
      ? !photo&&!comment
      : Boolean(requirement.image_required&&!photo||requirement.comment_required&&!comment));
  }).length;
  const problem=completionProblem({...definition,items},answers);
  const ready=!completed&&items.length>0&&!problem;
  return {...base,missingDocumentation,problem,ready,
    stage:completed?'completed':ready?'ready':'work'};
}

export function matchesChecklistFilter(display,filter='all') {
  return filter==='all'
    || filter==='unfinished'&&!display.complete
    || filter==='work'&&!display.complete&&!display.ready
    || filter==='ready'&&display.ready
    || filter==='completed'&&display.complete
    || filter==='deviations'&&display.deviations>0
    || filter==='images'&&display.missingDocumentation>0;
}
