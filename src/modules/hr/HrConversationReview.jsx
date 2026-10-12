import React from 'react';
import {hrEmployeeLabel} from './hrEmployeeLabel.mjs';

// The authorized editor owns this data; no fetching, storage or mutations here.
export default function HrConversationReview({conversation,employee,leaderEmail,draft,dirty}){
 const date=on=>on?on.split('-').reverse().join('.'):'Ikke avtalt';
 return <section className="hrp-review" aria-label="Samlet referat">
  <h5>Samlet referat</h5>
  <p>{dirty?'Forhåndsvisning med ulagrede endringer. Lagre samtalen før gjennomgang og bekreftelse.':'Dette er den lagrede utgaven av referatet.'}</p>
  <h5>Medarbeiderens delte forberedelse</h5>
  {conversation.shared?conversation.template.questions.filter(q=>q.phase==='preparation').map(q=><article key={q.id}><strong>{q.topic}</strong><p>{q.prompt}</p><blockquote>{conversation.preparation[q.id]||'Ikke utfylt'}</blockquote></article>):<p>Forberedelsen er ikke delt ennå.</p>}
  <h5>Felles møtereferat</h5>
  {conversation.template.questions.filter(q=>q.phase==='meeting').map(q=><article key={q.id}><strong>{q.topic}</strong><p>{q.prompt}</p><blockquote>{draft.meeting[q.id]||'Ikke skrevet ennå'}</blockquote></article>)}
  <h5>Avtalte tiltak</h5>
  {draft.actions.length?<ol>{draft.actions.map(a=><li key={a.id}><strong>{a.task||'Tiltaket er ikke beskrevet ennå'}</strong><p>Ansvarlig: {a.owner_id===employee.user_id?hrEmployeeLabel(employee):leaderEmail||'Leder'} · Frist: {date(a.due_on)} · {a.done?'Utført':'Åpent'}</p></li>)}</ol>:<p>Ingen tiltak er avtalt.</p>}
  <p>Neste oppfølging: {date(draft.next_on)}</p>
 </section>;
}
