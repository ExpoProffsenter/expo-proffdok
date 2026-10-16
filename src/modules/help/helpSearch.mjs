export const helpSearchText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('nb-NO');
export function filterHelpSections(sections,query) {
  const words=helpSearchText(query).trim().split(/\s+/).filter(Boolean);
  if(!words.length)return sections;
  const matches=item=>{const text=helpSearchText(JSON.stringify(item));return words.every(word=>text.includes(word));};
  return sections.flatMap(item=>{
    if(!item.chapters)return matches(item)?[item]:[];
    const chapters=item.chapters.filter(chapter=>matches({...chapter,group:item.title}));
    return chapters.length?[{...item,chapters}]:[];
  });
}
