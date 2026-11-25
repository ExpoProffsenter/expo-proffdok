import React, { useEffect, useRef, useState } from "react";
import BoligEditorDialog from "./BoligEditorDialog.jsx";
import BoligVisualSurface from "./BoligVisualSurface.jsx";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import {
  clampMarker,
  inspectVisualImage,
  suggestVisualMarkers,
  uploadVisualImage,
  visualBlob,
  visualPayload,
} from "./boligVisuals.js";

export default function BoligVisualEditor({
  context,
  root,
  scope,
  data,
  sheet,
  seed,
  publish,
  reload,
  onClose,
  onSaved,
  kind,
}) {
  const key = boligDraftKey(context, root.id, `visual-${scope}`);
  const [draft, setDraft] = useState(() => {
    const cached = readBoligDraft(key, null),
      image = seed || sheet?.current || {};
    return (
      cached || {
        sheet_id: sheet?.id || crypto.randomUUID(),
        expected: sheet?.revision || 0,
        basis: data.basis,
        title:
          image.title ||
          sheet?.title ||
          (kind === "facade" ? "Fasade" : "Plantegning"),
        path: image.path,
        width: image.width,
        height: image.height,
        archived: seed ? false : !!sheet?.archived,
        markers: structuredClone(image.markers || []),
      }
    );
  });
  const latest = useRef(draft),
    alive = useRef(true),
    operating = useRef(false),
    input = useRef(null);
  const [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [review, setReview] = useState(false),
    [conflict, setConflict] = useState(false);
  latest.current = draft;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const secure = (value) => {
    if (!writeBoligDraft(key, value))
      throw Error("Kladden kunne ikke sikres lokalt. Behold siden åpen.");
    latest.current = value;
    setDraft(value);
    return value;
  };
  const change = (fields) => {
    try {
      if (latest.current.pending || operating.current) return;
      secure({ ...latest.current, ...fields });
      setReview(false);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const upload = async (files) => {
    if (!files?.length || operating.current || latest.current.pending) return;
    operating.current = true;
    setBusy(true);
    setError("");
    try {
      if (files.length !== 1) throw Error("Velg ett bilde om gangen.");
      const file = files[0],
        info = await inspectVisualImage(file),
        id = crypto.randomUUID(),
        blobKey = `${key}:${id}`;
      await visualBlob(blobKey, file);
      if (!alive.current) return;
      const next = {
        ...latest.current,
        ...info,
        path: `${context.company_id}/${root.id}/${scope}/${id}.${info.extension}`,
        blobKey,
        uploaded: false,
        markers: latest.current.markers.length
          ? latest.current.markers
          : suggestVisualMarkers(data?.targets || [], kind),
        archived: false,
      };
      secure(next);
      setReview(false);
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      operating.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const move = (marker) =>
    change({
      markers: latest.current.markers.map((m) =>
        m.id === marker.id ? clampMarker(marker) : m,
      ),
    });
  const all = (dx = 0, dy = 0, scale = 1) => {
    const markers = latest.current.markers;
    const cx = markers.length
      ? (Math.min(...markers.map((m) => m.x)) +
          Math.max(...markers.map((m) => m.x + m.w))) /
        2
      : 0.5;
    const cy = markers.length
      ? (Math.min(...markers.map((m) => m.y)) +
          Math.max(...markers.map((m) => m.y + m.h))) /
        2
      : 0.5;
    change({
      markers: markers.map((m) =>
        clampMarker({
          ...m,
          x: cx + (m.x - cx) * scale + dx,
          y: cy + (m.y - cy) * scale + dy,
          w: m.w * scale,
          h: m.h * scale,
        }),
      ),
    });
  };
  const save = async () => {
    if (
      operating.current ||
      !data ||
      data.context.role !== "manager" ||
      data.root_archived
    )
      return;
    operating.current = true;
    setBusy(true);
    setError("");
    try {
      let current = latest.current;
      if (!current.pending) {
        if (!current.path || !current.title.trim() || !review)
          throw Error(
            "Last opp et bilde og gå gjennom forhåndsvisningen før du lagrer.",
          );
        if (current.blobKey && !current.uploaded) {
          const blob = await visualBlob(current.blobKey);
          if (!blob) throw Error("Bildefilen mangler. Velg samme fil igjen.");
          await uploadVisualImage(current.path, blob);
          if (!alive.current) return;
          current = secure({ ...latest.current, uploaded: true });
        }
        const request_id = crypto.randomUUID();
        current = secure({
          ...current,
          request_id,
          pending: {
            revision: current.expected,
            payload: visualPayload({ ...current, request_id }),
          },
        });
      }
      const result = await publish(
        current.pending.revision,
        current.pending.payload,
      );
      if (!result || !alive.current) return;
      if (result.receipt_id !== current.pending.payload.request_id)
        throw Error(
          "Lagringskvitteringen kunne ikke bekreftes. Prøv samme lagring igjen.",
        );
      clearBoligDraft(key);
      if (current.blobKey) visualBlob(current.blobKey, null).catch(() => {});
      onSaved(result.receipt_revision);
    } catch (e) {
      if (alive.current) {
        setError(e.message);
        if (e.code === "PT409") setConflict(true);
      }
    } finally {
      operating.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const rebase = async () => {
    setBusy(true);
    setError("");
    try {
      const fresh = await reload();
      if (!fresh || !alive.current) return;
      const current = fresh.sheets.find(
          (s) => s.id === latest.current.sheet_id,
        ),
        allowed = new Set(fresh.targets.map((t) => t.id));
      secure({
        ...latest.current,
        expected: current?.revision || 0,
        basis: fresh.basis,
        markers: latest.current.markers.filter((m) => allowed.has(m.id)),
        pending: null,
      });
      setConflict(false);
      setReview(false);
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const target = data?.targets?.find((t) => t.id === selected),
    marker = draft.markers.find((m) => m.id === selected);
  const allowed = new Set((data?.targets || []).map((t) => t.id)),
    unavailable = draft.markers.filter((m) => !allowed.has(m.id));
  const changedBasis =
    !!data &&
    (draft.basis !== data.basis ||
      (data.sheets.find((s) => s.id === draft.sheet_id)?.revision || 0) !==
        draft.expected);
  const editable =
    !!data && data.context.role === "manager" && !data.root_archived;
  const frozen = busy || !!draft.pending;
  return (
    <BoligEditorDialog
      title={kind === "facade" ? "Tilpass fasadebilde" : "Tilpass plantegning"}
      className="bolig-visual-editor"
      busy={busy}
      onClose={onClose}
    >
      <p>
        Last opp bildet, juster feltene og kontroller forhåndsvisningen.
        Endringen gjelder bare dette bildet.
      </p>
      {!editable && (
        <p role="alert">
          Bildetilgangen må bekreftes før du fortsetter. Kladden er beholdt.{" "}
          <button type="button" onClick={reload}>
            Kontroller tilgang
          </button>
        </p>
      )}
      <input
        ref={input}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        aria-label="Velg prosjektbilde"
        disabled={frozen}
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <fieldset
        disabled={frozen || !editable}
        style={{ visibility: editable ? undefined : "hidden" }}
      >
        <div className="bolig-visual-editor-top">
          <label>
            Navn på bildet
            <input
              maxLength={100}
              value={draft.title}
              onChange={(e) => change({ title: e.target.value })}
            />
          </label>
          <button type="button" onClick={() => input.current?.click()}>
            {draft.path ? "Bytt bilde" : "Last opp bilde"}
          </button>
          <small>
            JPG, PNG eller WebP, inntil 12 MB. Eksporter PDF-tegningen som bilde
            først.
          </small>
        </div>
        {draft.path && (
          <>
            <div className="bolig-visual-edit-layout">
              <BoligVisualSurface
                image={draft}
                targets={data?.targets || []}
                selected={selected}
                onSelect={setSelected}
                onMove={move}
                onPlace={move}
                editable={!review}
              />
              {!review && (
                <aside className="bolig-visual-controls">
                  <label>
                    Velg bolig eller rom
                    <select
                      aria-label="Velg bolig eller rom"
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      <option value="">Velg et felt</option>
                      {data?.targets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                          {draft.markers.some((m) => m.id === t.id)
                            ? " · plassert"
                            : " · ikke plassert"}
                        </option>
                      ))}
                    </select>
                  </label>
                  {target && !marker && (
                    <button
                      type="button"
                      onClick={() =>
                        change({
                          markers: [
                            ...draft.markers,
                            clampMarker({
                              id: selected,
                              x: 0.45,
                              y: 0.45,
                              w: 0.1,
                              h: 0.08,
                            }),
                          ],
                        })
                      }
                    >
                      Plasser valgt felt
                    </button>
                  )}
                  {marker && (
                    <>
                      <strong>
                        {target?.label || "Feltet er ikke tilgjengelig"}
                      </strong>
                      <div className="bolig-visual-coordinates">
                        {[
                          ["x", "Fra venstre"],
                          ["y", "Fra toppen"],
                          ["w", "Bredde"],
                          ["h", "Høyde"],
                        ].map(([key, label]) => (
                          <label key={key}>
                            {label} (%)
                            <input
                              type="number"
                              min={key === "w" || key === "h" ? 1.2 : 0}
                              max={100}
                              step={0.2}
                              value={Math.round(marker[key] * 1000) / 10}
                              onChange={(e) =>
                                move({
                                  ...marker,
                                  [key]: Number(e.target.value) / 100,
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          change({
                            markers: draft.markers.filter(
                              (m) => m.id !== selected,
                            ),
                          })
                        }
                      >
                        Ta feltet ut av bildet
                      </button>
                    </>
                  )}
                  <details>
                    <summary>Flytt og skaler alle felt</summary>
                    <div className="bolig-visual-group-actions">
                      {[
                        ["Venstre", -0.02, 0],
                        ["Høyre", 0.02, 0],
                        ["Opp", 0, -0.02],
                        ["Ned", 0, 0.02],
                      ].map(([name, x, y]) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => all(x, y)}
                        >
                          {name}
                        </button>
                      ))}
                      <button type="button" onClick={() => all(0, 0, 0.95)}>
                        Mindre oppsett
                      </button>
                      <button type="button" onClick={() => all(0, 0, 1.05)}>
                        Større oppsett
                      </button>
                    </div>
                  </details>
                  <details>
                    <summary>Nytt forslag til plassering</summary>
                    <p>
                      Dette erstatter plasseringen i bildeutkastet. Boligene og
                      rommene beholdes.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        change({
                          markers: suggestVisualMarkers(data.targets, kind),
                        })
                      }
                    >
                      Bruk nytt plasseringsforslag
                    </button>
                  </details>
                </aside>
              )}
            </div>
            <p>
              {draft.markers.length} felt plassert ·{" "}
              {(data?.targets.length || 0) -
                draft.markers.filter((m) => allowed.has(m.id)).length}{" "}
              uten felt i dette bildet. Alle finnes fortsatt i bolig-/romlisten.
            </p>
            {sheet && (
              <label className="bolig-visual-check">
                <input
                  type="checkbox"
                  checked={!!draft.archived}
                  onChange={(e) => change({ archived: e.target.checked })}
                />
                {kind === "facade"
                  ? "Bruk vanlig illustrasjon i stedet"
                  : "Skjul denne plantegningen"}
              </label>
            )}
            {review ? (
              <p className="bolig-visual-review" role="status">
                Forhåndsvisning:{" "}
                {draft.archived
                  ? "Bildet skjules. Tidligere versjoner beholdes."
                  : "Dette bildet og disse feltene blir synlige når du lagrer."}
              </p>
            ) : (
              <button type="button" onClick={() => setReview(true)}>
                Forhåndsvis endringer
              </button>
            )}
          </>
        )}
      </fieldset>
      {(changedBasis || conflict || unavailable.length > 0) && (
        <div role="alert" className="bolig-visual-conflict">
          <p>
            Grunnlaget er endret.{" "}
            {unavailable.length > 0
              ? `${unavailable.length} felt tilhører ikke lenger aktive boliger/rom her.`
              : "Se gjennom siste versjon før du lagrer videre."}{" "}
            Kladden er beholdt.
          </p>
          <button type="button" disabled={busy} onClick={rebase}>
            Bruk siste grunnlag og behold tilgjengelige felt
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {draft.pending && !conflict && !busy && (
        <p role="status">
          Denne lagringen er ikke bekreftet. Prøv samme lagring igjen før du
          endrer utkastet.
        </p>
      )}
      <footer className="bolig-visual-footer">
        <button type="button" disabled={busy} onClick={onClose}>
          Lukk og behold kladd
        </button>
        {!draft.pending && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              clearBoligDraft(key);
              if (draft.blobKey)
                visualBlob(draft.blobKey, null).catch(() => {});
              onClose();
            }}
          >
            Forkast bildeutkast
          </button>
        )}
        <button
          type="button"
          className="bolig-primary-action"
          disabled={
            busy ||
            !editable ||
            conflict ||
            (!draft.pending &&
              (!review || changedBasis || !!unavailable.length || !draft.path))
          }
          onClick={save}
        >
          {busy
            ? "Lagrer …"
            : draft.pending
              ? "Prøv samme lagring igjen"
              : "Lagre bilde og felt"}
        </button>
      </footer>
    </BoligEditorDialog>
  );
}
