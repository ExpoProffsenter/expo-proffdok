import React, { useEffect, useRef, useState } from "react";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";

export default function CompanyCustomerPicker({ value, onUse, disabled = false }) {
  const [companyId, setCompanyId] = useState(null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saveWanted, setSaveWanted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const revision = useRef(0);
  useEffect(() => {
    const reset = () => { const current = ++revision.current; setCompanyId(null); setRows([]); setSelected(null); setSaveWanted(false); setQuery(""); setMessage(""); setBusy(false);
      if (!disabled) rpcWithStoredSession("search_company_customers", { p_query: "" }).then(result => { if (revision.current === current) setCompanyId(result?.company_id || null); }).catch(() => { if (revision.current === current) setMessage("Kunderegisteret er ikke tilgjengelig. Prøv Søk kunder på nytt."); });
    };
    reset();
    window.addEventListener(WORK_PROFILE_EVENT, reset);
    return () => { revision.current++; window.removeEventListener(WORK_PROFILE_EVENT, reset); };
  }, [disabled]);
  async function search() {
    const current = ++revision.current;
    setBusy(true); setMessage(""); setRows([]);
    try {
      const result = await rpcWithStoredSession("search_company_customers", { p_query: query });
      if (revision.current === current) { setCompanyId(result?.company_id || null); setRows(result?.customers || []); if (!result?.customers?.length) setMessage("Ingen lagrede kunder funnet."); }
    } catch (error) { if (revision.current === current) setMessage(error.message || "Kundesøket kunne ikke fullføres."); }
    finally { if (revision.current === current) setBusy(false); }
  }
  async function save() {
    const current = ++revision.current;
    setBusy(true); setMessage("");
    try {
      const result = await rpcWithStoredSession("save_company_customer", { p_id: selected?.id || null, p_expected_revision: selected?.revision || null, p_customer: value, p_expected_company_id: companyId });
      if (revision.current === current) { setSelected(result); setSaveWanted(false); setMessage("Kunden er lagret i firmaets kunderegister."); }
    } catch (error) { if (revision.current === current) setMessage(error.message || "Kunden kunne ikke lagres."); }
    finally { if (revision.current === current) setBusy(false); }
  }
  if (disabled) return null;
  return <section style={{ gridColumn: "1 / -1", border: "1px solid #dbe5ea", borderRadius: 10, padding: 12, marginBottom: 12 }}>
    <strong>Firmaets kunderegister</strong>
    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
      <label>Søk lagret kunde <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Navn eller e-post" /></label>
      <button type="button" onClick={search} disabled={busy}>Søk kunder</button>
    </div>
    {rows.map(row => <button type="button" key={row.id} disabled={busy} style={{ display: "block", marginTop: 8 }} onClick={() => { setSelected(row); onUse(row.customer); setRows([]); setSaveWanted(false); setMessage("Kundeinformasjonen er hentet. Kontroller prosjektadressen før lagring."); }}>{row.customer.customer} · {row.customer.email || row.customer.phone || "Ingen kontaktinformasjon"}</button>)}
    <label style={{ display: "block", marginTop: 10 }}><input type="checkbox" checked={saveWanted} disabled={busy} onChange={event => setSaveWanted(event.target.checked)} /> Lagre i firmaets kunderegister</label>
    <small style={{ display: "block" }}>Lagre faste kunder for å gjenbruke kundeinformasjonen senere. Engangskunder trenger ikke lagres. Valget er av som standard.</small>
    {saveWanted && <div><button type="button" disabled={busy || !companyId || !String(value?.customer || "").trim()} onClick={save}>{busy ? "Lagrer …" : selected ? "Oppdater lagret kunde" : "Lagre kunde"}</button>{selected && <button type="button" disabled={busy} onClick={() => setSelected(null)}>Lagre som ny kunde</button>}</div>}
    {message && <p role="status">{message}</p>}
  </section>;
}
