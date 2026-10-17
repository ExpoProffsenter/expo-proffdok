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
  return {assessed,deviations,missingImages,complete:completed,ready:!completed&&assessed===items.length&&items.length>0&&!completionProblem(definition,answers)};
}
