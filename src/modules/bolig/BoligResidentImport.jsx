import React, {useEffect, useRef, useState} from 'react';
import Dialog from './BoligEditorDialog.jsx';
import {boligRpc, boligDraftKey, readBoligDraft, writeBoligDraft, clearBoligDraft} from './boligClient.js';
import {IMPORT_FIELDS, suggestResidentColumns, parseResidentText, residentGroups, residentImportRows} from './boligResidentImport.mjs';
import {readResidentFile} from './boligResidentWorkbook.mjs';
import './boligResidentImport.css';
export default function BoligResidentImport({context, record, onChanged}) {
  const [open, setOpen] = useState(false);
  if (!context.enabled || context.role !== 'manager' || record.root.archived) return null;
  const installed = record.units.every(u => Array.isArray(u.additional_contacts));
  return <section className="bolig-resident-import-entry">
    <button type="button" disabled={!installed} onClick={() => setOpen(true)}>Importer beboere fra Excel</button>
    <p>Hent eiere og kontaktopplysninger fra Excel. Se over boligkoblingene før lagring.</p>
    {!installed && <small>Beboerimport må klargjøres i dette miljøet før bruk.</small>}
    {open && <ResidentImportDialog key={`${context.user_id}/${context.company_id}/${record.root.id}`} context={context} record={record} onChanged={onChanged} onClose={() => setOpen(false)} />}
  </section>;
}
function ResidentImportDialog({context, record, onChanged, onClose}) {
  const key = boligDraftKey(context, record.root.id, 'resident-import');
  const [draft, setDraft] = useState(() => readBoligDraft(key, {grid: null, mapping: {}, groups: null, revision: null, pending: null}));
  const [sheets, setSheets] = useState([]), [sheetIndex, setSheetIndex] = useState(0), [text, setText] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  const alive = useRef(true), operating = useRef(false), scopeRef = useRef('');
  const scope = `${context.user_id}/${context.company_id}/${context.role}/${context.enabled}/${record.root.id}/${record.root.archived}`;
  scopeRef.current = scope;
  useEffect(() => {alive.current = true; return () => {alive.current = false;};}, []);
  const valid = () => alive.current && scopeRef.current === scope && context.enabled && context.role === 'manager' && !record.root.archived;
  const patch = fields => {
    const next = {...draft, ...fields};
    if (!writeBoligDraft(key, next)) {setError('Kladden kunne ikke sikres lokalt. Frigjør lagringsplass før du fortsetter.'); return false;}
    setDraft(next); setSaved(false); return true;
  };
  const grid = draft.grid;
  const chooseSheet = sheet => patch({grid: sheet.rows, mapping: suggestResidentColumns(sheet.rows[0]), groups: null, pending: null});
  const importFile = async file => {
    if (!file || operating.current || draft.pending) return;
    operating.current = true; setBusy(true); setError('');
    try {
      const result = await readResidentFile(file);
      if (!valid()) return;
      if (!result.length) throw Error('Ingen synlige ark med beboere ble funnet.');
      setSheets(result); setSheetIndex(0); chooseSheet(result[0]);
    } catch (e) {if (valid()) setError(e.message);}
    finally {operating.current = false; if (valid()) setBusy(false);}
  };
  const updateGroup = (index, fields) => patch({groups: draft.groups.map((g, i) => i === index ? {...g, ...fields} : g)});
  const save = async retry => {
    if (operating.current || !valid()) return;
    operating.current = true; setBusy(true); setError('');
    try {
      let attempt = draft.pending;
      if (!retry) {
        if (attempt) throw Error('Kontroller forrige lagring med samme innhold først.');
        if (draft.revision !== record.root.revision) throw Error('Prosjektet er endret. Forhåndsvis på nytt før lagring.');
        attempt = {revision: draft.revision, payload: {request_id: crypto.randomUUID(), reviewed: true, rows: residentImportRows(draft.groups, record)}};
        if (!patch({pending: attempt})) return;
      }
      if (!attempt) throw Error('Ingen lagring å kontrollere.');
      const result = await boligRpc('resident_import', {companyId: context.company_id, rootId: record.root.id, revision: attempt.revision, payload: attempt.payload});
      if (!valid()) return;
      if (result.receipt?.request_id !== attempt.payload.request_id || result.receipt?.root_id !== record.root.id) throw Error('Mangler lagringskvittering. Kontroller samme lagring igjen.');
      clearBoligDraft(key); setDraft({grid: null, mapping: {}, groups: null, pending: null}); setSaved(true);
      await onChanged();
    } catch (e) {
      if (valid()) {
        setError(e.message);
        if (['22023', '23514', '23505', 'PT409', '42501'].includes(e.code)) patch({pending: null, groups: null});
      }
    } finally {operating.current = false; if (valid()) setBusy(false);}
  };
  const units = record.units.filter(u => !u.archived && record.entrances.some(e => e.id === u.entrance_id && !e.archived && record.blocks.some(b => b.id === e.block_id && !b.archived)));
  const label = u => {const e = record.entrances.find(e => e.id === u.entrance_id); const b = record.blocks.find(b => b.id === e?.block_id); return `${b?.name || ''} · ${e?.address || ''} · ${u.number}`;};
  return <Dialog title="Importer beboere" busy={busy} onClose={onClose} className="bolig-preparation-dialog bolig-resident-import-dialog">
    <div className="bolig-preparation-body bolig-resident-import">
      <p>Opprett bygg og boliger og kontroller bolignumrene først. Importen fyller bare kontaktopplysninger i eksisterende boliger. Flere eierrader samles på én bolig med én felles beboerportal.</p>
      {saved && <p role="status">Kontaktene er lagret. Ingen invitasjoner eller varsler er sendt. Kontroller boligene og opprett deretter felles portalinvitasjoner.</p>}
      {error && <p role="alert">{error}</p>}
      <fieldset disabled={busy || !!draft.pending}>
        <label>Velg beboerliste<input type="file" accept=".xlsx,.csv,.tsv,.txt" onChange={e => {const f = e.target.files?.[0]; e.target.value = ''; importFile(f);}} /></label>
        <small>XLSX eller CSV, maks 5 MB. Første rad skal ha kolonnenavn. Formler må erstattes med verdier. Kontroller nummer og mobil i forhåndsvisningen; Excel-formatering overføres ikke.</small>
        <details><summary>Lim inn celler fra Excel</summary><label>Beboerliste med overskrifter<textarea rows={5} value={text} onChange={e => setText(e.target.value)} /></label><button type="button" onClick={() => {try {setError(''); chooseSheet({rows: parseResidentText(text)}); setSheets([]);} catch(e) {setError(e.message);}}}>Les innlimt liste</button></details>
        {sheets.length > 1 && <label>Ark<select value={sheetIndex} onChange={e => {setSheetIndex(Number(e.target.value)); chooseSheet(sheets[Number(e.target.value)]);}}>{sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}</select></label>}
        {grid && <>
          <h4>1. Kontroller kolonnene</h4>
          <div className="bolig-import-columns">{IMPORT_FIELDS.map(([field, title]) => <label key={field}>{title}<select value={draft.mapping[field] ?? -1} onChange={e => patch({mapping: {...draft.mapping, [field]: Number(e.target.value)}, groups: null})}><option value={-1}>Ikke valgt</option>{grid[0].map((h, i) => <option key={i} value={i}>{h || `Kolonne ${i + 1}`}</option>)}</select><small>Eksempel: {grid[1]?.[draft.mapping[field]] || '—'}</small></label>)}</div>
          <button type="button" onClick={() => {try {setError(''); patch({groups: residentGroups(grid, draft.mapping, record), revision: record.root.revision});} catch(e) {setError(e.message);}}}>Forhåndsvis boligkoblinger</button>
        </>}
        {draft.groups && <>
          <h4>2. Kontroller {draft.groups.length} boliger</h4>
          <p>Velg hovedkontakt når flere eiere er oppført. Alle deler boligens portal. E-postfunksjonene bruker fortsatt hovedkontakten. Ingen utsending aktiveres av importen.</p>
          {draft.groups.map((g, i) => {const u = units.find(u => u.id === g.unitId); return <fieldset key={g.key} className="bolig-import-group"><legend>{g.building} · {g.address} · {g.number}</legend>
            <small>Kilderader: {g.sourceRows.join(', ')}</small>
            <label>Koble til bolig<select value={g.unitId} onChange={e => updateGroup(i, {unitId: e.target.value, replace: false})}><option value="">Velg bolig – ingen sikker kobling</option>{units.map(u => <option key={u.id} value={u.id}>{label(u)}</option>)}</select></label>
            <ul>{g.contacts.map((c, n) => <li key={n}>{c.name} · {c.email || 'E-post mangler'} · {c.phone || 'Mobil mangler'}</li>)}</ul>
            <label>Hovedkontakt<select value={g.primary} onChange={e => updateGroup(i, {primary: e.target.value})}><option value="">Velg hovedkontakt</option>{g.contacts.map((c, n) => <option key={n} value={n}>{c.name}</option>)}</select></label>
            {u && (u.contact_name || u.contact_email || u.contact_phone || u.additional_contacts?.length) ? <><p>Nå registrert: {[{name: u.contact_name, email: u.contact_email, phone: u.contact_phone}, ...(u.additional_contacts || [])].map(c => `${c.name} · ${c.email} · ${c.phone}`).join('; ')}</p><label><input type="checkbox" checked={g.replace} onChange={e => updateGroup(i, {replace: e.target.checked})} />Erstatt kontaktlisten for denne boligen med listen ovenfor</label></> : null}
          </fieldset>;})}
          <p>Endrede eiere eller hovedkontakt stopper gamle portal- og avtaleslenker. Lag en ny felles portalinvitasjon etterpå. Historiske avtaler og bestillinger beholdes.</p>
        </>}
      </fieldset>
    </div>
      <footer className="bolig-preparation-footer"><button type="button" disabled={busy} onClick={onClose}>Lukk og behold utkast</button>
        {draft.pending ? <button type="button" disabled={busy} onClick={() => save(true)}>Kontroller samme lagring igjen</button> : draft.groups && <button type="button" disabled={busy} onClick={() => save(false)}>Bekreft og lagre {draft.groups.length} boliger</button>}
      </footer>
  </Dialog>;
}
