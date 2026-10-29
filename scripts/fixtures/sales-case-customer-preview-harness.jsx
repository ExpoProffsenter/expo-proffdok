import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Detail from "../../src/modules/sales/components/SalesDetailView.jsx";
import Workspace from "../../src/modules/sales/components/SalesCaseWorkspace.jsx";
import Tools from "../../src/modules/ui/WorkspaceTools.jsx";
import Offer from "../../src/modules/sales/components/SalesOfferBuilderCore.jsx";
import Inspection from "../../src/modules/sales/components/SalesInspectionNote.jsx";
import Plan from "../../src/modules/sales/components/SalesSurveyPlan.jsx";
import RequestForm from "../../src/modules/sales/components/SalesRequestForm.jsx";
import Activation from "../../src/modules/sales/components/SalesProjectActivation.jsx";
import GeneralOffer from "../../src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx";
import "../../src/style.css";
import "../../src/modules/app/mobileResponsive41A.css";
import "../../src/modules/sales/sales.css";
import "../../src/modules/ui/proffdokWorkspace.css";

const line = { id: "base", description: "Lagret grunnarbeid", amount: "1000", quantity: "2", unit: "stk", mainPostId: "rorlegger", mainPostTitle: "Rørlegger" };
const option = { id: "extra", title: "Lagret tillegg", amount: "200", quantity: "3", unit: "stk", customerCanChooseQuantity: true, mainPostId: "rorlegger", mainPostTitle: "Rørlegger" };
const logo = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="176" height="44"><rect width="176" height="44" fill="#075965"/><text x="12" y="29" fill="white" font-size="20">QA FIRMA</text></svg>');
const published = { id: "v1", versionNumber: 1, createdAt: "2026-10-28T10:00:00Z", title: "Låst kundetilbud", intro: "Lagret innledning", total: 2000,
  lines: [{ __companyMeta: true, companyName: "Historisk QA firma", logoUrl: logo }, { __offerTermsMeta: true, terms: "Låste avtalevilkår" }, { ...line, description: "Låst grunnarbeid" }], options: [option] };
const base = { id: "QA-CASE", title: "Rehabilitering av bad med lang prosjektbetegnelse", customer: "QA Eiendom og prosjektutvikling AS", address: "Eksempelveien 123", phone: "", email: "qa@example.invalid", status: "Tilbud", statusClass: "sales-status-quote", nextStep: "Send tilbud til kunde", offerTitle: "Lagret kladd", offerIntro: "Lagret innledning", offerLines: [line], offerOptions: [option], offerTotal: 2000, inspectionPhotos: [], offerVersions: [] };
const accepted = { ...base, status: "Akseptert", acceptedOfferVersionId: "v1", acceptedOfferVersionNumber: 1, acceptedOfferLines: published.lines,
  acceptedOptions: [option], acceptedOptionIds: ["extra"], acceptedTotal: 2600, acceptedBy: "QA Kunde", acceptedAt: "2026-10-28T12:00:00Z",
  sentOfferVersionId: "v2", offerVersions: [published, { ...published, id: "v2", title: "Nyere versjon som ikke er akseptert" }] };
const cases = [
  { ...base, status: "Forespørsel", offerLines: [], offerOptions: [], offerTotal: 0, nextStep: "Planlegg befaring" },
  { ...base, status: "Befaring", nextStep: "Opprett tilbud" }, base,
  { ...base, sentOfferVersionId: "v1", sentOfferVersionNumber: 1, publicToken: "synthetic", offerVersions: [published] },
  accepted, { ...accepted, status: "Aktivert", projectId: "synthetic-project", projectActivatedAt: "2026-10-28T13:00:00Z", projectName: "QA prosjekt", nextStep: "Åpne prosjekt" },
  { ...base, directOffer: true, source: "Butikktilbud / varesalg", offerLines: [{ __storeOfferMeta: true, brandLabel: "QA merke", signatureName: "QA ansvarlig" }, line] },
  { ...base, status: "Aktivert", acceptedOfferLines: [line], acceptedOptions: [], acceptedTotal: 2000, acceptedOfferTitle: "Eldre låst tilbud" },
  { ...base, status: "Aktivert", sentOfferVersionId: "later", offerVersions: [{ ...published, id: "later", title: "Kun publisert, ikke bekreftet akseptert" }] },
];
const profile = { companyName: "Dagens QA firma", email: "firma@example.invalid", logoUrl: logo };
window.qa = { calls: [], source: JSON.stringify(cases), cases };
const callback = (name) => (...args) => { args[0]?.preventDefault?.(); window.qa.calls.push(name); };

