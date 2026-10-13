import {checklistTemplate} from '../config/projectConfig.js';
import {SOPRO_SYSTEM_CHECKLIST_TEMPLATES} from '../config/soproChecklistTemplates.mjs';
import {PROJECT_DESIGN_CHECKLIST} from '../config/projectDesignChecklist.mjs';
export const controllerCode=()=>crypto.randomUUID().replaceAll('-','').toUpperCase();
export const controllerLink=(id,origin=window.location.origin)=>`${origin}/?controller=${encodeURIComponent(id)}`;
export function controllerExpiry(value){const d=new Date(value);if(!value||!Number.isFinite(d.getTime())||d.getTime()<=Date.now())throw Error('Velg en gyldig utløpsdato og tid i fremtiden.');return d.toISOString();}
export function controllerGroups(data={}){
 const p=data.project||{},groups=new Map(),add=g=>{if(g?.category&&Array.isArray(g.items))groups.set(g.category,{...g,items:[...g.items]});};
 if(p.workflowType!=='simple_order'&&p.simpleOrder!==true)checklistTemplate.forEach(add);
 if(data.warranty?.enabled)(SOPRO_SYSTEM_CHECKLIST_TEMPLATES[data.warranty.system]||[]).forEach(add);add(PROJECT_DESIGN_CHECKLIST);(data.product_checklists||[]).forEach(add);
 for(const i of p.kshmsChecklistInstances||[])if(i.content?.points)add({category:i.category||i.content.title,items:i.content.points.map(x=>x.title),instructions:i.content.instructions});
 for(const e of p.customChecklistGroups||[]){const c=`Egne sjekkpunkter – ${e.trade||e.fag||'Annet fag'}`,t=e.text||e.item||e.title;if(!t)continue;if(!groups.has(c))add({category:c,items:[]});if(!groups.get(c).items.includes(t))groups.get(c).items.push(t);}
 for(const [c,answers] of Object.entries(data.checklist||{})){if(!groups.has(c))add({category:c,items:[]});for(const t of Object.keys(answers||{}))if(!groups.get(c).items.includes(t))groups.get(c).items.push(t);}
 for(const r of data.runs||[])if(!groups.has(r.category))add(r.definition);return [...groups.values()];
}
export function controllerSafeUrl(value){try{const u=new URL(String(value||''));return u.protocol==='https:'?u.href:'';}catch{return '';}}
