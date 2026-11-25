import React, { useState } from "react";
import {
  bathroomSketchHasContent,
  normalizeBathroomSketch,
} from "../sales/components/SalesBathroomSketch.jsx";
import { collaborationRpc } from "./boligCollaborationClient.js";

export default function BoligSketchTemplates({ context, root, unit, sketch, onUse, disabled, onBusy }) {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function request(payload, apply) {
    if (busy || disabled) return;
    setBusy(true);
    onBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await collaborationRpc("bolig_inspection_sketch_templates", {
        p_root: root.id, p_unit: unit.id, ...payload,
      }, context.user_id);
      apply(result);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }

  function saveTemplate() {
    const templateName = name.trim();
    if (!templateName || !bathroomSketchHasContent(sketch)) return;
    void request({ p_name: templateName, p_sketch: normalizeBathroomSketch(sketch) }, (result) => {
      setTemplates(result.templates);
      setName("");
      setMessage(`Malen «${templateName}» er lagret i prosjektet.`);
    });
  }

  function useTemplate() {
    if (bathroomSketchHasContent(sketch) &&
        !window.confirm("Vil du erstatte Badskissen i denne boligens befaringskladd?")) return;
    void request({ p_template: selected }, (result) => {
      if (!result.sketch) {
        setError("Malen er ikke tilgjengelig i dette prosjektet.");
        return;
      }
      onUse(normalizeBathroomSketch(result.sketch));
      setMessage("Malen er kopiert til boligen. Rediger skissen ved behov og lagre befaringen.");
    });
  }

  return (
    <details onToggle={(event) => {
      if (event.currentTarget.open) void request({}, (result) => setTemplates(result.templates));
    }}>
      <summary>Badskisse-maler i prosjektet</summary>
      <p>Maler inneholder bare selve Badskissen. Endringer i kopien gjelder denne boligen.</p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <label>Velg lagret mal
        <select value={selected} disabled={busy} onChange={(event) => setSelected(event.target.value)}>
          <option value="">Velg mal</option>
          {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={!selected || busy} onClick={useTemplate}>Bruk mal på boligen</button>
      <label>Navn på ny mal
        <input value={name} placeholder="For eksempel Bad type A" maxLength={80}
          disabled={busy || !bathroomSketchHasContent(sketch)}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveTemplate();
            }
          }} />
      </label>
      <button type="button" disabled={!name.trim() || busy || !bathroomSketchHasContent(sketch)}
        onClick={saveTemplate}>Lagre Badskisse som mal</button>
      {busy && <p role="status">Henter eller lagrer mal …</p>}
    </details>
  );
}
