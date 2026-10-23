import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, History, Plus } from "lucide-react";
import useBoligVisuals from "./useBoligVisuals.js";
import BoligVisualSurface from "./BoligVisualSurface.jsx";
import BoligVisualEditor from "./BoligVisualEditor.jsx";
import BoligEditorDialog from "./BoligEditorDialog.jsx";
import { visualRpc } from "./boligVisuals.js";
import { boligDraftKey, readBoligDraft } from "./boligClient.js";
import { useBoligUiState } from "./boligUiState.js";
import "./boligVisuals.css";

export default function BoligVisualWorkspace(props) {
  const { context, root, scope } = props;
  return (
    <VisualWorkspace
      key={`${context.user_id}/${context.company_id}/${root.id}/${scope}/${context.role}`}
      {...props}
    />
  );
}
function VisualWorkspace({
  context,
  root,
  scope,
  kind = "facade",
  selected,
  onSelect,
  statusFor,
  extraFor,
  children,
  refreshKey,
}) {
  const visual = useBoligVisuals(context, root, scope, refreshKey);
  const [editor, setEditor] = useState(null),
    [notice, setNotice] = useState(""),
    [history, setHistory] = useState(null),
    [historyError, setHistoryError] = useState("");
  const [sheetId, setSheetId] = useBoligUiState(
    context,
    `visual-sheet:${root.id}:${scope}`,
    "",
  );
  const generation = useRef(0),
    current = useRef(visual.identity);
  current.current = visual.identity;
  useEffect(
    () => () => {
      ++generation.current;
      current.current = "";
    },
    [],
  );
  const data = visual.data,
    sheets = data?.sheets || [],
    active = sheets.filter((s) => !s.archived);
  const sheet =
    kind === "facade"
      ? active[0]
      : active.find((s) => s.id === sheetId) || active[0];
  const canEdit =
    context.enabled &&
    context.role === "manager" &&
    data?.context.role === "manager" &&
    !root.archived &&
    !data.root_archived;
  const start = (entry = null, seed = null) => {
    const cached = readBoligDraft(
      boligDraftKey(context, root.id, `visual-${scope}`),
      null,
    );
    setNotice(
      cached
        ? "Du fortsetter det lagrede bildeutkastet. Fullfør eller forkast dette før du starter et annet bilde."
        : "",
    );
    setEditor({
      sheet: cached
        ? sheets.find((s) => s.id === cached.sheet_id) || null
        : entry,
      seed: cached ? null : seed,
      data,
    });
    setHistory(null);
  };
  const showHistory = async (entry) => {
    const ticket = ++generation.current,
      identity = visual.identity;
    setHistoryError("");
    setHistory({ sheet: entry, loading: true, versions: [] });
    try {
      const next = await visualRpc(context, root.id, scope, "history", null, {
        sheet_id: entry.id,
      });
      if (ticket === generation.current && current.current === identity)
        setHistory({
          sheet: next.sheets.find((s) => s.id === entry.id),
          versions: next.history || [],
        });
    } catch (e) {
      if (ticket === generation.current && current.current === identity)
        setHistoryError(e.message);
    }
  };
  const closeHistory = () => {
    ++generation.current;
    setHistory(null);
  };
  const display = (
    <>
      {visual.error && (
        <p role="alert">
          {visual.error}{" "}
          <button type="button" onClick={visual.load}>
            Hent siste bildegrunnlag
          </button>
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <div className="bolig-visual-toolbar">
        {kind === "plan" && active.length > 0 && (
          <label>
            Vis plantegning
            <select
              value={sheet?.id || ""}
              onChange={(e) => setSheetId(e.target.value)}
            >
              {active.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {canEdit && (
          <>
            <button
              type="button"
              className="bolig-edit-action"
              onClick={() => start(kind === "facade" ? sheets[0] : sheet)}
            >
              <ImagePlus size={17} />
              {kind === "facade"
                ? "Fasadebilde"
                : sheet
                  ? "Rediger plantegning"
                  : "Legg til plantegning"}
            </button>
            {kind === "plan" && sheet && (
              <button type="button" onClick={() => start()}>
                <Plus size={15} />
                Ny plantegning
              </button>
            )}
          </>
        )}
        {sheet && (
          <button type="button" onClick={() => showHistory(sheet)}>
            <History size={15} />
            Bildehistorikk
          </button>
        )}
      </div>
      {sheet && data ? (
        <>
          <BoligVisualSurface
            key={sheet.id}
            image={sheet.current}
            targets={data.targets}
            selected={selected}
            onSelect={onSelect || (() => {})}
            statusFor={statusFor}
            extraFor={extraFor}
          />
          <small className="bolig-visual-version">
            {sheet.title} · versjon {sheet.revision} ·{" "}
            {new Date(sheet.created_at).toLocaleDateString("nb-NO")}
          </small>
          {data.targets.some(
            (t) => !sheet.current.markers.some((m) => m.id === t.id),
          ) && (
            <details className="bolig-visual-unplaced">
              <summary>
                Boliger/rom uten felt i dette bildet (
                {
                  data.targets.filter(
                    (t) => !sheet.current.markers.some((m) => m.id === t.id),
                  ).length
                }
                )
              </summary>
              <div>
                {data.targets
                  .filter(
                    (t) => !sheet.current.markers.some((m) => m.id === t.id),
                  )
                  .map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => onSelect?.(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>
            </details>
          )}
        </>
      ) : (
        children ||
        (kind === "plan" ? (
          <p>
            Legg til en tegning og plasser romfeltene. Romlisten fungerer også
            uten tegning.
          </p>
        ) : (
          <p>Bruk prosjektets eget bilde og juster boligfeltene.</p>
        ))
      )}
      {sheets.some((s) => s.archived) && (
        <details className="bolig-visual-unplaced">
          <summary>
            Skjulte bilder ({sheets.filter((s) => s.archived).length})
          </summary>
          {sheets
            .filter((s) => s.archived)
            .map((s) => (
              <div key={s.id}>
                <span>{s.title}</span>
                <button type="button" onClick={() => showHistory(s)}>
                  Se bildehistorikk
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => start(s, { ...s.current, archived: false })}
                  >
                    Gjenopprett bilde
                  </button>
                )}
              </div>
            ))}
        </details>
      )}
    </>
  );
  return (
    <section
      className={`bolig-visual-workspace bolig-visual-${kind}`}
      aria-label={
        kind === "facade" ? "Prosjektets fasadebilde" : "Boligens plantegninger"
      }
    >
      {kind === "plan" ? (
        <details>
          <summary>
            Plantegninger <span>{active.length || "Valgfritt"}</span>
          </summary>
          {display}
        </details>
      ) : (
        display
      )}
      {editor && (
        <BoligVisualEditor
          context={context}
          root={root}
          scope={scope}
          data={data}
          sheet={editor.sheet}
          seed={editor.seed}
          kind={kind}
          publish={visual.publish}
          reload={visual.load}
          onClose={() => setEditor(null)}
          onSaved={(revision) => {
            setEditor(null);
            setNotice(`Bildet og feltene er lagret. Versjon ${revision}.`);
          }}
        />
      )}
      {history && (
        <BoligEditorDialog
          title="Bildehistorikk"
          className="bolig-visual-history"
          onClose={closeHistory}
        >
          {!data ? (
            <p role="alert">
              Bekreft bildetilgangen før du åpner historikken.{" "}
              <button type="button" onClick={visual.load}>
                Kontroller tilgang
              </button>
            </p>
          ) : (
            <>
              <p>
                Tidligere bilder og plasseringer beholdes. Gjenoppretting åpner
                en kladd som må forhåndsvises før lagring.
              </p>
              {history.loading && <p role="status">Henter bildehistorikk …</p>}
              {historyError && <p role="alert">{historyError}</p>}
              {history.versions.map((v) => (
                <details
                  key={v.id}
                  onToggle={(e) => {
                    if (e.currentTarget.open)
                      setHistory((h) => (h ? { ...h, openId: v.id } : h));
                  }}
                >
                  <summary>
                    Versjon {v.revision} ·{" "}
                    {new Date(v.created_at).toLocaleString("nb-NO")} ·{" "}
                    {v.snapshot.archived ? "Skjult" : v.snapshot.title}
                  </summary>
                  {history.openId === v.id && (
                    <BoligVisualSurface
                      image={v.snapshot}
                      targets={data.targets}
                      onSelect={() => {}}
                    />
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => start(history.sheet, v.snapshot)}
                    >
                      Bruk som nytt bildeutkast
                    </button>
                  )}
                </details>
              ))}
            </>
          )}
        </BoligEditorDialog>
      )}
    </section>
  );
}

export function BoligVisualSetup({ context, record }) {
  const [kind, setKind] = useState("facade"),
    [choice, setChoice] = useState("");
  const blocks = record.blocks.filter((b) => !b.archived),
    entrances = record.entrances.filter(
      (e) => !e.archived && blocks.some((b) => b.id === e.block_id),
    );
  const targets =
    kind === "facade"
      ? blocks.map((b) => ({ id: b.id, label: b.name }))
      : record.units
          .filter(
            (u) => !u.archived && entrances.some((e) => e.id === u.entrance_id),
          )
          .map((u) => ({
            id: u.id,
            label: `${u.number} · ${entrances.find((e) => e.id === u.entrance_id)?.address || "Adresse legges til senere"}`,
          }));
  const selected = targets.find((t) => t.id === choice) || targets[0];
  return (
    <section className="bolig-visual-setup">
      <h3>Bilder og plantegninger</h3>
      <p>
        Velg et bygg for fasaden eller en bolig for plantegninger. Plasseringene
        er knyttet til de eksisterende boligene og rommene.
      </p>
      <div className="bolig-visual-setup-select">
        <label>
          Bildetype
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setChoice("");
            }}
          >
            <option value="facade">Fasade per bygg</option>
            <option value="plan">Plantegninger per bolig</option>
          </select>
        </label>
        <label>
          {kind === "facade" ? "Velg bygg" : "Velg bolig"}
          <select
            value={selected?.id || ""}
            onChange={(e) => setChoice(e.target.value)}
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selected && (
        <BoligVisualWorkspace
          context={context}
          root={record.root}
          scope={selected.id}
          kind={kind}
        />
      )}
    </section>
  );
}