function App() {
  const [index, setIndex] = useState(0), [mode, setMode] = useState("detail");
  const [offer, setOffer] = useState({ title: "Arbeidskladd", intro: "Ulagret tekst i editoren", lines: [{ ...line, description: "Ulagret redigering" }], options: [option], reservations: "", included: "", excluded: "", customerSupplied: "", terms: "", paymentTerms: "", validityDays: "30" });
  const [inspection, setInspection] = useState({ customerWishes: "Ulagret befaringsønske", existingConditions: "", measurements: "", observations: "", photos: [] });
  const [plan, setPlan] = useState({ date: "2026-11-02", time: "10:00", responsible: "QA", note: "Ulagret plan", sendConfirmation: false });
  const [customer, setCustomer] = useState({ title: base.title, customer: base.customer, address: base.address, zip: "5000", city: "Bergen", email: base.email, phone: "", source: "Telefon", note: "Ulagret kundenotat" });
  const [project, setProject] = useState({ name: "QA prosjekt", number: "QA-100", responsible: "QA", note: "Ulagret aktiveringsnotat" });
  const [general, setGeneral] = useState({ title: "Generelt tilbud", intro: "Ulagret generell innledning", terms: "Vilkår", paymentTerms: "10 dager", validityDays: "30", lines: [{ ...line, lineType: "store_product", mainPostId: "butikk-varer", storeUnitPriceInclVat: "1250" }], options: [] });
  const request = cases[index];
  window.qa.rendered = { index, mode };
  window.qa.show = (caseIndex, nextMode = "detail") => { setIndex(caseIndex); setMode(nextMode); };
  const tools = <Tools tab="sales" rowClassName="sales-case-tools" rowLabel={`Sak ${request.id}`} contextTitle={request.title}
    actionGroups={[{ id: "case", title: "Arbeid med saken", description: "Fiktive callbacks i isolert prøve.", actions: [{ label: "Native handling", onClick: callback("tool") }] }]} />;
  const detail = <Detail selectedRequest={request} companyProfile={profile} workspaceTools={tools} summary={{}} goToList={callback("back")} loggedInResponsible="QA"
    openEditRequest={callback("customer")} openSurveyPlanning={callback("survey")} openInspectionNote={callback("inspection")} openOfferBuilder={callback("offer")} openProjectActivation={callback("activate")}
    openCustomerOfferFromRequestId={callback("customerOffer")} copyCustomerOfferLink={callback("copy")} sendOfferEmail={callback("send")} handleDownloadPublishedOfferPdf={callback("pdf")} handleCreateOfferRevisionAfterAcceptance={callback("revision")} />;
  let editor;
  if (mode === "offer") editor = <Offer selectedRequest={request} offerForm={offer} offerDraftSaveStatus="saved" offerTemplates={[]} onBack={callback("back")} handleSaveOffer={callback("save")}
    updateOfferForm={(key, value) => setOffer((current) => ({ ...current, [key]: value }))} updateOfferLine={callback("line")} updateOfferOption={callback("option")} />;
  if (mode === "inspection") editor = <Inspection selectedRequest={request} inspectionForm={inspection} loggedInResponsible="QA" onBack={callback("back")} onSubmit={callback("save")}
    onUpdateInspectionForm={(key, value) => setInspection((current) => ({ ...current, [key]: value }))} />;
  if (mode === "plan") editor = <Plan selectedRequest={request} surveyForm={plan} loggedInResponsible="QA" onBack={callback("back")} onSubmit={callback("save")}
    onUpdateSurveyForm={(key, value) => setPlan((current) => ({ ...current, [key]: value }))} />;
  if (mode === "customer") editor = <RequestForm form={customer} isEditingRequest onBack={callback("back")} onCancel={callback("back")} onSubmit={callback("save")}
    onUpdateForm={(key, value) => setCustomer((current) => ({ ...current, [key]: value }))} />;
  if (mode === "activation") editor = <Activation selectedRequest={request} projectForm={project} onBack={callback("back")} onSubmit={callback("save")}
    onUpdateProjectForm={(key, value) => setProject((current) => ({ ...current, [key]: value }))} />;
  if (mode === "general") editor = <GeneralOffer selectedRequest={request} offerForm={general} offerDraftSaveStatus="saved" onBack={callback("back")} handleSaveOffer={callback("save")}
    updateOfferForm={(key, value) => setGeneral((current) => ({ ...current, [key]: value }))} />;
  return <div data-expo-app-shell="true"><main>{mode === "detail" ? detail : <Workspace request={request} companyProfile={profile} tools={tools}>{editor}</Workspace>}</main></div>;
}
createRoot(document.getElementById("app")).render(<App />);
