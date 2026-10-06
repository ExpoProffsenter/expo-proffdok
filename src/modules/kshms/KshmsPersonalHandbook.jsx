import KshmsRoutineSearch from './KshmsRoutineSearch.jsx';
import KshmsVersionIdentity from './KshmsVersionIdentity.jsx';
import { personalHandbook } from './kshmsPersonal.mjs';

export default function KshmsPersonalHandbook({data,userId,query,onQueryChange,onRead,busy,ContentComponent}) {
 const {all,visible}=personalHandbook(data,userId,query);
 return <div className="ks-card" role="region" aria-label="Min personalhåndbok">
  <h3>Min personalhåndbok</h3>
  <p>Her finner du firmaets rutiner som er tildelt deg. Søk når du lurer på hvordan noe skal gjøres. Åpne en rutine for å lese teksten og se hvem som godkjente den, og om du selv har bekreftet denne utgaven. Dette gjelder også firmaadmin.</p>
  <p>Under «Les og bekreft» gjennomgår du utgavene du har igjen. Bekreftede rutiner ligger fortsatt her, så du kan slå dem opp senere.</p>
  <KshmsRoutineSearch label="Søk i min personalhåndbok" query={query} onChange={onQueryChange} count={visible.length} total={all.length}/>
  {!all.length&&<p>Du har ikke fått noen rutiner ennå. Be firmaadmin eller KS/HMS-ansvarlig kontrollere tilgangen og tildelingene dine.</p>}
  {all.length>0&&!visible.length&&<p>Ingen rutiner passer søket. Prøv et annet ord eller tøm søket.</p>}
  {visible.map(group=>{const current=group.editions[0],version=current.version;return <details className="ks-personal-routine" key={group.routineId}>
   <summary><span>{version.content.title} · v{version.number}</span><span className={`ks-badge ${current.acknowledgment?'ks-status-approved':'ks-status-draft'}`}>{group.archived?'Utgått':current.acknowledgment?'Bekreftet':version.requires_ack||version.number===1?'Må bekreftes':'Til informasjon'}</span></summary>
   <p className="ks-field-hint">Kapittel: {version.content.chapter}</p>
   {group.archived&&<p>Rutinen er tatt ut av bruk. Den er beholdt som historikk. Spør ansvarlig hvilken rutine som gjelder nå.</p>}
   <KshmsVersionIdentity version={version} acknowledgment={current.acknowledgment} data={data} userId={userId}/>
   <ContentComponent content={version.content}/>
   {!current.acknowledgment&&(version.requires_ack||version.number===1)&&<button type="button" className="secondary" disabled={busy} onClick={()=>onRead(version)}>Les og bekreft denne utgaven</button>}
   {group.editions.length>1&&<details><summary>Tidligere tildelte utgaver ({group.editions.length-1})</summary>{group.editions.slice(1).map(row=><details key={row.version.id}><summary>Versjon {row.version.number} · {row.version.change_summary}</summary><KshmsVersionIdentity version={row.version} acknowledgment={row.acknowledgment} data={data} userId={userId}/><ContentComponent content={row.version.content}/></details>)}</details>}
  </details>})}
 </div>;
}
