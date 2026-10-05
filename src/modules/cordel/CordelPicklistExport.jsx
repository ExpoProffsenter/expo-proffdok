import { useCordelAccess, readCordelAccess } from "./cordelAccess.js";
import { useState } from "react";
import { Download } from "lucide-react";
import { CORDEL_PICKLIST_NAME, createCordelPicklist } from "./picklistCordel.mjs";
import { downloadCordelFile } from "./cordelFiles.mjs";

export default function CordelPicklistExport({ items, disabled = false, orderNumber = "" }) {
  const allowed = useCordelAccess();
  const [error, setError] = useState("");
  const download = async () => {
    if (!allowed || disabled) return;
    setError("");
    try { if (!(await readCordelAccess())) throw new Error("Cordel-tilgangen er ikke aktiv."); downloadCordelFile(CORDEL_PICKLIST_NAME, createCordelPicklist(items)); }
    catch (problem) { setError(problem.message || "Plukklisten kunne ikke eksporteres."); }
  };
  if (!allowed) return null;
  return (
    <div data-cordel-picklist-export="true">
      <button type="button" className="secondary" onClick={download} disabled={disabled || !items?.length}>
        <Download size={16} /> Last ned til Cordel
      </button>
      {error ? <p role="alert">{error}</p> : null}
      <details style={{ fontSize: 12, marginTop: 6 }}>
        <summary>Import av plukkliste</summary>
        <p>Åpne {orderNumber ? `ordre ${orderNumber}` : "riktig ordre"} i Cordel og importer filen som semikolonseparert ASCII: NR = 1, Mengde = 2, Fagområde = 3. Cordel henter pris fra sin prisbok. Lagre med fast filnavn i P:\Expo ProffDok.</p>
      </details>
    </div>
  );
}
