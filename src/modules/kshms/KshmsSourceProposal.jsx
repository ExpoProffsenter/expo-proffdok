import {sourceDifferences} from './kshmsSourceUpdates.mjs';
import './kshmsSources.css';
const sourceTypes={law:'Lov eller forskrift',professional:'Fag, veiledning eller kontrakt',company:'Firmaets egne regler',product:'ProffDoks valg'};

function Value({value,references}) {
 if(!references)return <p className="ks-text">{value||'Ikke fylt inn'}</p>;
 return <ul>{value.map((ref,index)=><li key={index}><a href={/^https:\/\//.test(ref.url||'')?ref.url:undefined} target="_blank" rel="noreferrer">{ref.title||ref.url}</a><span> · {sourceTypes[ref.kind]||'Kildetype ikke registrert'} · kontrollert {ref.checked_on||'ikke registrert'}</span></li>)}</ul>;
}
export default function KshmsSourceProposal({draft,proposal,busy,onApply,onReviewed,onClose}) {
 const fields=sourceDifferences(draft,proposal);
 if(!fields.length)return null;
 const changed=fields.filter(field=>field.different).length;
 return <aside className="ks-proposal ks-source-proposal" aria-label="Sammenlign ProffDoks tekstforslag"><h4>Sammenlign med tekstforslagets utgave {proposal.source_revision}</h4>
  <p>{changed} felt er ulike firmaets utkast. Ulik tekst kan være firmaets egne tilpasninger. Bruk bare feltene dere trenger; resten av firmaets tekst beholdes.</p>
  {fields.map(field=><details key={field.key}><summary>{field.label[0].toUpperCase()+field.label.slice(1)} · {field.different?'ulikt':'likt'}</summary><div className="ks-source-values"><section><h5>Firmaets utkast</h5><Value value={field.current} references={field.key==='references'}/></section><section><h5>ProffDoks forslag</h5><Value value={field.proposed} references={field.key==='references'}/></section></div>
   <button type="button" className="secondary" disabled={busy||!field.different} onClick={()=>onApply(field.key)}>Bruk forslagets {field.label}</button>
  </details>)}
  <p>Et enkelt felt markerer ikke hele forslaget som vurdert. Når du har gått gjennom hele forslaget, kan du beholde firmaets tilpasninger og markere utgaven som vurdert. Dette kontrollerer ikke nettkildene og godkjenner ikke rutinen.</p>
  <div className="ks-actions"><button type="button" disabled={busy||draft.source_revision>=proposal.source_revision} onClick={onReviewed}>Jeg har vurdert hele tekstforslaget</button><button type="button" className="secondary" disabled={busy} onClick={onClose}>Lukk sammenligning</button></div>
  {draft.source_revision===proposal.source_revision&&<p role="status">Tekstforslagets utgave {proposal.source_revision} er markert som vurdert i utkastet. Lagre utkastet. Endringer må godkjennes før ansatte får dem.</p>}
  {draft.source_revision>proposal.source_revision&&<p role="status">Utkastet viser en nyere forslagsutgave enn denne appversjonen. Behold utkastet og kontroller at appen er oppdatert.</p>}
 </aside>;
}
