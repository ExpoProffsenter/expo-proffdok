// Keep the complete guides; only their presentation is grouped.
export function groupHelpTopics(sections) {
 const families=[['kshms','KS/HMS','Rutiner, daglig HMS-arbeid, oppfølging og dokumentasjon.'],['hr','HR','Medarbeidere, nærmeste leder og personlig tilgang.']];
 const belongs=(item,key)=>item.key===key||item.key.startsWith(key+'-');
 const groups=families.map(([key,title,purpose])=>({key,title,purpose,chapters:sections.filter(item=>belongs(item,key)).map(item=>({...item,title:item.title.replace(/^(?:KS\/HMS|HR)\s*[–—-]\s*/,'')}))})).filter(group=>group.chapters.length);
 let inserted=false;
 return sections.flatMap(item=>{
  if(!families.some(([key])=>belongs(item,key)))return [item];
  if(inserted)return [];
  inserted=true;return groups;
 });
}
