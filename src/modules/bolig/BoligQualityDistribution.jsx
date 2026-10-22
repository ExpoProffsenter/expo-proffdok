import React, { useEffect, useRef, useState } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
  clearBoligDraft,
} from "./boligClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
import { QUALITY_EVENT } from "./boligQualityClient.js";
const targetKey = (t) => `${t.scope_id}:${t.room_id || ""}`;
const sourceKey = (s) => `${s.kind}:${s.scope_id || ""}:${s.id}`;
export default function BoligQualityDistribution({
  context,
  root,
  onClose,
  onDistributed,
}) {
  const draftKey = boligDraftKey(context, root.id, "quality-distribution");
  const [selection, setSelection] = useState(() =>
    readBoligDraft(draftKey, { sources: [], targets: [], required: true }),
  );
  const [rawOptions, setOptions] = useState(null),
    [preview, setPreview] = useState(null),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [verified, setVerified] = useState(false),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [sourceSearch, setSourceSearch] = useState(""),
    [block, setBlock] = useState(""),
    [mode, setMode] = useState("units"),
    [limit, setLimit] = useState(30);
  const options =
    rawOptions?.context?.company_id === context.company_id &&
    rawOptions?.context?.user_id === context.user_id &&
    context.role === "manager"
      ? rawOptions
      : null;
  const epoch = useRef(0),
    alive = useRef(true),
    working = useRef(false);
  const valid = (ticket) => alive.current && epoch.current === ticket;
  const rpc = async (action, payload = {}) => {
    const pending = getAppSupabaseClient().rpc("bolig_quality_distribution", {
      p_company_id: context.company_id,
      p_root_id: root.id,
      p_action: action,
      p_payload: payload,
    });
    const { data, error } = await (typeof pending.retry === "function"
      ? pending.retry(false)
      : pending);
    if (error) throw Object.assign(Error(error.message), { code: error.code });
    if (
      data?.context?.company_id !== context.company_id ||
      data.context.user_id !== context.user_id ||
      data.context.role !== "manager" ||
      !data.context.enabled ||
      data.root_id !== root.id
    )
      throw Object.assign(Error("Tilgangen til fordelingen er endret."), {
        code: "42501",
      });
    return data;
  };
  const load = async () => {
    const t = ++epoch.current;
    setVerified(false);
    try {
      const d = await rpc("get");
      if (valid(t)) {
        setOptions(d);
        setVerified(true);
      }
    } catch (e) {
      if (valid(t)) {
        setError(e.message);
        if (e.code === "42501") setOptions(null);
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
  }, [context.company_id, context.user_id, context.role, root.id]);
  const change = (patch) => {
    setSelection((old) => {
      const next = { ...old, ...patch };
      if (!writeBoligDraft(draftKey, next))
        setError("Kladden kunne ikke sikres lokalt. Behold vinduet åpent.");
      return next;
    });
    setPreview(null);
    setError("");
  };
  const sourceOptions = options
    ? [
        ...options.templates.map((t) => ({
          kind: "template",
          id: t.id,
          title: t.title,
          detail: `Sjekklistesentral · v${t.number}`,
        })),
        ...options.project_lists.map((t) => ({
          kind: "project",
          id: t.id,
          scope_id: t.scope_id,
          title: t.title,
          detail: `Prosjektliste · ${t.scope_title}`,
        })),
      ]
    : [];
  const chosenSources = sourceOptions.filter((s) =>
    selection.sources.includes(sourceKey(s)),
  );
  const chosenTargets = (options?.targets || []).filter((t) =>
    selection.targets.includes(targetKey(t)),
  );
  const missing =
    selection.sources.length !== chosenSources.length ||
    selection.targets.length !== chosenTargets.length;
  const payload = () => ({
    sources: chosenSources.map(({ kind, id, scope_id }) => ({
      kind,
      id,
      ...(scope_id ? { scope_id } : {}),
    })),
    targets: chosenTargets.map(({ scope_id, room_id }) => ({
      scope_id,
      room_id,
    })),
    required: selection.required,
  });
  const run = async (action) => {
    if (!verified || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    const t = epoch.current;
    try {
      const d = await rpc(
        action,
        action === "preview"
          ? payload()
          : {
              ...payload(),
              basis: preview.basis,
              request_id: preview.request_id,
            },
      );
      if (!valid(t)) return;
      if (action === "preview")
        setPreview({ ...d, request_id: crypto.randomUUID() });
      else {
        setResult(d);
        clearBoligDraft(draftKey);
        window.dispatchEvent(
          new CustomEvent(QUALITY_EVENT, { detail: { rootId: root.id } }),
        );
        onDistributed?.();
      }
    } catch (e) {
      if (valid(t)) {
        setError(e.message);
        if (e.code === "42501") {
          setVerified(false);
          setOptions(null);
        }
        if (e.code === "PT409") setPreview(null);
      }
    } finally {
      working.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const targets = (options?.targets || []).filter(
    (t) =>
      (mode === "rooms" ? Boolean(t.room_id) : !t.room_id) &&
      (!block || t.block_id === block) &&
      `${t.title} ${t.room || ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  const blocks = [
    ...new Map(
      (options?.targets || []).map((t) => [t.block_id, t.block]),
    ).entries(),
  ];
  return (
    <Dialog
      className="bolig-quality-dialog bolig-distribution-dialog"
      title="Fordel sjekklister"
      busy={busy}
      onClose={onClose}
    >
      <div className="bolig-quality bolig-distribution">
        {result ? (
          <div className="bolig-quality-notice">
            <h3>Sjekklistene er fordelt</h3>
            <p>
              {result.added} nye kontroller opprettet. {result.skipped}{" "}
              eksisterende kontroller beholdt. Svar og historikk er uendret.
            </p>
            <button type="button" onClick={onClose}>
              Tilbake til dokumentasjonen
            </button>
          </div>
        ) : !options ? (
          <>
            <p role="status">
              {error || "Henter sjekklistesentral og prosjektets boliger …"}
            </p>
            <button type="button" onClick={load}>
              Hent fordeling
            </button>
          </>
        ) : (
          <>
            <p>
              Velg firmamaler eller egne prosjektlister. Hver bolig eller hvert
              rom får en egen kontroll med tomme svar. Eksisterende kontroller
              hoppes over.
            </p>
            {missing && (
              <p role="alert">
                Et tidligere valg er ikke lenger tilgjengelig. Se over
                sjekklister og mål på nytt.
              </p>
            )}
            <details open className="bolig-distribution-section">
              <summary>
                1. Velg sjekklister · {chosenSources.length} valgt
              </summary>
              <label>
                Søk etter sjekkliste
                <input
                  type="search"
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                />
              </label>
              <div className="bolig-distribution-options">
                {sourceOptions
                  .filter((s) =>
                    `${s.title} ${s.detail}`
                      .toLowerCase()
                      .includes(sourceSearch.toLowerCase()),
                  )
                  .map((s) => (
                    <label key={sourceKey(s)}>
                      <input
                        type="checkbox"
                        checked={selection.sources.includes(sourceKey(s))}
                        disabled={busy}
                        onChange={(e) =>
                          change({
                            sources: e.target.checked
                              ? [...selection.sources, sourceKey(s)]
                              : selection.sources.filter(
                                  (k) => k !== sourceKey(s),
                                ),
                          })
                        }
                      />
                      <span>
                        <strong>{s.title}</strong>
                        <small>{s.detail}</small>
                      </span>
                    </label>
                  ))}
              </div>
              {!sourceOptions.length && (
                <p>
                  Opprett en prosjektliste under «Ny sjekkliste», eller publiser
                  en firmamal i sjekklistesentralen.
                </p>
              )}
            </details>
            <details open className="bolig-distribution-section">
              <summary>
                2. Velg boliger eller rom · {chosenTargets.length} valgt
              </summary>
              <div className="bolig-distribution-filters">
                <label>
                  Fordel til
                  <select
                    aria-label="Fordel til"
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      setLimit(30);
                    }}
                  >
                    <option value="units">Hele boliger</option>
                    <option value="rooms">Enkeltrom</option>
                  </select>
                </label>
                <label>
                  Bygg
                  <select
                    value={block}
                    onChange={(e) => {
                      setBlock(e.target.value);
                      setLimit(30);
                    }}
                  >
                    <option value="">Alle bygg</option>
                    {blocks.map(([id, title]) => (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Søk etter bolig eller rom
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setLimit(30);
                    }}
                  />
                </label>
              </div>
              <div className="bolig-quality-actions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    change({
                      targets: [
                        ...new Set([
                          ...selection.targets,
                          ...targets.map(targetKey),
                        ]),
                      ],
                    })
                  }
                >
                  Velg alle {targets.length} i utvalget
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    change({
                      targets: selection.targets.filter(
                        (k) => !targets.some((t) => targetKey(t) === k),
                      ),
                    })
                  }
                >
                  Fjern utvalget
                </button>
              </div>
              <div className="bolig-distribution-options">
                {targets.slice(0, limit).map((t) => (
                  <label key={targetKey(t)}>
                    <input
                      type="checkbox"
                      checked={selection.targets.includes(targetKey(t))}
                      disabled={busy}
                      onChange={(e) =>
                        change({
                          targets: e.target.checked
                            ? [...selection.targets, targetKey(t)]
                            : selection.targets.filter(
                                (k) => k !== targetKey(t),
                              ),
                        })
                      }
                    />
                    <span>
                      <strong>
                        {t.title}
                        {t.room ? ` · ${t.room}` : ""}
                      </strong>
                      <small>{t.block}</small>
                    </span>
                  </label>
                ))}
              </div>
              {targets.length > limit && (
                <button type="button" onClick={() => setLimit((n) => n + 30)}>
                  Vis flere mål
                </button>
              )}
              {!targets.length && (
                <p>
                  Ingen mål i dette utvalget. Rom må legges til før du kan
                  fordele til rom.
                </p>
              )}
            </details>
            <label className="bolig-quality-choice">
              <input
                type="checkbox"
                checked={selection.required}
                disabled={busy}
                onChange={(e) => change({ required: e.target.checked })}
              />
              Nye kontroller er påkrevde ved sluttgodkjenning
            </label>
            {!preview ? (
              <button
                type="button"
                className="bolig-primary"
                disabled={
                  busy ||
                  !verified ||
                  missing ||
                  !chosenSources.length ||
                  !chosenTargets.length
                }
                onClick={() => run("preview")}
              >
                {busy ? "Kontrollerer …" : "Forhåndsvis fordeling"}
              </button>
            ) : (
              <section
                className="bolig-quality-notice"
                aria-label="Forhåndsvis fordeling"
              >
                <h3>Se over før du fordeler</h3>
                <p>
                  <strong>{preview.added} nye kontroller</strong> på{" "}
                  {chosenTargets.length} boliger/rom. {preview.skipped} finnes
                  allerede og beholdes.
                </p>
                <p>
                  {selection.required
                    ? "Nye kontroller blir påkrevde."
                    : "Nye kontroller blir valgfrie og gir påminnelser."}
                </p>
                <details>
                  <summary>Vis hva som opprettes og beholdes</summary>
                  <ul>
                    {preview.plan.slice(0, 100).map((p, i) => {
                      const t = chosenTargets.find(
                        (t) =>
                          t.scope_id === p.scope_id &&
                          (t.room_id || "") === (p.room_id || ""),
                      );
                      return (
                        <li key={i}>
                          {t?.title}
                          {t?.room ? ` · ${t.room}` : ""}: {p.title} –{" "}
                          {p.skip ? "beholdes" : "ny kontroll"}
                        </li>
                      );
                    })}
                  </ul>
                  {preview.plan.length > 100 && (
                    <p>
                      Viser de første 100 av {preview.plan.length} kontroller.
                    </p>
                  )}
                </details>
                <button
                  type="button"
                  className="bolig-primary"
                  disabled={busy || !verified}
                  onClick={() => run("apply")}
                >
                  {busy ? "Fordeler …" : "Bekreft og fordel"}
                </button>
              </section>
            )}
          </>
        )}
        {options && error && <p role="alert">{error}</p>}
      </div>
    </Dialog>
  );
}
