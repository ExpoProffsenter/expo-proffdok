import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import {
  loadBoligDocumentation,
  downloadBoligDocumentation,
  documentationFiles,
} from "./boligDocumentationExport.mjs";
import { completionLabels, completionTone } from "./boligCompletionClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
export default function BoligDocumentationExport({
  context,
  root,
  scopeId,
  onClose,
}) {
  const [rawData, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(""),
    [verified, setVerified] = useState(false);
  const data =
    rawData?.context?.company_id === context.company_id &&
    rawData?.context?.user_id === context.user_id &&
    rawData.scope_id === scopeId
      ? rawData
      : null;
  const alive = useRef(true),
    epoch = useRef(0);
  const current = (t) => alive.current && epoch.current === t;
  const load = async () => {
    const t = ++epoch.current;
    setVerified(false);
    setBusy(false);
    setProgress("");
    try {
      const d = await loadBoligDocumentation(context, root.id, scopeId);
      if (current(t)) {
        setData(d);
        setVerified(true);
        setError("");
      }
    } catch (e) {
      if (current(t)) {
        setError(e.message);
        if (e.code === "42501") setData(null);
      }
    }
  };
  useEffect(() => {
    alive.current = true;
    load();
    const events = [
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
    ];
    events.forEach((e) => window.addEventListener(e, load));
    return () => {
      alive.current = false;
      ++epoch.current;
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [context.company_id, context.user_id, context.role, root.id, scopeId]);
  const download = async (format) => {
    if (busy || !verified) return;
    const t = epoch.current;
    setBusy(true);
    setError("");
    setProgress("Kontrollerer grunnlaget …");
    try {
      const result = await downloadBoligDocumentation({
        context,
        rootId: root.id,
        scopeId,
        expected: data,
        format,
        isCurrent: () => current(t),
        onProgress: (p) => {
          if (current(t)) setProgress(p);
        },
      });
      if (current(t) && result)
        setProgress(
          format === "zip"
            ? `ZIP med samlet PDF og ${result.files} originalfiler er lastet ned.`
            : "Samlet PDF er lastet ned. Originalfilene følger ZIP-en.",
        );
    } catch (e) {
      if (current(t)) setError(e.message);
    } finally {
      if (current(t)) setBusy(false);
    }
  };
  const files = data?.scopes.flatMap((s) => s.data.documents) || [],
    checks = data?.scopes.reduce((n, s) => n + s.data.checks.length, 0) || 0;
  let fileProblem = "";
  if (data)
    try {
      documentationFiles(data);
    } catch (e) {
      fileProblem = e.message;
    }
  return (
    <Dialog
      className="bolig-quality-dialog"
      title="Samlet sluttdokumentasjon"
      busy={busy}
      onClose={onClose}
    >
      <div className="bolig-quality bolig-export">
        {!data ? (
          <p role="status">
            {error ||
              "Samler dokumentasjon fra riktig bolig, bygg og prosjekt …"}
          </p>
        ) : (
          <>
            <div className="bolig-quality-heading">
              <div>
                <span className="bolig-completion-eyebrow">Dokumentpakke</span>
                <h3>{data.title}</h3>
              </div>
              <span
                className={`bolig-completion-badge tone-${completionTone(data.status)}`}
              >
                {completionLabels[data.status]}
              </span>
            </div>
            <p>
              Samlet PDF med kontroller, protokollmerknader, dokumentoversikt og
              FDV. ZIP-en inneholder også originale filer, bilder og lagrede
              kontrollutgaver med historikk.
            </p>
            <div className="bolig-export-counts">
              <div>
                <strong>{checks}</strong>
                <span>kontroller</span>
              </div>
              <div>
                <strong>{files.length}</strong>
                <span>originalfiler</span>
              </div>
              <div>
                <strong>{data.fdv.length}</strong>
                <span>varelinjer i FDV</span>
              </div>
            </div>
            {!["ready", "handed_over"].includes(data.status) && (
              <div className="bolig-completion-rest">
                <strong>
                  {data.restpoints.length
                    ? `${data.restpoints.length} mindre restpunkter følger dokumentasjonen`
                    : "Dokumentasjonen kan lastes ned underveis"}
                </strong>
                <p>
                  Status og mangler vises i PDF-en. Nedlasting godkjenner ikke
                  arbeid og endrer ingen statuser.
                </p>
              </div>
            )}
            <div className="bolig-quality-notice">
              <strong>Ekstern FDV følger som lenker</strong>
              <p>
                Dokumentene bak lenkene er ikke vedlagt eller arkivert.
                Kontroller varelisten mot faktisk monterte produkter.{" "}
                {data.fdv.filter((g) => !g.fdv_url).length} varelinjer mangler
                FDV-lenke.
              </p>
            </div>
            <details>
              <summary>
                Vis innhold · {data.scopes.length} arbeidsområder
              </summary>
              <ul>
                {data.scopes.map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong>
                    {s.common ? " · fellesdokumentasjon" : ""}
                    <p>
                      {s.data.checks.length} kontroller ·{" "}
                      {s.data.documents.length} filer ·{" "}
                      {s.data.protocols.length} protokollutgaver
                    </p>
                  </li>
                ))}
              </ul>
            </details>
            {fileProblem && <p role="alert">{fileProblem}</p>}
            <div className="bolig-quality-actions">
              <button
                type="button"
                disabled={busy || !verified || !!fileProblem}
                onClick={() => download("pdf")}
              >
                Last ned samlet PDF
              </button>
              <button
                type="button"
                className="bolig-primary"
                disabled={busy || !verified || !!fileProblem}
                onClick={() => download("zip")}
              >
                Last ned ZIP med originalfiler
              </button>
            </div>
          </>
        )}
        {progress && <p role="status">{progress}</p>}
        {busy && (
          <button
            type="button"
            onClick={() => {
              ++epoch.current;
              setBusy(false);
              setProgress(
                "Nedlastingen er avbrutt. Ingen dokumentpakke er lastet ned.",
              );
            }}
          >
            Avbryt nedlasting
          </button>
        )}
        {data && error && <p role="alert">{error}</p>}
        <button type="button" disabled={busy} onClick={load}>
          Oppdater innhold
        </button>
      </div>
    </Dialog>
  );
}
