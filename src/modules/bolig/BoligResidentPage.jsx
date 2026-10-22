import React, { useEffect, useRef, useState } from "react";
import Summary from "./BoligAgreementSummary.jsx";
import { residentRpc } from "./boligResidentClient.js";
import { agreementMoney as money } from "./boligCommerceCore.js";

export default function BoligResidentPage() {
  const token = useRef(window.location.hash.slice(1));
  const [doc, setDoc] = useState(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null), [busy, setBusy] = useState(false), [confirming, setConfirming] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const alive = useRef(true), operating = useRef(false);
  const key = doc ? `expo-bolig-resident:${doc.id}` : null;
  const load = async () => {
    if (operating.current) return;
    setLoading(true); setError("");
    try {
      if (!/^[0-9a-f]{64}$/.test(token.current)) throw Error("Lenken er ufullstendig. Åpne hele lenken du har fått fra prosjektleder.");
      const next = await residentRpc(token.current);
      if (!alive.current) return;
      setDoc(next);
      if (["accepted", "declined", "handled"].includes(next.status)) { setUncertain(false); setConfirming(false); }
      let saved;
      try { saved = JSON.parse(sessionStorage.getItem(`expo-bolig-resident:${next.id}`)); } catch {}
      setDraft(current => current || saved || { name: "", confirmed: false, decision: "accept", request_id: crypto.randomUUID() });
    } catch (e) { if (alive.current) { setError(e.message); setDoc(null); } }
    finally { if (alive.current) setLoading(false); }
  };
  useEffect(() => {
    alive.current = true; load();
    // A second agreement can open in the same tab with only the fragment changed.
    // Recreate the page so the token, receipt and pending answer stay together.
    const changeAgreement = () => window.location.reload();
    window.addEventListener("hashchange", changeAgreement);
    return () => { alive.current = false; window.removeEventListener("hashchange", changeAgreement); };
  }, []);
  const update = fields => {
    const next = { ...draft, ...fields };
    setDraft(next); setConfirming(false);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { setError("Nettleseren kunne ikke sikre svaret. Behold siden åpen og prøv igjen."); }
  };
  const decide = async () => {
    if (operating.current || !doc || !draft || !draft.confirmed) return;
    operating.current = true; setBusy(true); setError("");
    try {
      // Persist the same request before transmission; a lost response is retried
      // with that identity rather than creating another acceptance.
      sessionStorage.setItem(key, JSON.stringify(draft));
      const next = await residentRpc(token.current, draft.decision, doc.id, {
        name: draft.name, confirmed: draft.confirmed, request_id: draft.request_id,
      });
      if (!alive.current) return;
      const expected = draft.decision === "accept" ? ["accepted", "handled"] : ["declined"];
      if (next.id !== doc.id || !expected.includes(next.status)) throw Error("Svaret kunne ikke bekreftes. Hent siste status før du fortsetter.");
      setDoc(next); setUncertain(false); setConfirming(false);
      try { sessionStorage.removeItem(key); } catch {}
    } catch (e) {
      if (alive.current) { setError(e.message); setUncertain(!e.code); }
    } finally { operating.current = false; if (alive.current) setBusy(false); }
  };
  const decided = doc && ["accepted", "declined", "handled"].includes(doc.status);
  return <main className="bolig-resident-page">
    <header className="bolig-resident-brand"><span>EP</span><div><strong>Expo ProffDok</strong><small>Boligvalg og endringer</small></div></header>
    {loading && <section className="bolig-resident-card" role="status"><h1>Henter avtalen din …</h1></section>}
    {error && <p role="alert" className="bolig-resident-error">{error}</p>}
    {error && doc && <button type="button" disabled={busy || loading} onClick={load}>Hent siste status</button>}
    {!loading && !doc && <section className="bolig-resident-card"><h1>Avtalen kan ikke åpnes</h1><p>Kontroller lenken eller kontakt prosjektleder.</p><button type="button" onClick={load}>Prøv å hente avtalen igjen</button></section>}
    {doc && <>
      <section className="bolig-resident-intro"><small>{doc.snapshot.identity.company} · {doc.snapshot.identity.project}</small>
        <h1>{doc.kind === "change" ? "Endring av leveransen din" : "Dine boligvalg"}</h1>
        <p>{doc.snapshot.identity.block} · <strong>{doc.snapshot.identity.unit}</strong>{doc.snapshot.identity.address ? ` · ${doc.snapshot.identity.address}` : ""}</p>
        <span className="bolig-resident-version">Utgave {doc.version}</span>
      </section>
      {decided && <section className="bolig-resident-receipt" role="status">
        <h2>{doc.status === "declined" ? "Avslaget ditt er registrert" : "Aksepten din er registrert"}</h2>
        <p>{doc.accepted_name} · {new Date(doc.accepted_at).toLocaleString("nb-NO", { timeZone: "Europe/Oslo", dateStyle: "long", timeStyle: "short" })}</p>
        <p>Dette er kvitteringen for utgave {doc.version}. Kontakt prosjektleder hvis du ønsker å endre svaret.</p>
        <button type="button" onClick={() => window.print()}>Skriv ut kvittering</button>
      </section>}
      <section className="bolig-resident-card"><h2>Dette gjelder avtalen</h2><Summary document={doc}/></section>
      {doc.status === "published" && draft && <section className="bolig-resident-card">
        <h2>{confirming ? "Kontroller svaret ditt" : "Gi ditt svar"}</h2>
        <p>Se gjennom varer, antall og pris før du svarer. Svaret gjelder denne utgaven.</p>
        {confirming ? <div>
          <p><strong>{draft.name}</strong> · {draft.decision === "accept" ? "Aksepterer" : "Avslår"} utgave {doc.version}</p>
          <p>{doc.kind === "change" ? "Pristillegg / fratrekk" : "Tilvalg og tilpasninger"}: <strong>{money(doc.kind === "change" ? doc.snapshot.delta_cents : doc.snapshot.total_cents)}</strong> inkl. mva.</p>
          <div className="bolig-resident-actions"><button type="button" disabled={busy} onClick={decide}>{busy ? "Registrerer svaret …" : draft.decision === "accept" ? "Registrer aksept" : "Registrer avslag"}</button>
            <button type="button" disabled={busy || uncertain} onClick={() => setConfirming(false)}>Tilbake</button></div>
          {uncertain && <p role="status">Sendingen er ikke bekreftet. Bruk samme knapp igjen; svaret blir ikke registrert dobbelt.</p>}
        </div> : <form onSubmit={e => { e.preventDefault(); setConfirming(true); }}>
          <fieldset disabled={busy}>
            <label>Fullt navn<input required minLength={2} maxLength={120} autoComplete="name" value={draft.name} onChange={e => update({ name: e.target.value })}/></label>
            <label>Ditt svar<select value={draft.decision} onChange={e => update({ decision: e.target.value, confirmed: false })}>
              <option value="accept">Jeg ønsker å akseptere</option><option value="decline">Jeg ønsker å avslå</option>
            </select></label>
            <label className="bolig-resident-confirm"><input type="checkbox" required checked={draft.confirmed} onChange={e => update({ confirmed: e.target.checked })}/>
              <span>{draft.decision === "accept" ? "Jeg har gjennomgått varene og prisen, og ønsker å akseptere denne utgaven." : "Jeg har gjennomgått avtalen og ønsker å avslå denne utgaven."}</span></label>
            <button type="submit">Kontroller svaret</button>
          </fieldset>
        </form>}
        <p className="bolig-resident-deadline">Svarfrist: {new Date(doc.expires_at).toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}. Kontakt prosjektleder ved spørsmål.</p>
      </section>}
      <footer>Avtalen lagres hos {doc.snapshot.identity.company}. Lenken gjelder bare denne avtalen.</footer>
    </>}
  </main>;
}
