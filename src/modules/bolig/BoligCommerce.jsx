import React, { useEffect, useRef, useState } from "react";
import { FileSignature, Plus, Link2, CheckCircle2, History } from "lucide-react";
import { commerceRpc, commerceLabels, COMMERCE_EVENT, newResidentToken, residentUrl } from "./boligCommerceClient.js";
import { boligDraftKey, readBoligDraft, writeBoligDraft } from "./boligClient.js";
import { signedCents } from "./boligCustomizationClient.js";
import { money } from "./boligCatalogClient.js";
import ContentEditor from "./BoligPackageContentEditor.jsx";
import Dialog from "./BoligEditorDialog.jsx";
import Summary from "./BoligAgreementSummary.jsx";
import { agreementOverview, supplierDelta } from "./boligCommerceCore.js";
import { downloadAmendment } from "./boligAmendmentExport.js";
import "./boligCommerce.css";

const stamp = value => value ? new Date(value).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" }) : "";
export default function BoligCommerce({ context, root, unit }) {
  const key = boligDraftKey(context, root.id, `commerce-${unit.id}`);
  const [local, setLocal] = useState(() => readBoligDraft(key, { form: null, links: {}, pending: null }));
  const [data, setData] = useState(null), [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null), [handling, setHandling] = useState(null);
  const [editing, setEditing] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);
  const alive = useRef(true), epoch = useRef(0), operation = useRef(false), latest = useRef(local), hasData = useRef(false);
  latest.current = local;
  const persist = next => {
    if (!writeBoligDraft(key, next)) throw Error("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    latest.current = next; setLocal(next);
  };
  const load = async () => {
    if (operation.current) return;
    const ticket = ++epoch.current;
    if (!hasData.current) setLoading(true);
    try {
      const next = await commerceRpc(context, root.id, unit.id);
      if (alive.current && ticket === epoch.current) { hasData.current = true; setData(next); setError(""); }
    } catch (e) {
      if (alive.current && ticket === epoch.current) {
        setError(e.message); if (e.code === "42501") { hasData.current = false; setData(null); }
      }
    } finally { if (alive.current && ticket === epoch.current) setLoading(false); }
  };
  useEffect(() => {
    alive.current = true; hasData.current = false; setData(null); setLoading(true);
    setSelected(null); setHandling(null); setEditing(false);
    const scoped = readBoligDraft(key, {form:null,links:{},pending:null}); latest.current = scoped; setLocal(scoped);
    load();
    const refresh = () => { if (document.visibilityState !== "hidden") load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { alive.current = false; ++epoch.current; window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [context.user_id, context.company_id, root.id, unit.id]);
  const writable = context.role === "manager" && context.enabled && data?.context?.role === "manager" && !root.archived;
  const disabled = busy || loading || !!local.pending;
  const updateForm = (field, value) => {
    try {
      const form = latest.current.form;
      persist({ ...latest.current, form: { ...form, ...(typeof field === "function" ? field(form) : typeof field === "object" ? field : { [field]: value }) } });
    } catch (e) { setError(e.message); }
  };
  const run = async (action, payload, retry = false) => {
    if (operation.current || !writable || loading) return;
    if (latest.current.pending && !retry) return;
    operation.current = true; ++epoch.current; setBusy(true); setError(""); setNotice("");
    try {
      const attempt = retry ? latest.current.pending : { action, payload: { ...payload, request_id: crypto.randomUUID() } };
      persist({ ...latest.current, pending: attempt });
      const next = await commerceRpc(context, root.id, unit.id, attempt.action, attempt.payload);
      if (!alive.current) return;
      const links = { ...latest.current.links };
      if (attempt.action === "publish") links[attempt.payload.document_id] = residentUrl(attempt.payload.token);
      if (attempt.action === "revoke") delete links[attempt.payload.document_id];
      persist({ ...latest.current, pending: null, links, form: attempt.action === "create" ? null : latest.current.form });
      setData(next); setHandling(null);
      if (attempt.action === "create") setSelected(next.document_id);
      if (attempt.action === "create") setEditing(false);
      setNotice(attempt.action === "publish" ? "Beboerlenken er klar. Kopier og del den med riktig mottaker." : "Lagret i prosjektets avtalehistorikk.");
      window.dispatchEvent(new CustomEvent(COMMERCE_EVENT));
    } catch (e) {
      if (alive.current) {
        setError(e.message + " Kladden er beholdt.");
        if (["22023", "PT409", "42501", "23505"].includes(e.code)) {
          try { persist({ ...latest.current, pending: null }); } catch {}
        }
        if (e.code === "42501") setData(null);
      }
    } finally { operation.current = false; if (alive.current) setBusy(false); }
  };
  const start = (kind, prior = null) => {
    try {
      persist({ ...latest.current, form: {
        kind, group_id: prior?.group_id || null, order_id: prior?.snapshot.order_id || "",
        choice_revision: data.choice_revision, delivery_revision: data.delivery_revision,
        reason: prior?.snapshot.reason || "", adjustment: prior ? String(prior.snapshot.delta_cents / 100) : "0",
        sections: [], lines: prior?.kind === "change" ? (prior.snapshot.fulfillment_goods || prior.snapshot.goods).map(g => ({ ...g, section_id: "" })) : [],
      } });
      setSelected(null);
      setEditing(true);
    } catch (e) { setError(e.message); }
  };
  const doc = data?.documents.find(d => d.id === selected);
  const overview = agreementOverview(data?.documents);
  const row = d => <button type="button" key={d.id} className="bolig-commerce-row" onClick={() => { setSelected(d.id); setHandling(null); }}>
    <span><strong>{d.kind === "change" ? `Endringsordre · ${d.snapshot.order_number}` : "Boligvalg"} · v{d.version}</strong><small>{stamp(d.created_at)}{d.kind === "change" ? ` · ${supplierDelta(d.snapshot.before_goods,d.snapshot.goods).length} vareendringer` : ""}</small></span>
    <span className={`bolig-commerce-badge ${d.status}`}>{d.kind === "change" && d.status === "handled" && !d.fulfillment_applied_at ? "Leveransen må oppdateres" : commerceLabels[d.status]}</span>
  </button>;
  const form = local.form;
  return <section className="bolig-commerce" aria-label="Endringer og beboeraksept">
    <div className="bolig-commerce-heading"><FileSignature size={27}/><div>
      <h3>Endringer og beboeraksept</h3>
      <p>Lag et grunnlag, kontroller det og del beboerlenken. Svaret lagres på nøyaktig den utgaven beboeren har sett.</p>
    </div></div>
    {error && <p role="alert" className="bolig-error">{error}</p>}
    {notice && <p role="status" className="bolig-notice">{notice}</p>}
    {loading && <p role="status">Henter avtalehistorikk …</p>}
    {local.pending && writable && <div className="bolig-notice"><p>Forrige lagring er ikke bekreftet. Prøv samme forsøk for å unngå dobbel registrering.</p>
      <button type="button" disabled={busy || loading} onClick={() => run(null, null, true)}>Prøv samme lagring igjen</button></div>}
    {data && <>
      {writable && !form && <div className="bolig-commerce-actions">
        {overview.choice?.status !== "accepted" && <button type="button" disabled={disabled || !data.selection} onClick={() => start("choice", overview.choice)}><Plus size={17}/>Klargjør beboeraksept</button>}
        <button type="button" disabled={disabled || !data.orders.length} onClick={() => start("change")}><Plus size={17}/>Ny endringsordre</button>
      </div>}
      {!data.selection && <p>Lagre boligens grunnpakke og tilvalgspakker før du klargjør beboeraksept.</p>}
      {form && writable && !editing && <div className="bolig-commerce-actions"><button type="button" disabled={disabled} onClick={() => setEditing(true)}>Fortsett kladd</button>
        <button type="button" disabled={disabled} onClick={() => { try { persist({ ...latest.current, form: null }); } catch (e) { setError(e.message); } }}>Forkast kladden</button></div>}
      {form && editing && writable && <Dialog title={form.kind === "change" ? "Ny endringsordre" : "Klargjør beboeraksept"} busy={busy} onClose={() => setEditing(false)}>
        <p>{unit.number} · {form.kind === "change" ? "Beskriv endringen og kontroller varer og pris. Originalbestillingen beholdes i historikken." : "Beboeren får de lagrede varene og den avtalte tilvalgsprisen til gjennomgang."}</p>
        {error && <p role="alert">{error}</p>}
        {local.pending && <button type="button" disabled={busy || loading} onClick={() => run(null, null, true)}>Prøv samme lagring igjen</button>}
        {form.kind === "choice" && form.choice_revision !== data.choice_revision && <p role="alert">Boligvalget er endret. Lukk kladden og klargjør fra siste lagrede boligvalg.</p>}
        {form.kind === "change" && form.delivery_revision !== data.delivery_revision && <p role="alert">Bestillinger eller mottak er endret. Hent siste grunnlag og se over kladden.</p>}
        <form onInvalidCapture={e => { let node = e.target.parentElement; while (node && node !== e.currentTarget) { if (node.tagName === "DETAILS") node.open = true; node = node.parentElement; } }} onSubmit={e => { e.preventDefault(); if (e.currentTarget.querySelector('[data-image-uploading="true"]')) { setError("Vent til bildet er lastet opp."); return; }
          try { run("create", { ...form, delta_cents: signedCents(form.adjustment), lines: form.lines.map(g => ({ ...g, quantity: Number(g.quantity) })) }); } catch (err) { setError(err.message); } }}>
          <fieldset disabled={disabled}>
            {form.kind === "change" && <>
              <label>Bestillingen som endres<select aria-label="Bestillingen som endres" required value={form.order_id} onChange={e => {
                const order = data.orders.find(o => o.id === e.target.value);
                updateForm({ order_id: e.target.value, delivery_revision: data.delivery_revision, lines: (order?.goods || []).map(g => ({ ...g, section_id: "" })) });
              }}><option value="">Velg bestilling</option>{data.orders.map(o => <option value={o.id} key={o.id}>{o.number}</option>)}</select></label>
              {form.order_id && <ContentEditor value={form} change={updateForm} context={context} rootId={root.id} base={false}/>}
              <label>Pristillegg / fratrekk inkl. mva.<input required inputMode="decimal" value={form.adjustment} onChange={e => updateForm("adjustment", e.target.value)}/>
                <small>Minusbeløp gir fratrekk. 0 beholder prisen.</small></label>
            </>}
            {form.kind === "choice" && <p>Lagret boligvalg v{form.choice_revision} · Tilvalg og tilpasninger: <strong>{money(data.selection?.total_cents)}</strong> inkl. mva.</p>}
            <label>Beskrivelse til beboeren<textarea required minLength={3} maxLength={2000} rows={4} value={form.reason} onChange={e => updateForm("reason", e.target.value)}/></label>
            <div className="bolig-commerce-actions"><button type="submit">Lagre og gjennomgå</button>
              <button type="button" onClick={() => setEditing(false)}>Lukk og behold kladden</button></div>
          </fieldset>
        </form>
      </Dialog>}
      <h4>Gjeldende boligavtale</h4>
      {overview.choice ? row(overview.choice) : <p>Ingen boligavtale er klargjort ennå.</p>}
      {overview.choice?.status === "accepted" && <p className="bolig-commerce-guidance">Boligvalget er akseptert. Samle videre vare- og prisendringer i en ny endringsordre.</p>}
      <h4>Siste endringsgrunnlag · {overview.changes.length}</h4>
      <p>Gjør alle ønskede vareendringer i samme kladd. Gjennomgå samlet pris før du lager beboerlenken.</p>
      <div className="bolig-commerce-list">{overview.changes.map(row)}</div>
      <details className="bolig-commerce-history"><summary><History size={18}/> Avtalehistorikk · {overview.history.length} tidligere utgaver</summary>
        <div className="bolig-commerce-list">{overview.history.slice(0,historyLimit).map(row)}</div>
        {overview.history.length > historyLimit && <button type="button" onClick={() => setHistoryLimit(n => n+10)}>Vis flere avtaler · {overview.history.length-historyLimit} til</button>}
      </details>
      {doc && <Dialog title={`${doc.kind === "change" ? "Endringsordre" : "Beboeraksept"} · utgave ${doc.version}`} busy={busy} onClose={() => setSelected(null)}>
        <p><strong>{unit.number}</strong> · <span className={`bolig-commerce-badge ${doc.status}`}>{commerceLabels[doc.status]}</span></p>
        {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
        {local.pending && <button type="button" disabled={busy || loading} onClick={() => run(null, null, true)}>Prøv samme lagring igjen</button>}
        <Summary document={doc}/>
        {doc.accepted_at && <p className="bolig-notice"><CheckCircle2 size={18}/> {doc.status === "declined" ? "Avslått" : "Akseptert"} av {doc.accepted_name} · {stamp(doc.accepted_at)}</p>}
        {doc.kind === "change" && <p className="bolig-notice">Last ned endringsgrunnlaget og avklar tilleggsbestilling eller kreditering med leverandøren. Bekreft deretter for å oppdatere mottak og FDV. Originalbestillingen beholdes i historikken.</p>}
        {doc.fulfillment_applied_at && <p className="bolig-notice"><strong>Leveranse, mottak og FDV er oppdatert</strong><br/>{doc.fulfillment_reference} · {stamp(doc.fulfillment_applied_at)}</p>}
        {doc.handling_note && <p><strong>Leverandør og bestilling er fulgt opp</strong><br/>{doc.handling_note}</p>}
        {local.links[doc.id] && doc.status === "published" && <div className="bolig-commerce-link">
          <label>Beboerlenke<input readOnly value={local.links[doc.id]} onFocus={e => e.target.select()}/></label>
          <button type="button" disabled={disabled} onClick={async () => {
            try { await navigator.clipboard.writeText(local.links[doc.id]); setNotice("Beboerlenken er kopiert."); } catch { setNotice("Marker og kopier beboerlenken fra feltet."); }
          }}><Link2 size={16}/>Kopier beboerlenke</button>
          <small>Lenken gir tilgang til denne avtalen i 30 dager. Del den bare med riktig beboer.</small>
        </div>}
        {doc.status === "published" && !local.links[doc.id] && <p>Lenken er laget i en annen nettleser. Hvis den er mistet, tilbakekall denne utgaven og klargjør en ny.</p>}
        {writable && <div className="bolig-commerce-actions">
          {doc.status === "draft" && <button type="button" disabled={disabled} onClick={() => run("approve", { document_id: doc.id, revision: doc.revision })}>Godkjenn grunnlaget</button>}
          {doc.status === "approved" && <button type="button" disabled={disabled} onClick={() => run("publish", { document_id: doc.id, revision: doc.revision, token: newResidentToken() })}>Lag beboerlenke</button>}
          {["draft", "approved", "published", "expired"].includes(doc.status) && <button type="button" disabled={disabled} onClick={() => run("revoke", { document_id: doc.id, revision: doc.revision })}>Tilbakekall utgaven</button>}
          {["draft", "approved", "published", "expired", "declined", "revoked"].includes(doc.status) && <button type="button" disabled={disabled || !!form} onClick={() => start(doc.kind, doc)}>Lag ny utgave</button>}
          {doc.kind === "change" && ["accepted","handled"].includes(doc.status) && <button type="button" disabled={disabled} onClick={() => { try { downloadAmendment(doc,context); } catch (e) { setError(e.message); } }}>Last ned endringsbestilling / kreditering</button>}
          {doc.kind === "change" && ["accepted","handled"].includes(doc.status) && !doc.fulfillment_applied_at && <button type="button" disabled={disabled} onClick={() => setHandling(local.followups?.[doc.id] || {note:doc.handling_note || "",reference:"",reviewed:false})}>Registrer leverandøroppfølging</button>}
        </div>}
        {handling !== null && writable && <form onSubmit={e => { e.preventDefault(); run("apply", { document_id: doc.id, revision: doc.revision, ...handling }); }}>
          <SupplierFollowup value={handling} disabled={disabled} change={fields => { const next={...handling,...fields};setHandling(next);try { persist({...latest.current,followups:{...latest.current.followups,[doc.id]:next}}); } catch(e) { setError(e.message); } }}/>
          <button type="submit" disabled={disabled}>Bekreft og oppdater leveransen</button>
        </form>}
      </Dialog>}
    </>}
  </section>;
}
function SupplierFollowup({value,change,disabled}) {
  return <fieldset disabled={disabled}>
    <label>Bestillings- eller krediteringsreferanse<input aria-label="Bestillings- eller krediteringsreferanse" required minLength={2} maxLength={160} value={value.reference} onChange={e=>change({reference:e.target.value,reviewed:false})}/></label>
    <label>Leverandørbekreftelse og bestillingsreferanse<textarea aria-label="Leverandørbekreftelse og bestillingsreferanse" required minLength={10} maxLength={2000} rows={4} value={value.note} onChange={e=>change({note:e.target.value,reviewed:false})} placeholder="Hvem bekreftet endringen, når, og hvor er den bestilt eller kreditert?"/></label>
    <label className="bolig-commerce-confirm"><input type="checkbox" required checked={value.reviewed} onChange={e=>change({reviewed:e.target.checked})}/><span>Leverandøren har bekreftet alle tillegg og reduksjoner. Jeg vil oppdatere leveransen, mottaksgrunnlaget og FDV.</span></label>
  </fieldset>;
}
