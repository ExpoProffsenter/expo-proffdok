import React,{useMemo} from 'react';
import {staffingNumber as number,staffingPlan} from './kshmsProgressStaffing.mjs';
import {shortDate} from './kshmsProgressTimeline.mjs';
export default function KshmsProgressStaffing({plan,range,dirty,onEdit}){
 const report=useMemo(()=>staffingPlan(plan),[plan]);
 const days=report.days.filter(d=>range.dates.includes(d.date)),peak=Math.max(0,...days.map(d=>d.peak)),hours=days.reduce((n,d)=>n+d.personHours,0),known=days.some(d=>d.known);
 return <section className="ks-staffing" aria-label="Bemanningsoversikt">
  <p className="ks-plan-hint">Antall personer på hver oppgave gir planlagt bemanningsbehov. Samtidige oppgaver summeres. Persontimer er antall personer × planlagte timer. {dirty?'Viser ulagret kladd. Lagre før eksport.':'Eksporten omfatter hele den lagrede planen.'}</p>
  <div className="ks-staffing-cards"><div><small>Høyeste samtidig behov i perioden</small><strong>{known?peak:'Ikke oppgitt'}</strong><span>personer</span></div><div><small>Persontimer i perioden</small><strong>{known?number(hours):'Ikke oppgitt'}</strong><span>planlagte timer × personer</span></div><div><small>Hele planen</small><strong>{report.missingCount}</strong><span>oppgaver uten personantall</span></div></div>
  {!report.complete&&<p role="status" className="ks-staffing-incomplete">Ufullstendig grunnlag: {report.missingCount} oppgaver mangler personantall og {report.unplannedCount} mangler tider. Behovet kan være høyere enn tallene viser.</p>}
  <div className="ks-staffing-table"><table><caption>Bemanning i valgt periode</caption><thead><tr><th scope="col">Dato</th><th scope="col">Samtidig behov</th><th scope="col">Persontimer</th><th scope="col">Grunnlag</th></tr></thead><tbody>{days.map(d=><tr key={d.date}><th scope="row">{shortDate(d.date)}</th><td>{d.known?`${d.peak} personer`:'Ikke oppgitt'}</td><td>{d.known?number(d.personHours):'Ikke oppgitt'}</td><td>{d.missing?`${d.missing} oppgaver uten antall`:'Komplett'}</td></tr>)}</tbody></table>{!days.length&&<p>Ingen planlagte tider i denne perioden. Velg Til planen eller en annen dato.</p>}</div>
  {report.missingCount>0&&<details><summary>Fyll inn manglende personantall</summary><div className="ks-staffing-missing">{plan.activities.filter(a=>!Number.isInteger(a.crewSize)||a.crewSize<1||a.crewSize>999).map(a=><button type="button" className="secondary" key={a.id} onClick={()=>onEdit(a.id)}>{a.title}</button>)}</div></details>}
 </section>;
}
