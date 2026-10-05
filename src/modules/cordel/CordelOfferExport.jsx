import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { buildCordelAcceptedModel, cordelAmount, createCordelOfferFiles } from "./acceptedOfferCordel.mjs";
import { downloadCordelFile } from "./cordelFiles.mjs";

export default function CordelOfferExport({ request, enabled = true, disabled = false }) {
  const [downloadError, setDownloadError] = useState("");
  const prepared = useMemo(() => {
    if (!enabled) return { error: "Henter låst, akseptert tilbudsgrunnlag …" };
    try { return { model: buildCordelAcceptedModel(request) }; }
    catch (error) { return { error: error.message }; }
  }, [request, enabled]);
  const download = () => {
    if (disabled || !prepared.model) return;
    setDownloadError("");
    try {
      const result = createCordelOfferFiles(request);
      downloadCordelFile("ProffDok_Cordel.zip", result.bytes, "application/zip");
    } catch (error) { setDownloadError(error.message || "Cordel-filene kunne ikke opprettes."); }
  };
  return (
    <section data-cordel-offer-export="true" style={{ padding: 16, border: "1px solid #c9dfe2", borderRadius: 12, background: "#f5fbfc", marginTop: 14 }}>
      <h3 style={{ margin: "0 0 8px" }}>Cordel-ordre</h3>
      <p style={{ margin: "0 0 12px" }}>Last ned jobbliste og spesifikasjon fra det aksepterte tilbudet.</p>
      {prepared.model ? <p style={{ margin: "0 0 12px" }}>{prepared.model.groups.length} jobber · {prepared.model.detailCount} poster · {cordelAmount(prepared.model.acceptedCents)} kr eks. mva.</p> : null}
      <button type="button" className="sales-secondary-button" onClick={download} disabled={disabled || !prepared.model}>
        <Download size={16} /> Last ned til Cordel
      </button>
      {prepared.error || downloadError ? <p role="status">{downloadError || prepared.error}</p> : null}
      <details style={{ marginTop: 12 }}>
        <summary>Import i Cordel</summary>
        <ol>
          <li>Pakk ut filene i P:\Expo ProffDok. Filnavnene er faste, så eksisterende definisjon kan gjenbrukes.</li>
          <li>Importer ProffDok_Cordel_Jobbliste.txt i Jobbliste (F6) på en tom ordre.</li>
          <li>Importer ProffDok_Cordel_Ordre.AFG via Anbud fra Grossist. La «Slett nåværende spesifikasjon», kundeadresse og akkordsatser være av.</li>
        </ol>
        <p>Ordremetoden må ha 0 % materiellpåslag og totalsumavrunding til Øre for å beholde akseptert pris.</p>
        <p>Eksporten overfører salgsprisene. Reell kalkulert kost og fortjeneste overføres ikke.</p>
      </details>
    </section>
  );
}
