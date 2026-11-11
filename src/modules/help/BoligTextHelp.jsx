import React, {useState} from 'react';
import {BOLIG_WORKFLOW} from './boligWorkflow.mjs';
import {BOLIG_HELP_GROUPS, BOLIG_HELP_TOPICS} from './boligHelpContent.jsx';
import {boligHelpText} from './BoligHelp.jsx';
import {helpSearchText} from './helpSearch.mjs';

export const boligHelpSearchContent = [
  ...BOLIG_WORKFLOW.flatMap(step=>Object.values(step)),
  ...BOLIG_HELP_TOPICS.map(topic=>topic.title+' '+boligHelpText(topic.body)),
].join(' ');

export default function BoligTextHelp() {
  const [query,setQuery]=useState('');
  const words=helpSearchText(query).trim().split(/\s+/).filter(Boolean);
  const matches=text=>words.every(word=>helpSearchText(text).includes(word));
  const steps=BOLIG_WORKFLOW.map((step,index)=>({...step,index})).filter(step=>matches(Object.values(step).join(' ')));
  const topics=BOLIG_HELP_TOPICS.filter(topic=>matches(topic.title+' '+boligHelpText(topic.body)));
  return <section aria-label="Tekstveiledning for hele Boligprosjektet">
    <h3>Tekstveiledning – fra oppsett til overtakelse</h3>
    <p>Du trenger ikke se en video. Følg stegene nedenfor, eller søk etter oppgaven din. Å lese hjelpen endrer ingen prosjektdata.</p>
    <label className="bolig-help-search">Søk i tekstveiledningen<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="For eksempel grunnpakke, beboer, indeks eller FDV"/></label>
    <h4>Anbefalt prosjektflyt</h4>
    <p>Avklar tilgang og avtale først. Klargjør boligene før du deler valg, planlegger utførelsen og bestiller. Kontroller og økonomi følges opp underveis.</p>
    {steps.map(step=><details key={step.title} className="module-guide ux-reference">
      <summary>{step.index+1}. {step.title}</summary>
      <p><strong>Hvor:</strong> {step.where}</p><p>{step.text}</p>
      <p><strong>Kontroller:</strong> {step.recommend}</p>
      <p><strong>Underveis:</strong> {step.later}</p>
      <p><strong>Neste steg:</strong> {step.next}</p>
    </details>)}
    <h4>Detaljert hjelp for alle oppgaver</h4>
    {BOLIG_HELP_GROUPS.map(group=>{
      const items=topics.filter(topic=>topic.group===group.id);
      return items.length?<section key={group.id} aria-label={group.title}><h5>{group.title}</h5>{items.map(topic=><details key={topic.id} className="module-guide ux-reference"><summary>{topic.title}</summary>{topic.body}</details>)}</section>:null;
    })}
    {!steps.length&&!topics.length&&<p role="status">Ingen treff. Prøv et kortere søkeord.</p>}
  </section>;
}
