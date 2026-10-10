// Global app flow, followed by the project workspace flow and administration.
export const HELP_FLOW=['start','mobil','sales','badskisse','butikktilbud','company-customers-vat','cordel','prissok','firmaProfil','epostvalg','arbeidsprofil','firma','prosjektliste','info','tilbud','prosjektering','quality','produkter','overflater','bilder','tilgang','fagUtstyr','sjekklister','avvik','project-document-overview','chat','interne','overtagelse','garanti','rapport','kshms','hr','hjelp','systemadmin'];
const PROJECT_HELP=new Set(['quality','info','tilbud','prosjektering','produkter','overflater','bilder','tilgang','fagUtstyr','sjekklister','avvik','project-document-overview','chat','interne','overtagelse','garanti','rapport','prosjektliste']);
export function presentHelpTopics(sections,{moduleKeys=[],canUseKshms=false,canUseHr=false,isCompanyAdmin=false,isSystemAdmin=false,canExportCordel=false,canUseInternalCommerce=false}={}){
 const keys=new Set(moduleKeys);
 return sections.filter(item=>{
  if(item.key==='kshms')return canUseKshms;
  if(item.key==='hr')return canUseHr;
  if(PROJECT_HELP.has(item.key))return keys.has('projects');
  if(['sales','badskisse','company-customers-vat'].includes(item.key))return keys.has('sales');
  if(item.key==='butikktilbud')return keys.has('store_offers');
  if(item.key==='cordel')return canExportCordel&&keys.has('sales');
  if(item.key==='prissok')return canUseInternalCommerce;
  if(item.key==='firma')return isCompanyAdmin||isSystemAdmin;
  if(item.key==='systemadmin')return isSystemAdmin;
  return true;
 }).sort((a,b)=>(HELP_FLOW.includes(a.key)?HELP_FLOW.indexOf(a.key):HELP_FLOW.length)-(HELP_FLOW.includes(b.key)?HELP_FLOW.indexOf(b.key):HELP_FLOW.length));
}
export const plainHelpTitle=title=>String(title).replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]+\s*/u,'');
