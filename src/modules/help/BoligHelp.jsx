import React, { useRef, useState } from 'react';
import {ArrowLeft,ArrowRight,ChevronDown,Search} from 'lucide-react';
import BoligGuidePanel from './BoligGuidePanel.jsx';
import {BOLIG_HELP_GROUPS,BOLIG_HELP_TOPICS} from './boligHelpContent.jsx';

export function boligHelpText(node) {
  if(node==null||typeof node==='boolean')return '';
  if(typeof node==='string'||typeof node==='number')return String(node);
  if(Array.isArray(node))return node.map(boligHelpText).join(' ');
  return boligHelpText(node.props?.children);
}
const normalize=value=>value.toLocaleLowerCase('nb').normalize('NFKC');
const topics=BOLIG_HELP_TOPICS.map(topic=>({...topic,search:normalize(topic.title+' '+boligHelpText(topic.body))}));

export function BoligHelp() {
  const [open,setOpen]=useState(false),[group,setGroup]=useState(''),[query,setQuery]=useState(''),[expanded,setExpanded]=useState('');
  const search=useRef(null),heading=useRef(null),content=useRef(null);
  const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
  const visible=topics.filter(topic=>terms.length?terms.every(term=>topic.search.includes(term)):topic.group===group);
  const selected=BOLIG_HELP_GROUPS.find(value=>value.id===group);
  const close=()=>setOpen(false);
  const scrollTop=()=>{const body=content.current?.closest('.pd-workspace-drawer-body');if(body)body.scrollTop=0;};
  const selectGroup=id=>{setGroup(id);setQuery('');setExpanded('');requestAnimationFrame(()=>{scrollTop();heading.current?.focus({preventScroll:true});});};
  const showOverview=()=>{setGroup('');setQuery('');setExpanded('');requestAnimationFrame(()=>{scrollTop();search.current?.focus({preventScroll:true});});};
  return <>
    <button type="button" className="bolig-help bolig-guidance-trigger" aria-haspopup="dialog" aria-expanded={open}
      onClick={()=>{setGroup('');setQuery('');setExpanded('');setOpen(true);}}>Slik styrer du prosjektet <ArrowRight size={18} aria-hidden="true"/></button>
    <BoligGuidePanel open={open} title="Slik styrer du prosjektet" onClose={close}>
      <div ref={content} className="bolig-help-workspace">
        <p>Velg et tema eller søk etter det du vil gjøre. Åpne bare forklaringen du trenger.</p>
        <label className="bolig-help-search"><span><Search size={17} aria-hidden="true"/>Søk i boligveiledningen</span>
          <input ref={search} type="search" value={query} placeholder="For eksempel bestilling, beboer eller overtakelse"
            onChange={event=>{setQuery(event.target.value);setExpanded('');}}/></label>
        {!terms.length&&!group?<>
          <h3>Hva trenger du hjelp med?</h3>
          <div className="bolig-help-groups">{BOLIG_HELP_GROUPS.map(item=><button key={item.id} type="button" onClick={()=>selectGroup(item.id)}>
            <strong>{item.title}</strong><span>{item.description}</span><ArrowRight size={18} aria-hidden="true"/>
          </button>)}</div>
        </>:<>
          <button type="button" className="bolig-help-back" onClick={showOverview}><ArrowLeft size={17} aria-hidden="true"/>Alle temaer</button>
          <h3 tabIndex={-1} ref={heading}>{terms.length?'Søkeresultater':selected?.title}</h3>
          <p className="bolig-help-count" role="status">{visible.length?`${visible.length} forklaringer. Åpne én om gangen.`:'Ingen treff. Prøv et kortere søkeord.'}</p>
          <div className="bolig-help-topics">{visible.map(topic=><article key={topic.id}>
            <h4><button type="button" aria-expanded={expanded===topic.id} aria-controls={'bolig-help-'+topic.id}
              onClick={()=>setExpanded(previous=>previous===topic.id?'':topic.id)}>{topic.title}<ChevronDown size={18} aria-hidden="true"/></button></h4>
            {expanded===topic.id&&<div className="bolig-help-topic-body" id={'bolig-help-'+topic.id}>{topic.body}</div>}
          </article>)}</div>
        </>}
      </div>
    </BoligGuidePanel>
  </>;
}
