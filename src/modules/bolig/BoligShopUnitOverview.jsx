import React from 'react';

const day=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value.split('-').reverse().join('.'):'Ikke registrert';
const deadline=value=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Oslo'}).format(new Date(value)):null;
export default function BoligShopUnitOverview({unit}){
 const due=deadline(unit.choice_deadline_at);
 const activities=Array.isArray(unit.activities)?unit.activities:[];
 return <section className="bolig-unit-overview" aria-label="Valgt bolig">
  <h3>Valgt bolig {unit.number}</h3>
  <dl>
   <div><dt>Registrert adresse</dt><dd>{unit.address||'Ikke registrert'}</dd></div>
   <div><dt>Hovedkontakt</dt><dd>{unit.contact_name||'Ikke registrert'}</dd></div>
   <div><dt>Telefon</dt><dd>{unit.contact_phone?<a href={`tel:${unit.contact_phone.replace(/[^+\d]/g,'')}`}>{unit.contact_phone}</a>:'Ikke registrert'}</dd></div>
   <div><dt>E-post</dt><dd>{unit.contact_email?<a href={`mailto:${encodeURIComponent(unit.contact_email)}`}>{unit.contact_email}</a>:'Ikke registrert'}</dd></div>
   <div><dt>Bestillingsfrist</dt><dd>{due?`${due} (norsk tid)`:'Ingen frist registrert'}{due&&Date.now()>=Date.parse(unit.choice_deadline_at)&&' · Utløpt'}</dd></div>
  </dl>
  <h4>Planlagte og pågående aktiviteter</h4>
  {activities.length?<><p>Første åpne aktivitet: {activities[0].title} · {day(activities[0].planned_start)}</p><details><summary>Se planen · {activities.length} aktiviteter</summary><ol>{activities.map(t=><li key={t.id}><strong>{t.title}</strong> · {day(t.planned_start)}–{day(t.planned_end)}{t.status==='working'?' · Pågår':t.status==='blocked'?' · Blokkert':''}</li>)}</ol></details></>:<p>Ingen åpne aktiviteter registrert.</p>}
 </section>;
}
