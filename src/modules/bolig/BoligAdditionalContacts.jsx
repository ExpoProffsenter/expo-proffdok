import React from 'react';
export default function BoligAdditionalContacts({contacts = [], onChange}) {
  const patch = (id, field, value) => onChange(contacts.map(c => c.id === id ? {...c, [field]: value} : c));
  return <section className="bolig-household-contacts" aria-label="Andre eiere">
    <h4>Andre eiere i boligen</h4>
    <p>Alle eierne deler samme beboerportal, valg og avtaler. Hovedkontakten ovenfor er fortsatt mottaker for eksisterende e-postfunksjoner. Flere eierkontakter oppretter ikke nye portaler eller bestillinger.</p>
    {contacts.map((c, i) => <fieldset key={c.id}>
      <legend>Eier {i + 2}</legend>
      <label>Navn<input required minLength={2} maxLength={120} value={c.name} onChange={e => patch(c.id, 'name', e.target.value)} /></label>
      <label>E-post<input type="email" maxLength={254} value={c.email} onChange={e => patch(c.id, 'email', e.target.value)} /></label>
      <label>Mobil<input type="tel" maxLength={40} value={c.phone} onChange={e => patch(c.id, 'phone', e.target.value)} /></label>
      <button type="button" onClick={() => onChange(contacts.filter(p => p.id !== c.id))}>Fjern eier {i + 2}</button>
    </fieldset>)}
    <button type="button" disabled={contacts.length >= 9} onClick={() => onChange([...contacts, {id: crypto.randomUUID(), name: '', email: '', phone: ''}])}>Legg til eier</button>
    <p>Ved endring av eierlisten stoppes den gamle felleslenken. Lag en ny portalinvitasjon og del samme lenke med eierne som fortsatt skal ha tilgang.</p>
  </section>;
}
