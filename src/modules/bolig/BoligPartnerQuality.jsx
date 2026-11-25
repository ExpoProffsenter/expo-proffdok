import BoligChecklistStatusChoices from "./BoligChecklistStatusChoices.jsx";
import React, { useEffect, useState, useRef } from "react";
import Dialog from "./BoligEditorDialog.jsx";
import ChecklistGroups, { partnerChecklistKey } from "./BoligPartnerChecklistGroups.jsx";
import ChecklistFields from "../checklist/ChecklistFields.jsx";
import { invalidateFieldConfirmations } from "../checklist/checklistFields.mjs";
import {
  partnerQualityRpc,
  partnerFile,
  partnerUploadDraft,
} from "./boligPartnerQualityClient.js";
import {
  readPartnerDraft,
  storePartnerDraft,
  partnerPortalRpc,
} from "./boligPartnerClient.js";
export default function PartnerQuality({
  token,
  data: liveData,
  run,
  busy,
  load,
  query = "",
}) {
  // Keep the file input mounted while its native picker owns focus. Previous
  // content stays hidden and every server action still requires live authority.
  const lastData = useRef(null);
  const checklistList = useRef(null);
  const [savedCheck, setSavedCheck] = useState(null);
  if (liveData) lastData.current = liveData;
  const data = liveData || lastData.current;
  const key = `expo.bolig-partner-quality.v1:${token}`;
  const [draft, setDraft] = useState(() => readPartnerDraft(key, null)),
    [upload, setUpload] = useState(null),
    [title, setTitle] = useState(""),
    [scope, setScope] = useState(data?.quality?.scopes[0]?.id || ""),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [working, setWorking] = useState(false),
    [notice, setNotice] = useState("");
  const quality = data?.quality || { scopes: [], checks: [], documents: [] },
    write = data?.kind === "ue" && data.features.includes("quality_write");
  useEffect(() => {
    let current = true;
    partnerUploadDraft(key)
      .then((v) => {
        if (current && v) {
          setUpload(v);
          setTitle(v.title);
          setScope(v.scope_id);
        }
      })
      .catch((e) => {
        if (current) setError(e.message);
      });
    return () => {
      current = false;
    };
  }, [key]);
  const saveDraft = (next) => {
    try {
      storePartnerDraft(key, next);
      setDraft(next);
      setError("");
      return true;
    } catch {
      setError("Kladden kunne ikke sikres. Behold vinduet åpent.");
      return false;
    }
  };
  const activeScope = scope || quality.scopes[0]?.id || "";
  const [expanded, setExpanded] = useState({
    custom: false,
    sources: false,
    upload: false,
  });
  const toggle = (name, value) =>
    setExpanded((previous) =>
      previous[name] === value ? previous : { ...previous, [name]: value },
    );
  const [custom, setCustom] = useState(() =>
    readPartnerDraft(key + ":new", { title: "", points: "" }),
  );
  const updateCustom = (next) => {
    try {
      storePartnerDraft(key + ":new", next);
      setCustom(next);
    } catch {
      setError("Kladden kunne ikke sikres.");
    }
  };
  const check = quality.checks.find(
    (x) => x.record.id === draft?.id && x.scope_id === draft?.scope_id,
  );
  useEffect(() => {
    if (!savedCheck || !liveData) return;
    const saved = quality.checks.find((item) => partnerChecklistKey(item) === savedCheck);
    if (!saved) return;
    const cards = [...(checklistList.current?.querySelectorAll("article[data-check-key]") || [])];
    const next = saved.record.status === "completed"
      ? cards.find((card) => !card.hidden)
      : cards.find((card) => card.dataset.checkKey === savedCheck && !card.hidden);
    const destination = next?.querySelector("button") || checklistList.current?.querySelector("button");
    destination?.focus({ preventScroll: true });
    destination?.scrollIntoView({ block: "nearest" });
    setSavedCheck(null);
  }, [savedCheck, liveData, quality.checks]);
  const command = (action, payload, onDone) =>
    run(
      () => partnerQualityRpc(token, action, payload),
      onDone,
      (e) => {
        setError(e.message);
        if (["PT409", "22023"].includes(e.code)) {
          const latest = readPartnerDraft(key, null);
          if (latest)
            saveDraft({
              ...latest,
              pending: null,
              conflict: e.code === "PT409" && action === "check_save",
            });
          load();
        }
      },
    );
  const start = (source) => {
    if (!liveData) return;
    if (draft) {
      setError("Fullfør eller forkast det lagrede sjekklisteutkastet først.");
      setOpen(true);
      return;
    }
    const payload = {
      id: crypto.randomUUID(),
      request_id: crypto.randomUUID(),
      scope_id: source?.scope_id || activeScope,
      ...(source
        ? { source_id: source.id, source_scope_id: source.scope_id }
        : {
            content: {
              title: custom.title,
              trade: "Felles – alle fag",
              instructions: "",
              points: custom.points
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean)
                .map((title) => ({
                  id: crypto.randomUUID(),
                  title,
                  allow_na: true,
                  fields: [],
                })),
            },
          }),
    };
    if (
      !saveDraft({
        action: "check_add",
        pending: payload,
        scope_id: payload.scope_id,
        id: payload.id,
      })
    )
      return;
    command("check_add", payload, () => {
      saveDraft({ id: payload.id, scope_id: payload.scope_id, answers: null });
      setOpen(true);
    });
  };
  const edit = (item) => {
    if (draft && draft.id !== item.record.id) {
      setError("Fullfør eller forkast det lagrede utkastet først.");
      return;
    }
    if (
      !draft &&
      !saveDraft({
        id: item.record.id,
        scope_id: item.scope_id,
        revision: item.revision,
        answers: item.record.answers,
        complete: false,
      })
    )
      return;
    setOpen(true);
  };
  const send = (e) => {
    e.preventDefault();
    if (!check || !write || working || !liveData) return;
    const p = draft.pending || {
      id: draft.id,
      scope_id: draft.scope_id,
      revision: draft.revision ?? check.revision,
      answers: draft.answers ?? check.record.answers,
      complete: !!draft.complete,
      request_id: crypto.randomUUID(),
    };
    if (!saveDraft({ ...draft, action: "check_save", pending: p })) return;
    command("check_save", p, () => {
      saveDraft(null);
      setOpen(false);
      setSavedCheck(`${p.scope_id}:${p.id}`);
      setNotice(
        p.complete
          ? "Sjekklisten er fullført og lagret hos prosjektet."
          : "Svarene er lagret hos prosjektet.",
      );
    });
  };
  const patch = (point, delta) => {
    const answers = draft.answers ?? check.record.answers;
    const next = {
      ...answers,
      [point.id]: { ...(answers[point.id] || {}), ...delta },
    };
    const cleaned = invalidateFieldConfirmations(
      check.record.definition.points.map((x) => x.id),
      Object.fromEntries(check.record.definition.points.map((x) => [x.id, x])),
      next,
      point.id,
      delta._keepConfirmation,
    );
    delete cleaned[point.id]._keepConfirmation;
    saveDraft({
      ...draft,
      revision: draft.revision ?? check.revision,
      answers: cleaned,
    });
  };
  const uploadFile = async (e) => {
    e.preventDefault();
    if (!upload || !write || working || !liveData) return;
    setWorking(true);
    setError("");
    try {
      const attempt = upload.started
        ? upload
        : { ...upload, title, scope_id: activeScope, started: true };
      await partnerUploadDraft(key, attempt);
      setUpload(attempt);
      await run(
        async () => {
          await partnerFile(token, "upload", attempt);
          return partnerQualityRpc(token, "document", {
            id: attempt.id,
            scope_id: attempt.scope_id,
            title: attempt.title,
            request_id: attempt.request_id,
          });
        },
        () => {
          partnerUploadDraft(key, null)
            .then(() => {
              setUpload(null);
              setTitle("");
              setNotice("Filen er lagret hos prosjektet.");
            })
            .catch((e) => setError(e.message));
        },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };
  const openFile = async (doc) => {
    setWorking(true);
    setError("");
    try {
      let blob;
      await run(
        async () => {
          blob = await partnerFile(token, "download", doc.id);
          return partnerPortalRpc(token);
        },
        () => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = doc.name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };
  if (!data || !data.features.includes("checklists")) return null;
  return (
    <section
      className="bolig-partner-quality"
      aria-label="UE-dokumentasjon"
      hidden={!liveData || !liveData.features.includes("checklists")}
    >
      <h2>Mine sjekklister og vedlegg</h2>
      <p>
        Egne utfyllinger, PDF-lister og bilder lagres i prosjektets vanlige
        dokumentasjon. Tidligere kontroller beholdes.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {draft && (
        <div className="bolig-partner-toolbar">
          <span>Du har et lagret sjekklisteutkast.</span>
          <button type="button" onClick={() => setOpen(true)}>
            Fortsett sjekklisteutkast
          </button>
        </div>
      )}
      {write && (
        <details
          open={expanded.custom}
          onToggle={(e) => toggle("custom", e.currentTarget.open)}
        >
          <summary>Lag egen sjekkliste</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(null);
            }}
          >
            <label>
              Plassering for sjekkliste
              <select
                value={activeScope}
                onChange={(e) => setScope(e.target.value)}
                disabled={busy || working}
              >
                {quality.scopes.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Navn på sjekklisten
              <input
                required
                maxLength={160}
                value={custom.title}
                onChange={(e) =>
                  updateCustom({ ...custom, title: e.target.value })
                }
              />
            </label>
            <label>
              Kontrollpunkter – ett per linje
              <textarea
                required
                maxLength={30000}
                value={custom.points}
                onChange={(e) =>
                  updateCustom({ ...custom, points: e.target.value })
                }
              />
            </label>
            <button type="submit" disabled={busy || working || !!draft}>
              Opprett egen sjekkliste
            </button>
          </form>
        </details>
      )}
      {write && (
        <details
          open={expanded.sources}
          onToggle={(e) => toggle("sources", e.currentTarget.open)}
        >
          <summary>Start egen utfylling fra prosjektets sjekklister</summary>
          {data.checklists
            .filter((x) => !quality.checks.some((y) => y.record.id === x.id))
            .map((x) => (
              <div
                key={`${x.scope_id}:${x.id}`}
                className="bolig-partner-toolbar"
              >
                <span>
                  {x.title} · {x.address} {x.number}
                </span>
                <button
                  type="button"
                  disabled={busy || working || !!draft}
                  onClick={() => start(x)}
                >
                  Start egen utfylling
                </button>
              </div>
            ))}
        </details>
      )}
      <ChecklistGroups
        title="Mine utfyllinger"
        listRef={checklistList}
        items={quality.checks.filter((item) =>
          `${item.record.definition.title} ${quality.scopes.find((scope) => scope.id === item.scope_id)?.title || ""}`
            .toLowerCase().includes(query.toLowerCase()),
        )}
        renderItem={(item) => <>
          <h3>{item.record.definition.title}</h3>
          <p>{quality.scopes.find((scope) => scope.id === item.scope_id)?.title}</p>
          <p>{item.record.definition.points.filter((point) => item.record.answers?.[point.id]?.status).length} av {item.record.definition.points.length} besvart</p>
          <button type="button" onClick={() => edit(item)} disabled={busy || working}>
            {item.record.status === "completed" || !write ? "Se utfylling" : "Fyll ut sjekkliste"}
          </button>
        </>}
      />
      {write && (
        <details
          open={expanded.upload}
          onToggle={(e) => toggle("upload", e.currentTarget.open)}
        >
          <summary>Last opp PDF, bilde eller annet vedlegg</summary>
          <form onSubmit={uploadFile}>
            <label>
              Plassering
              <select
                aria-label="Plassering"
                value={activeScope}
                disabled={!!upload || busy || working}
                onChange={(e) => setScope(e.target.value)}
              >
                {quality.scopes.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tittel på vedlegget
              <input
                aria-label="Tittel på vedlegget"
                readOnly={!!upload?.started}
                required
                maxLength={160}
                value={title}
                disabled={busy || working}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Velg PDF, bilde eller fil
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.txt,.csv"
                disabled={busy || working || !!upload}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setWorking(true);
                  try {
                    if (!f.size || f.size > 20 * 1024 * 1024)
                      throw Error("Velg en fil på inntil 20 MB.");
                    const next = {
                      file: f,
                      id: crypto.randomUUID(),
                      request_id: crypto.randomUUID(),
                      scope_id: activeScope,
                      title: title || f.name.slice(0, 160),
                    };
                    await partnerUploadDraft(key, next);
                    setUpload(next);
                    setTitle(next.title);
                    setError("");
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setWorking(false);
                  }
                }}
              />
            </label>
            <p>
              PDF, JPG, PNG, WebP, Word, Excel eller tekst. Inntil 20 MB per
              fil.
            </p>
            {upload && (
              <p>
                Filkladd sikret: {upload.file.name}. Ved avbrudd brukes samme
                fil og forsøk igjen.
              </p>
            )}
            <button type="submit" disabled={!upload || busy || working}>
              {busy || working ? "Laster opp …" : "Lagre vedlegg"}
            </button>
            {upload && !busy && !working && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await partnerUploadDraft(key, null);
                    setUpload(null);
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Forkast filkladd
              </button>
            )}
          </form>
        </details>
      )}
      {quality.documents.map((doc) => (
        <div className="bolig-partner-toolbar" key={doc.id}>
          <span>
            {doc.kind === "photo" ? "Bilde" : "Vedlegg"}: {doc.title} ·{" "}
            {quality.scopes.find((x) => x.id === doc.scope_id)?.title}
          </span>
          <button
            type="button"
            disabled={working || busy}
            onClick={() => openFile(doc)}
          >
            Last ned {doc.name}
          </button>
        </div>
      ))}
      {open && draft && liveData && (
        <Dialog
          className="bolig-partner-dialog"
          title="UE – sjekkliste"
          busy={busy || working}
          onClose={() => setOpen(false)}
        >
          {draft.action === "check_add" && draft.pending ? (
            <>
              <p>Opprettingen venter på kvittering.</p>
              <button
                type="button"
                disabled={busy || !write}
                onClick={() =>
                  command("check_add", draft.pending, () => {
                    saveDraft({
                      id: draft.id,
                      scope_id: draft.scope_id,
                      answers: null,
                    });
                    setOpen(true);
                  })
                }
              >
                Prøv samme oppretting igjen
              </button>
            </>
          ) : check ? (
            <form onSubmit={send}>
              <h3>{check.record.definition.title}</h3>
              <p>{check.record.definition.instructions}</p>
              <fieldset
                disabled={
                  busy ||
                  working ||
                  !!draft.pending ||
                  !write ||
                  check.record.status === "completed"
                }
              >
                {check.record.definition.points.map((p) => {
                  const a = (draft.answers ?? check.record.answers)[p.id] || {};
                  return (
                    <fieldset key={p.id}>
                      <legend>{p.title}</legend>
                      {p.guidance && <p>{p.guidance}</p>}
                      <div>
                        <span className="bolig-checklist-result-label">Resultat</span>
                        <BoligChecklistStatusChoices
                          label={`Resultat: ${p.title}`}
                          value={a.status || ""}
                          allowNa={p.allow_na !== false}
                          allowClosed={["Avvik", "Lukket avvik"].includes(check.record.answers[p.id]?.status)}
                          onChange={status => patch(p, { status })}
                        />
                      </div>
                      {a.status === "Avvik" && (
                        <label>
                          Alvorlighetsgrad
                          <select
                            value={a.severity || "critical"}
                            onChange={(e) =>
                              patch(p, { severity: e.target.value })
                            }
                          >
                            <option value="critical">Kritisk</option>
                            <option value="minor">Mindre restpunkt</option>
                          </select>
                        </label>
                      )}
                      <label>
                        Kommentar
                        <textarea
                          aria-label={`Kommentar: ${p.title}`}
                          maxLength={4000}
                          value={a.comment || ""}
                          onChange={(e) =>
                            patch(p, { comment: e.target.value })
                          }
                        />
                      </label>
                      <ChecklistFields
                        fields={p.fields}
                        values={a.values}
                        onChange={(values, keep) =>
                          patch(p, { values, _keepConfirmation: keep })
                        }
                        userId={data.id}
                        readOnly={!write || check.record.status === "completed"}
                      />
                      <p>
                        {p.image_required ? "Bilde påkrevd. " : ""}Velg egne
                        lagrede vedlegg fra samme plassering.
                      </p>
                      {quality.documents
                        .filter((d) => d.scope_id === check.scope_id)
                        .map((doc) => (
                          <label key={doc.id}>
                            <input
                              type="checkbox"
                              checked={(a.documents || []).includes(doc.id)}
                              onChange={(e) =>
                                patch(p, {
                                  documents: e.target.checked
                                    ? [...(a.documents || []), doc.id]
                                    : (a.documents || []).filter(
                                        (x) => x !== doc.id,
                                      ),
                                })
                              }
                            />
                            {doc.title}
                          </label>
                        ))}
                    </fieldset>
                  );
                })}
                <label>
                  <input
                    type="checkbox"
                    checked={!!draft.complete}
                    onChange={(e) =>
                      saveDraft({ ...draft, complete: e.target.checked })
                    }
                  />
                  Fullfør sjekklisten ved lagring
                </label>
              </fieldset>
              {draft.conflict && (
                <p role="alert">
                  Dokumentasjonen er endret. Kladden er beholdt. Se over siste
                  utfylling før du prøver igjen.
                  <details>
                    <summary>Se siste lagrede svar</summary>
                    {check.record.definition.points.map((p) => (
                      <p key={p.id}>
                        {p.title}:{" "}
                        {check.record.answers[p.id]?.status || "Ikke svart"} ·{" "}
                        {check.record.answers[p.id]?.comment}
                      </p>
                    ))}
                  </details>
                  <button
                    type="button"
                    onClick={() =>
                      saveDraft({
                        ...draft,
                        revision: check.revision,
                        conflict: false,
                      })
                    }
                  >
                    Jeg har sett siste dokumentasjon
                  </button>
                </p>
              )}
              {check.record.status !== "completed" && write && (
                <button
                  type="submit"
                  disabled={busy || working || draft.conflict}
                >
                  {draft.pending
                    ? "Prøv samme lagring igjen"
                    : "Lagre sjekkliste"}
                </button>
              )}
            </form>
          ) : (
            <p>Utfyllingen er ikke tilgjengelig. Kladden er beholdt.</p>
          )}
          {error && <p role="alert">{error}</p>}
          <button type="button" onClick={() => setOpen(false)}>
            Lukk og behold sjekklisteutkast
          </button>
          {!busy && (
            <details>
              <summary>Forkast sjekklisteutkast</summary>
              <button
                type="button"
                onClick={() => {
                  if (saveDraft(null)) setOpen(false);
                }}
              >
                Forkast lokal sjekklistekladd
              </button>
            </details>
          )}
        </Dialog>
      )}
    </section>
  );
}
