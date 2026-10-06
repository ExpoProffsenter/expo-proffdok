import { useId,useState } from 'react';
import { matchesRoutineSearch } from './kshmsSearch.mjs';

export default function KshmsAcknowledgments({overview}) {
 const [query,setQuery]=useState(''),searchId=useId();
 const visible=overview.groups.filter(group=>matchesRoutineSearch({title:group.label},query));
 return <section className="ks-acknowledgments" aria-label="Ansattes gjennomgang">
  <h4>Ansattes gjennomgang</h4>
  <p className="ks-notice" role="status">{overview.pendingMembers?`${overview.pendingMembers} ${overview.pendingMembers===1?'medarbeider har':'medarbeidere har'} rutiner igjen. ${overview.missing} ${overview.missing===1?'bekreftelse gjenstår':'bekreftelser gjenstår'}.`:overview.groups.length?'Alle påkrevde bekreftelser på tildelte utgaver er registrert. Sjekk også at alle som trenger rutinene har tilgang og har fått dem.':'Ingen rutiner som krever bekreftelse, er tildelt ennå. Godkjenn rutiner og sjekk ansattes tilgang først.'}</p>
  {overview.groups.length>0&&<>
   <p>Én rad viser én medarbeider. Åpne raden for å se hvilke rutineutgaver personen har bekreftet, og hvilke som gjenstår. Bekreftelser gjelder bestemte utgaver av rutinene.</p>
   <div className="ks-search"><label className="ks-field" htmlFor={searchId}><span>Søk etter medarbeider</span><input id={searchId} type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label><div className="ks-search-result"><p>{visible.length} av {overview.groups.length} medarbeidere</p>{query&&<button type="button" className="secondary" onClick={()=>setQuery('')}>Tøm søk</button>}</div></div>
   {!visible.length&&<p>Ingen medarbeidere passer søket. Prøv et annet navn eller tøm søket.</p>}
   {visible.map(group=><details className="ks-ack-person" key={group.userId}>
    <summary><span className="ks-ack-summary"><span className="ks-ack-name">{group.label}</span><span className="ks-ack-progress"><strong>{group.confirmed} av {group.entries.length} bekreftet</strong><span className={`ks-badge ${group.missing?'ks-status-draft':'ks-status-approved'}`}>{group.missing?`${group.missing} gjenstår`:'Ferdig'}</span></span></span></summary>
    <ul className="ks-ack-versions">{group.entries.map(({version,acknowledgment})=><li key={version.id}><span>{version.content.title} · v{version.number}</span><span>{acknowledgment?<>{'Bekreftet'}{acknowledgment.acknowledged_at&&<> · <time dateTime={acknowledgment.acknowledged_at}>{new Date(acknowledgment.acknowledged_at).toLocaleString('nb-NO')}</time></>}</>:'Mangler bekreftelse'}</span></li>)}</ul>
   </details>)}
  </>}
 </section>;
}
