import guides from './videoGuides.json' with {type:'json'};
import {helpSearchText} from './helpSearch.mjs';

const searchable=value=>helpSearchText(value).replaceAll('ø','o').replaceAll('æ','ae');
export const VIDEO_GUIDES=guides;
export const videoTime=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
export function availableVideoGuides({authenticated=false,topics=[],canUseBolig=false,canManageKshms=false,canUseStocktake=false,backendTarget}={}){
 if(!authenticated)return [];
 const keys=new Set(topics);
 return guides.filter(video=>({help:keys.has('hjelp'),hr:keys.has('hr')&&backendTarget==='sandbox','hr-workflow':keys.has('hr'),'kshms-manage':keys.has('kshms')&&canManageKshms===true,stocktake:keys.has('prissok')&&canUseStocktake===true,sales:keys.has('sales'),report:keys.has('rapport'),plans:keys.has('project-progress')||keys.has('kshms'),bolig:canUseBolig})[video.access]).sort((a,b)=>{const order={'bolig-a-til-aa':0,'finn-bolig':1,'bolig-masseplan':2};return (order[a.id]??99)-(order[b.id]??99);});
}
export function searchVideoGuides(videos,query=''){
 const words=searchable(query).trim().split(/\s+/).filter(Boolean);
 return videos.filter(video=>{const text=searchable([video.title,video.module,video.description,...video.chapters.flatMap(chapter=>[chapter.title,chapter.text])].join(' '));return words.every(word=>text.includes(word));});
}
