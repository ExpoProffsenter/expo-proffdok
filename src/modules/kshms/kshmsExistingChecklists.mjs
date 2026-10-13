import {checklistTemplate,STANDARD_WETROOM_TEMPLATE_POINTS} from '../config/projectConfig.js';
import {SOPRO_SYSTEM_CHECKLIST_TEMPLATES} from '../config/soproChecklistTemplates.mjs';
import {blankChecklist,CHECKLIST_TRADES,checklistContent} from './kshmsChecklists.mjs';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const row=(id,title,trade,groups,kind='standard',instructions='')=>freeze({id,title,trade,groups,kind,locked:kind==='warranty',instructions});
export function existingChecklistCatalog({projects=[],checkpoints=[]}={}){
 const rows=checklistTemplate.map((group,index)=>row(`standard:${index}`,group.category,'Murer/flislegger',[structuredClone(group)]));
 for(const [trade,items] of Object.entries(STANDARD_WETROOM_TEMPLATE_POINTS))rows.push(row(`trade:${trade}`,`Fagpunkter – ${trade}`,trade,[{category:trade,items:[...items]}]));
 for(const [system,groups] of Object.entries(SOPRO_SYSTEM_CHECKLIST_TEMPLATES))rows.push(row(`warranty:${system}`,system==='sopro-aeb-815'?'Sopro AEB 815 – garantipunkter':'Sopro FDF 525/527 – garantipunkter','Murer/flislegger',structuredClone(groups),'warranty'));
 const products=new Map();
 for(const point of checkpoints){const locked=point.checkpoint_type!=='standard',key=`${locked?'warranty-product':'product'}:${point.product_no}:${point.guarantee_system||'all'}`;if(!products.has(key))products.set(key,{title:`Produkt ${point.product_no} · ${point.guarantee_system||'Alle systemer'}`,items:[],requirements:{},locked});const group=products.get(key),title=String(point.checkpoint_text||'').trim();if(!title||group.items.includes(title))continue;group.items.push(title);group.requirements[title]={image_required:point.image_required===true,comment_required:point.comment_required===true};}
 for(const [id,group] of products)if(group.items.length)rows.push(row(id,group.title,'Murer/flislegger',[{category:group.title,items:group.items,requirements:group.requirements}],group.locked?'warranty':'product'));
 const seen=new Set();
 for(const project of projects){const trades=new Map();for(const point of project.custom||[]){const trade=String(point.trade||point.fag||'Annet fag'),text=String(point.text||point.item||point.title||'').trim();if(!text)continue;if(!trades.has(trade))trades.set(trade,[]);if(!trades.get(trade).includes(text))trades.get(trade).push(text);}
  const definitions=[...trades].map(([trade,items])=>({title:`Egne prosjektpunkter – ${trade}`,trade,groups:[{category:trade,items}],instructions:''}));
  for(const instance of project.instances||[]){const c=instance.content;if(!c?.points?.length)continue;definitions.push({title:c.title,trade:c.trade,instructions:c.instructions||'',groups:[{category:c.title,items:c.points.map(p=>p.title),requirements:Object.fromEntries(c.points.map(p=>[p.title,{guidance:p.guidance||'',image_required:p.image_required===true,comment_required:p.comment_required===true}]))}]});}
  for(const d of definitions){const key=JSON.stringify(d);if(seen.has(key))continue;seen.add(key);const warranty=/sopro.*garanti|garantipunkt/i.test(d.title);rows.push(row(`project:${project.id}:${definitions.indexOf(d)}`,d.title,CHECKLIST_TRADES.includes(d.trade)?d.trade:'Annet fag',d.groups,warranty?'warranty':'project',d.instructions));}
 }
 return freeze(rows);
}
export function existingChecklistDraft(rows,id,makeId=()=>crypto.randomUUID()){
 const source=rows.find(row=>row.id===id);if(!source||source.locked||source.kind==='warranty'||/^warranty/.test(source.id))throw new Error('Garantipunkter er låst og kan ikke kopieres til en redigerbar sjekkliste.');
 const draft=blankChecklist(makeId),titles=new Set(),points=[];
 for(const group of source.groups)for(const title of group.items){if(titles.has(title))continue;titles.add(title);const r=group.requirements?.[title]||{};points.push({id:makeId(),title,guidance:r.guidance||'',image_required:r.image_required===true,comment_required:r.comment_required===true,subform_version_id:null});}
 draft.content=checklistContent({title:source.title,trade:source.trade,instructions:source.instructions||'Tilpasset fra eksisterende prosjektmal. Prosjektenes originale lister og svar beholdes.',points});return draft;
}
export async function loadExistingChecklists({client,companyId,userId,checkContext,isCurrent=()=>true}){
 const verify=async()=>{const c=await checkContext();if(!isCurrent())return false;if(c?.company_id!==companyId||c.user_id!==userId||!c.manage||!c.enabled)throw Object.assign(new Error('Tilgangen til sjekklistebiblioteket er endret.'),{code:'ACCESS_CHANGED'});return true;};
 if(!await verify())return null;
 const projects=[];for(let start=0;;start+=200){const {data,error}=await client.from('projects').select('id,company_scope_id,custom:data->project->customChecklistGroups,instances:data->project->kshmsChecklistInstances').eq('company_scope_id',companyId).order('id').range(start,start+199);if(error)throw error;if(!isCurrent())return null;for(const p of data||[]){if(p.company_scope_id!==companyId)throw new Error('Sjekklister fra feil firma ble avvist.');projects.push(p);}if((data||[]).length<200)break;}
 const checkpoints=[];for(let start=0;;start+=200){const {data,error}=await client.from('product_master_checkpoints').select('id,product_no,checkpoint_text,checkpoint_type,guarantee_system,image_required,comment_required,sort_order').order('id').range(start,start+199);if(error)throw error;if(!isCurrent())return null;checkpoints.push(...data||[]);if((data||[]).length<200)break;}
 if(!await verify())return null;return existingChecklistCatalog({projects,checkpoints});
}
