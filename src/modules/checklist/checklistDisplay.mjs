import {fieldProblem} from './checklistFields.mjs';
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
