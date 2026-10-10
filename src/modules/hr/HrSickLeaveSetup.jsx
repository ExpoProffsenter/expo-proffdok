import React,{useState} from 'react';
import {HeartPulse,ArrowRight,ExternalLink} from 'lucide-react';
import {HR_SICK_LEAVE_SOURCES,sickLeaveMilestones,formatSickLeaveDate} from './hrSickLeave.mjs';
import './hrSickLeave.css';

export default function HrSickLeaveSetup({targetRef,administer,enabled,onTemplates,onRegister}){
 const [start,setStart]=useState('2026-10-10'),[mode,setMode]=useState('full');
 let rows=[],error='';try{rows=sickLeaveMilestones(start,mode);}catch(e){error=e.message;}
 return <details ref={targetRef} tabIndex={-1} className="hr-card hr-sick-leave">
  <summary><HeartPulse size={18} aria-hidden="true"/>Sykefravær <small>Rutiner, tilrettelegging og frister</small></summary>
  <p>Start med hvem som følger opp, hvilke oppgaver dere kan tilby og hvordan dere holder kontakt. Under finner du hjelp til hvert trinn.</p>
  <section className="hr-sick-next" aria-label="Neste steg i sykefraværsoppsettet"><strong>{administer?'Neste steg: klargjør firmaets mal':'Neste steg: kontroller nærmeste leder'}</strong>
   <p>{administer?'Åpne sykefraværsmalen, tilpass spørsmålene til firmaets arbeid og trykk Lagre mal. Bruk spørsmålene som grunnlag for senere oppfølging.':'Åpne medarbeiderregisteret. Firmaadmin retter leder hvis noe er feil. Se deretter gjennom oppfølgingstrinnene nedenfor.'}</p>
   {administer?<><button type="button" disabled={!enabled} onClick={onTemplates}>Tilpass sykefraværsmal <ArrowRight size={16} aria-hidden="true"/></button>{!enabled&&<p className="hr-hint">Aktiver medarbeiderregisteret under Oppsett og kontrollfrist for å lage maler.</p>}</>:<button type="button" onClick={onRegister}>Se medarbeidere <ArrowRight size={16} aria-hidden="true"/></button>}
  </section>
  <div className="hr-sick-preparation">
   <section><h4>1. Riktig leder</h4><p>Nærmeste leder skal følge opp medarbeideren. Kontroller tilordningen i registeret før en personlig sak skal startes.</p><button type="button" className="secondary" onClick={onRegister}>Kontroller medarbeider og leder</button></section>
   <section><h4>2. Mulige arbeidsoppgaver</h4><p>Finn oppgaver firmaet kan tilby: planlegging, dokumentasjon, opplæring eller lettere oppgaver. Vurder hjelpemidler, samarbeid og endret arbeidstid. Forslag må vurderes for den enkelte.</p></section>
   <section><h4>3. Kontakt og oppfølging</h4><p>Avtal kontaktform og neste samtale sammen. En oppfølgingsplan beskriver arbeid som kan utføres, tiltak og hva dere gjør videre. Hvert tiltak trenger ansvar, frist og ny gjennomgang.</p></section>
  </div>
  <section aria-label="Frister i sykefraværsoppfølging"><h3>Se hvordan fristene henger sammen</h3>
   <p>Prøv med en oppdiktet startdato. Dette er et regneeksempel. Datoene lagres ikke og gir ingen påminnelser.</p>
   <div className="hr-fields"><label className="hr-field"><span>Eksempel på startdato</span><input type="date" min="1000-01-01" max="9999-06-01" value={start} onChange={e=>setStart(e.target.value)}/></label><label className="hr-field"><span>Fraværstype i eksemplet</span><select value={mode} onChange={e=>setMode(e.target.value)}><option value="full">Fullt fravær</option><option value="partial">Gradert fravær (delvis i arbeid)</option></select></label></div>
   {error?<p className="hr-error" role="alert">{error}</p>:<ol className="hr-sick-timeline">{rows.map(row=><li key={row.id}><div><span className="hr-sick-week">{row.weeks} uker</span><time dateTime={row.date}>{formatSickLeaveDate(row.date)}</time></div><section><h4>{row.title}</h4><small>Ansvar: {row.owner}</small><p>{row.instruction}</p></section></li>)}</ol>}
   <p className="hr-hint">Eksemplet gjelder ett sammenhengende fraværsforløp. Ny sykmeldingsperiode eller endret grad starter ikke fristene på nytt. Avbrudd og endret startdato krever egen vurdering. Unntak blir ikke avgjort av regneeksemplet.</p>
  </section>
  <div className="hr-sick-followthrough"><section><h4>Lengre fravær og retur</h4><p>Fortsett kontakten og vurder tiltak underveis. Bruk NAVs faktiske maksdato når den er kjent. Ett år i kalenderen er ikke et vedtak om sykepenger eller oppsigelse. Avtal opptrapping og oppfølging ved retur til arbeid.</p></section>
   <section><h4>Deling må skje faktisk</h4><p>Oppfølgingsplanen skal deles med sykmelder og NAV etter gjeldende krav. En lagret mal er ikke en innsendt plan. Bruk NAVs veiledning nedenfor om hvordan planen deles.</p></section></div>
  <aside className="hr-sick-boundary"><strong>Personlige saker åpnes senere</strong><p>Du kan lagre firmaets spørsmål nå. Du kan foreløpig ikke starte en sak, lagre ansattes fravær eller svar, bekrefte en felles plan eller sende noe til NAV her.</p></aside>
  <div className="hr-sick-sources"><strong>Kilder – kontrollert 10. oktober 2026</strong>{HR_SICK_LEAVE_SOURCES.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <ExternalLink size={14} aria-hidden="true"/></a>)}</div>
 </details>;
}
