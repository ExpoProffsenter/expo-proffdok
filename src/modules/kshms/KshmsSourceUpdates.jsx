import {sourceUpdateOverview} from './kshmsSourceUpdates.mjs';
import './kshmsSources.css';

export default function KshmsSourceUpdates({data,companyId,userId,busy,onReview}) {
 const overview=sourceUpdateOverview(data,companyId,userId);
 if(!overview)return null;
 return <section className="ks-card ks-source-updates" aria-label="Kildeoppdateringer"><h3>Kildeoppdateringer</h3>
  <p>Her ser du om ProffDok har et nyere tekstforslag til firmaets rutiner. Sammenlign det med deres tekst. Velg endringer, lagre utkastet og få den nye utgaven godkjent.</p>
  <p className="ks-field-hint">Dette viser sentrale tekstforslag. Åpne nettkildene og kontroller gjeldende regler selv. Datoen på en kilde endres bare når den faktisk er kontrollert.</p>
  {overview.rows.length?<><p role="status">{overview.reviewCount} forslag må vurderes · {overview.publicationCount} vurderte utkast må godkjennes</p>
   <ul>{overview.rows.map(row=><li key={row.routine.id}><div><strong>{row.routine.draft.title}</strong><p>{row.status==='review'?`Nyere tekstforslag: utgave ${row.latestRevision}. ${row.draftRevision?`Utkastet bygger på utgave ${row.draftRevision}.`:'Utkastets forslagsutgave er ikke registrert.'}`:`Forslagets utgave ${row.latestRevision} er vurdert i lagret utkast. Ny godkjenning gjenstår.`}</p>{row.current&&<p className="ks-field-hint">Godkjent rutine v{row.current.number} gjelder fortsatt.</p>}</div>
    <button type="button" className="secondary" disabled={busy} onClick={()=>onReview(row.routine,row.status==='review')}>{row.status==='review'?'Sammenlign tekstforslag':'Åpne vurdert utkast'}</button>
   </li>)}</ul></>:<p>Ingen nyere sentrale tekstforslag å følge opp. Dette sier ikke om nettkildene eller firmaets rutiner er oppdaterte.</p>}
 </section>;
}
