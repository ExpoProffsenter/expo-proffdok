// Stable screen IDs preserve existing drafts, reminders and deep links.
export function kshmsNavigationGroups({canManage=false,pendingCount=0}={}) {
 return [
  {label:'Daglig arbeid',items:[['deviations','Avvik/RUH'],['sja','SJA'],['rounds','Vernerunder/kontroller'],['risk','Risikovurdering']]},
  {label:'Mine rutiner',items:[['reading',`Les og bekreft (${pendingCount})`],['personal','Min personalhåndbok']]},
  ...(canManage?[{label:'Forvaltning',items:[['handbook','Håndbok'],['checklists','Sjekklistesentral'],['followup','Oppfølging og revisjon'],['extract','Dokumentuttrekk'],['setup','Oppstart og tilgang']]}]:[]),
 ];
}
