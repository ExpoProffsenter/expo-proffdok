import { CompanyCustomerProvider, CompanyCustomerSearch, CompanyCustomerSave } from '../customers/CompanyCustomerPicker.jsx';

// Presentation only: the existing customer provider owns search, company scope
// and explicit opt-in saving. Project fields continue to use the original state.
export default function ProjectInformationFields({ project, setProject, Input, Textarea, readOnly = false }) {
  const change = (key, value) => setProject(current => ({ ...current, [key]: value }));
  return <div className="project-information-fields">
    <div className="project-info-card" role="group" aria-label="Prosjektopplysninger">
      <h3>Prosjektopplysninger</h3>
      <div className="project-info-inputs">
        <Input label="Navn på prosjekt" value={project.projectName} disabled={readOnly} onChange={v => change('projectName', v)}/>
        <Input label="Prosjektansvarlig" value={project.responsible} disabled={readOnly} onChange={v => change('responsible', v)}/>
        <Input label="Dato" type="date" value={project.date} disabled={readOnly} onChange={v => change('date', v)}/>
        <Input label="Adresse" value={project.address} disabled={readOnly} onChange={v => change('address', v)}/>
        <Input label="Postnr." value={project.postnr || ''} disabled={readOnly} onChange={v => change('postnr', v)}/>
        <Input label="Poststed / by" value={project.city || ''} disabled={readOnly} onChange={v => change('city', v)}/>
      </div>
    </div>
    <div className="project-info-card project-customer-card" role="group" aria-label="Kunde">
      <h3>Kunde</h3>
      <CompanyCustomerProvider disabled={readOnly} value={{ customer: project.customer || '', phone: project.customerPhone || '', email: project.customerEmail || '', address: project.address || '', postnr: project.postnr || '', city: project.city || '' }} onUse={customer => setProject(current => ({ ...current, customer: customer.customer || '', customerPhone: customer.phone || '', customerEmail: customer.email || '', address: customer.address || '', postnr: customer.postnr || '', city: customer.city || '' }))}>
        <div className="project-info-inputs project-customer-inputs">
          <Input label="Kunde" value={project.customer} disabled={readOnly} onChange={v => change('customer', v)}/>
          <Input label="Kunde e-post" type="email" value={project.customerEmail || ''} disabled={readOnly} onChange={v => change('customerEmail', v)}/>
          <Input label="Kunde telefon" type="tel" value={project.customerPhone || ''} disabled={readOnly} onChange={v => change('customerPhone', v)}/>
        </div>
        {!readOnly && <details className="project-customer-register"><summary>Kunderegister – hent eller lagre kunde</summary><CompanyCustomerSearch/><CompanyCustomerSave/></details>}
      </CompanyCustomerProvider>
    </div>
    <div className="project-info-notes"><Textarea label="Notater" value={project.notes} disabled={readOnly} onChange={v => change('notes', v)}/></div>
  </div>;
}
