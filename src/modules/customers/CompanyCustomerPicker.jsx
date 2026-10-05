import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";

const CustomerContext = createContext(null);
const frame = { gridColumn: "1 / -1", border: "1px solid #dbe5ea", borderRadius: 16, padding: 18, marginBottom: 16, background: "#fff" };

export function CompanyCustomerProvider({ value, onUse, disabled = false, children }) {
  const [companyId, setCompanyId] = useState(null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saveWanted, setSaveWanted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTarget, setMessageTarget] = useState("search");
  const revision = useRef(0);
  useEffect(() => {
    const reset = () => { const current = ++revision.current; setMessageTarget("search"); setCompanyId(null); setRows([]); setSelected(null); setSaveWanted(false); setQuery(""); setMessage(""); setBusy(false);
      if (!disabled) rpcWithStoredSession("search_company_customers", { p_query: "" }).then(result => { if (revision.current === current) { setCompanyId(result?.company_id || null); setRows(result?.customers || []); } }).catch(() => { if (revision.current === current) setMessage("Kunderegisteret er ikke tilgjengelig. Prøv Søk kunder på nytt."); });
    };
    reset();
    window.addEventListener(WORK_PROFILE_EVENT, reset);
    return () => { revision.current++; window.removeEventListener(WORK_PROFILE_EVENT, reset); };
  }, [disabled]);
  async function search() {
    const current = ++revision.current;
    setMessageTarget("search"); setBusy(true); setMessage(""); setRows([]);
    try {
      const result = await rpcWithStoredSession("search_company_customers", { p_query: query });
      if (revision.current === current) { setCompanyId(result?.company_id || null); setRows(result?.customers || []); if (!result?.customers?.length) setMessage("Ingen lagrede kunder funnet."); }
    } catch (error) { if (revision.current === current) setMessage(error.message || "Kundesøket kunne ikke fullføres."); }
    finally { if (revision.current === current) setBusy(false); }
  }
  async function save() {
    const current = ++revision.current;
    setMessageTarget("save"); setBusy(true); setMessage("");
    try {
      const result = await rpcWithStoredSession("save_company_customer", { p_id: selected?.id || null, p_expected_revision: selected?.revision || null, p_customer: value, p_expected_company_id: companyId });
      if (revision.current === current) { setSelected(result); setRows(current => [...current.filter(row => row.id !== result.id), result].sort((a,b) => a.customer.customer.localeCompare(b.customer.customer, "nb"))); setSaveWanted(false); setMessage("Kunden er lagret i firmaets kunderegister."); }
    } catch (error) { if (revision.current === current) setMessage(error.message || "Kunden kunne ikke lagres."); }
    finally { if (revision.current === current) setBusy(false); }
  }
  const state = {value, onUse, disabled, companyId, query, setQuery, rows, setRows, selected, setSelected, saveWanted, setSaveWanted, busy, message, setMessage, messageTarget, setMessageTarget, search, save};
  return <CustomerContext.Provider value={state}>{children}</CustomerContext.Provider>;
}

export function CompanyCustomerSearch() {
  const state = useContext(CustomerContext);
  if (!state || state.disabled) return null;
  const {query, setQuery, rows, selected, setSelected, setSaveWanted, busy, onUse, setMessage, message, messageTarget, setMessageTarget, search} = state;
  return <section style={frame} aria-label="Firmaets kunderegister">
    <h2 style={{ margin: "0 0 12px", fontSize: 22 }}>Firmaets kunderegister</h2>
    <label className="sales-field" style={{ marginBottom: 12 }}><span>Velg lagret kunde</span>
      <select value={selected?.id || ""} disabled={busy} onChange={event => {
        const row = rows.find(item => item.id === event.target.value);
        setSelected(row || null); setSaveWanted(false);
        if (row) { onUse(row.customer); setMessageTarget("search"); setMessage("Kundeinformasjonen er hentet. Kontroller prosjektadressen før lagring."); }
      }}>
        <option value="">Velg kunde …</option>
        {selected && !rows.some(row => row.id === selected.id) && <option value={selected.id}>{selected.customer.customer}</option>}
        {rows.map(row => <option key={row.id} value={row.id}>{row.customer.customer}{row.customer.email ? ` · ${row.customer.email}` : ""}</option>)}
      </select>
    </label>
    <p>Velg en lagret kunde, eller søk på navn eller e-post.{rows.length >= 30 ? " Listen viser inntil 30 treff. Bruk søk for å finne flere." : ""}</p>
    <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
      <label className="sales-field" style={{ flex: 1, minWidth: 180 }}><span>Søk lagret kunde</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Navn eller e-post" /></label>
      <button type="button" className="sales-secondary-button" onClick={search} disabled={busy}>Søk kunder</button>
    </div>
    {messageTarget === "search" && message && <p role="status">{message}</p>}
  </section>;
}

export function CompanyCustomerSave() {
  const state = useContext(CustomerContext);
  if (!state || state.disabled) return null;
  const {value, companyId, selected, setSelected, saveWanted, setSaveWanted, busy, message, messageTarget, save} = state;
  return <section style={frame} aria-label="Lagre kunde for senere bruk">
    <h2 style={{ margin: "0 0 12px", fontSize: 22 }}>Lagre kunde for senere bruk</h2>
    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <input type="checkbox" style={{ width: 20, height: 20, minWidth: 20, padding: 0, margin: 0, flexShrink: 0 }} checked={saveWanted} disabled={busy} onChange={event => setSaveWanted(event.target.checked)} />
      <span>Lagre i firmaets kunderegister</span>
    </label>
    <p>Lagre faste kunder for å gjenbruke kundeinformasjonen senere. Engangskunder trenger ikke lagres. Valget er av som standard.</p>
    {saveWanted && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" className="sales-secondary-button" disabled={busy || !companyId || !String(value?.customer || "").trim()} onClick={save}>{busy ? "Lagrer …" : selected ? "Oppdater lagret kunde" : "Lagre kunde"}</button>{selected && <button type="button" className="sales-secondary-button" disabled={busy} onClick={() => setSelected(null)}>Lagre som ny kunde</button>}</div>}
    {messageTarget === "save" && message && <p role="status">{message}</p>}
  </section>;
}

export default function CompanyCustomerPicker(props) {
  return <CompanyCustomerProvider {...props}><CompanyCustomerSearch /><CompanyCustomerSave /></CompanyCustomerProvider>;
}
