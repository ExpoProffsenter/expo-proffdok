import React, { useCallback, useEffect, useRef, useState } from "react";
import SalesBathroomSketch, { bathroomSketchDataUrl } from "../sales/components/SalesBathroomSketch.jsx";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { collaborationRpc } from "./boligCollaborationClient.js";
import { boligDraftKey, clearBoligDraft, readBoligDraft, writeBoligDraft } from "./boligClient.js";

const bucket = "bolig-inspection-photos";
const fields = [
  ["date", "Dato", "date"],
  ["time", "Klokkeslett", "time"],
  ["responsible", "Ansvarlig", "text"],
  ["customerWishes", "Kundens ønsker"],
  ["existingConditions", "Eksisterende forhold"],
  ["measurements", "Målinger"],
  ["observations", "Observasjoner og merknader"],
];

function InspectionPhoto({ path, number }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl;
    async function load() {
      try {
        const { data, error: failure } = await getAppSupabaseClient().storage.from(bucket).download(path);
        if (failure) throw failure;
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setUrl(objectUrl);
      } catch {
        if (active) setError(true);
      }
    }
    void load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  if (error) return <p role="status">Bilde {number} kunne ikke åpnes.</p>;
  if (!url) return <p role="status">Henter bilde {number} …</p>;
  return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Befaringsbilde ${number}`} style={{ maxWidth: "min(100%, 320px)" }} /></a>;
}

export default function BoligInspection({ context, root, unit, editable = false }) {
  const key = boligDraftKey(context, root.id, `inspection:${unit.id}`);
  const pending = useRef(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const mountForm = useCallback((node) => setPortalTarget(node?.closest("dialog") || null), []);
  const [record, setRecord] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draftWarning, setDraftWarning] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);
  const args = { p_root: root.id, p_unit: unit.id };

  useEffect(() => {
    let active = true;
    setRecord(null);
    setError("");
    collaborationRpc("bolig_unit_inspection", { p_root: root.id, p_unit: unit.id }, context.user_id)
      .then((value) => {
        if (!active) return;
        setRecord(value);
        if (editable) setDraft(readBoligDraft(key, null) || {
          revision: value.revision, note: value.note || {}, photos: value.photos,
        });
      })
      .catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [context.user_id, editable, key, root.id, unit.id, loadVersion]);

  function update(next) {
    setDraft(next);
    setDraftWarning(!writeBoligDraft(key, next));
    setNotice("");
  }

  async function addPhotos(event) {
    const files = [...event.target.files];
    event.target.value = "";
    if (!files.length || pending.current) return;
    if (draft.photos.length + files.length > 24 || files.some((file) =>
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10485760)) {
      setError("Velg inntil 24 bilder totalt. Bruk JPG, PNG eller WebP på maks 10 MB per bilde.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    let next = draft;
    try {
      for (const file of files) {
        const path = `${root.id}/${unit.id}/${crypto.randomUUID()}`;
        const { error: failure } = await getAppSupabaseClient().storage.from(bucket).upload(path, file);
        if (failure) throw failure;
        next = { ...next, photos: [...next.photos, path] };
        update(next);
      }
    } catch (failure) {
      setError(`Kunne ikke legge til alle bildene. Bilder som ble lastet opp er beholdt i kladden. ${failure.message}`);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (pending.current || draft.revision !== record.revision) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await collaborationRpc("bolig_unit_inspection", {
        ...args, p_revision: draft.revision, p_note: draft.note, p_photos: draft.photos,
      }, context.user_id);
      setRecord(saved);
      setDraft({ revision: saved.revision, note: saved.note, photos: saved.photos });
      clearBoligDraft(key);
      setDraftWarning(false);
      setNotice("Befaringen er lagret.");
    } catch (failure) {
      setError(failure.message);
      if (failure.code === "PT409") setLoadVersion((value) => value + 1);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (!record || (editable && !draft)) {
    return error ? <><p role="alert">{error}</p><button type="button" onClick={() => setLoadVersion(loadVersion + 1)}>Prøv igjen</button></>
      : <p role="status">Henter befaring …</p>;
  }
  if (!editable) {
    const sketch = bathroomSketchDataUrl(record.note?.sketch);
    if (!record.note) return <p>Ingen befaring er lagret for denne boligen.</p>;
    return <section aria-label="Lagret befaring">
      <dl>{fields.filter(([id]) => record.note[id]).map(([id, label]) =>
        <React.Fragment key={id}><dt><strong>{label}</strong></dt><dd style={{ whiteSpace: "pre-wrap" }}>{record.note[id]}</dd></React.Fragment>)}</dl>
      {sketch && <figure><img src={sketch} alt="Badskisse fra befaringen" style={{ maxWidth: "100%" }} /><figcaption>Badskisse fra befaringen</figcaption></figure>}
      {record.photos.map((path, index) => <InspectionPhoto key={path} path={path} number={index + 1} />)}
    </section>;
  }

  const conflict = draft.revision !== record.revision;
  const setNote = (id, value) => update({ ...draft, note: { ...draft.note, [id]: value } });
  return (
    <form ref={mountForm} className="bolig-draft-form" onSubmit={save}>
      <p>Lagret befaring kan leses av butikkansatte med personlig tilgang til prosjektet.</p>
      {error && <p role="alert">{error}</p>}
      {draftWarning && <p role="alert">Nettleseren kunne ikke sikre kladden lokalt. Lagre befaringen før du lukker.</p>}
      {notice && <p role="status">{notice}</p>}
      {conflict && <div role="alert">
        <p>En annen bruker har lagret en nyere versjon. Kladden vises nedenfor.</p>
        <button type="button" onClick={() => {
          if (window.confirm("Vil du forkaste kladden og hente det siste lagrede notatet?")) {
            clearBoligDraft(key);
            setDraft({ revision: record.revision, note: record.note || {}, photos: record.photos });
            setError("");
          }
        }}>Forkast kladd og hent lagret versjon</button>
      </div>}
      <fieldset disabled={busy}>
        {fields.map(([id, label, type]) => <label key={id}>{label}
          {type ? <input type={type} value={draft.note[id] || ""} maxLength={120} onChange={(event) => setNote(id, event.target.value)} />
            : <textarea value={draft.note[id] || ""} maxLength={12000} onChange={(event) => setNote(id, event.target.value)} />}
        </label>)}
        <SalesBathroomSketch portalTarget={portalTarget} value={draft.note.sketch} disabled={busy} onChange={(value) => setNote("sketch", value)} />
        <label>Legg til befaringsbilder
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} />
        </label>
        {draft.photos.map((path, index) => <div key={path}>
          {record.photos.includes(path) ? <InspectionPhoto path={path} number={index + 1} /> : <span>Bilde {index + 1} er lagt til i kladden.</span>}
          <button type="button" onClick={() => update({ ...draft, photos: draft.photos.filter((photo) => photo !== path) })}>Fjern bilde {index + 1}</button>
        </div>)}
      </fieldset>
      <button type="submit" disabled={busy || conflict}>{busy ? "Arbeider …" : "Lagre befaring"}</button>
    </form>
  );
}
