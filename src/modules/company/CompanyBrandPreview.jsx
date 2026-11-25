import React from 'react';

export default function CompanyBrandPreview({company={}}) {
  return <details className="ux-preview"><summary className="ux-readable-summary">Forhåndsvis firmaprofil i dokumenter og e-post</summary><div className="ux-grid">{['Dokumenthode','E-postavsender'].map(label=><article key={label}><h3>{label}</h3>{company.logoUrl&&<img src={company.logoUrl} alt="Firmalogo"/>}<p><strong>{company.companyName||'Firmanavn mangler'}</strong></p><p>{[company.address,company.postnr,company.city].filter(Boolean).join(' ')}</p><p>{[company.orgNumber,company.phone,company.email].filter(Boolean).join(' · ')}</p></article>)}</div><p>Viser opplysningene i skjemaet. Bruk «Lagre firmaprofil» for å lagre endringer. Ingen e-post sendes.</p></details>;
}
