import React, { Suspense, useRef, useState } from "react";
import { useHrAccess } from "../hr/hrAccess.js";
import { DialogPortalTarget } from "../ui/DialogPortalTarget.js";
import { integrationRpc } from "./boligIntegrationClient.js";
import {
  useLivePartner,
  readPartnerDraft,
  storePartnerDraft,
} from "./boligPartnerClient.js";
import Dialog from "./BoligEditorDialog.jsx";
import "./boligIntegration.css";
const ProjectHms = React.lazy(() => import("../kshms/ProjectSjaEntry.jsx"));
const MyTime = React.lazy(() => import("../time/TimeEntryPoint.jsx"));
export default function BoligProjectIntegration({
  context,
  record,
  onOpenProject,
}) {
  const root = record.root,
    scope = `${context.user_id}:${context.company_id}:${root.id}:${context.role}`,
    key = `expo.bolig-integration.v1:${scope}`;
  const query = useRef(readPartnerDraft(key, {}).query || "");
  const { data, error, busy, load, run } = useLivePartner(scope, () =>
    integrationRpc(context, root.id, "get", { query: query.current }),
  );
  const [form, setForm] = useState(() =>
      readPartnerDraft(key, { mode: "create", projectId: "" }),
    ),
    [pending, setPending] = useState(() =>
      readPartnerDraft(key + ":pending", null),
    ),
    [localError, setLocalError] = useState(""),
    [opened, setOpened] = useState(null),
    [portalTarget, setPortalTarget] = useState(null),
    [scopeId, setScopeId] = useState("root");
  const pendingRef = useRef(pending),
    hr = useHrAccess(context.user_id, true);
  const ks =
    data?.ks_context?.company_id === context.company_id &&
    data?.ks_context?.user_id === context.user_id
      ? data.ks_context
      : null;
  const ownHr =
    hr?.company_id === context.company_id &&
    hr?.user_id === context.user_id &&
    hr.available
      ? hr
      : null;
  // Keep only verified scope metadata in memory while rechecking access. The
  // dialog is closed/hidden during that check; native modules clear private
  // payloads themselves. Their selected group and unsent editor stay mounted.
  const workspace = useRef(null);
  if (workspace.current?.scope !== scope || error) workspace.current = null;
  if (data) workspace.current = {scope, data, hr:ownHr || workspace.current?.hr};
  const workspaceData = data || workspace.current?.data;
  const workspaceKs = workspaceData?.ks_context;
  const workspaceHr = ownHr || workspace.current?.hr;
  const unit = record.units.find((u) => u.id === scopeId && !u.archived);
  const project =
    scopeId === "root"
      ? data?.project
      : unit?.project_id
        ? {
            id: unit.project_id,
            title: `${root.title} · ${unit.number}`,
            locked: false,
          }
        : null;
  const workspaceProject = scopeId === "root" ? workspaceData?.project : project;
  const change = (fields) => {
    try {
      const next = { ...form, ...fields };
      storePartnerDraft(key, next);
      setForm(next);
      setLocalError("");
    } catch {
      setLocalError("Kladden kunne ikke sikres. Behold vinduet åpent.");
    }
  };
  const save = () => {
    if (busy || !data) return;
    try {
      const attempt = pendingRef.current || {
        action: form.mode === "create" ? "create" : "link",
        payload: {
          request_id: crypto.randomUUID(),
          revision: data.revision,
          project_id:
            form.mode === "create" ? crypto.randomUUID() : form.projectId,
        },
      };
      storePartnerDraft(key + ":pending", attempt);
      pendingRef.current = attempt;
      setPending(attempt);
      setLocalError("");
      run(
        async () => {
          const next = await integrationRpc(
            context,
            root.id,
            attempt.action,
            attempt.payload,
          );
          if (next.receipt_id !== attempt.payload.request_id)
            throw Error(
              "Lagringen mangler kvittering. Prøv samme kobling igjen.",
            );
          return next;
        },
        () => {
          storePartnerDraft(key + ":pending", null);
          pendingRef.current = null;
          setPending(null);
        },
        (e) => {
          if (["42501", "22023", "PT409", "23505"].includes(e.code)) {
            storePartnerDraft(key + ":pending", null);
            pendingRef.current = null;
            setPending(null);
            setLocalError(e.message);
            load();
          }
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  const locked =
    busy || !!pending || context.role !== "manager" || root.archived;
  return (
    <section
      className="bolig-integration"
      aria-label="KS/HMS og timer i boligprosjektet"
    >
      <header>
        <h3>KS/HMS og timer</h3>
        <p>
          Bruk appens eksisterende funksjoner på dette boligprosjektet. Velg
          hovedprosjektet eller en bolig med egen prosjektkobling.
        </p>
      </header>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      <button
        type="button"
        className="secondary"
        disabled={busy}
        onClick={() => load()}
      >
        Hent prosjektkobling
      </button>
      {!data ? (
        <p role="status">Kontrollerer prosjektkoblingen …</p>
      ) : (
        <>
          <label>
            Arbeidssted
            <select
              aria-label="Arbeidssted for KS/HMS og timer"
              value={scopeId}
              disabled={!!opened}
              onChange={(e) => setScopeId(e.target.value)}
            >
              <option value="root">Hele boligprosjektet</option>
              {record.units
                .filter((u) => !u.archived)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.number}
                    {u.project_id ? " · Koblet prosjekt" : ""}
                  </option>
                ))}
            </select>
          </label>
          {project ? (
            <>
              <div className="bolig-integration-linked">
                <strong>{project.title}</strong>
                <span>
                  {project.locked
                    ? "Prosjektet er låst. Dokumenter kan leses."
                    : "Koblet til eksisterende ProffDok-funksjoner."}
                </span>
              </div>
              <div className="bolig-integration-tools">
                <button
                  type="button"
                  disabled={!ks}
                  onClick={() => setOpened("hms")}
                >
                  <strong>SJA, RUH og HMS-kontroller</strong>
                  <span>Åpne og fortsett prosjektets dokumenter</span>
                </button>
                <button
                  type="button"
                  disabled={!onOpenProject}
                  onClick={() => onOpenProject(project.id, "sjekklister")}
                >
                  <strong>Prosjektets sjekklister</strong>
                  <span>Åpne den vanlige sjekklisteflaten</span>
                </button>
                <button
                  type="button"
                  disabled={!ownHr}
                  onClick={() => setOpened("time")}
                >
                  <strong>Før timer og utlegg</strong>
                  <span>Velg dette prosjektet i Mine timer</span>
                </button>
              </div>
              {!ks && (
                <p>
                  Din KS/HMS-tilgang må være aktiv i samme firma for å åpne
                  HMS-dokumentene.
                </p>
              )}
              {!ownHr && (
                <p>
                  HR er inkludert i Boligprosjekter. Firmaadmin må fullføre
                  firmaets HR-oppsett før du kan bruke Mine timer. Timeføring
                  krever også at du er registrert i firmaets HR- og timeoppsett.
                </p>
              )}
            </>
          ) : scopeId !== "root" ? (
            <p>
              Denne boligen har ingen tilgjengelig prosjektkobling. Den kan
              kobles til i Leilighetsinformasjon. Boligens egne sjekklister og
              dokumenter ligger fortsatt i boligvisningen.
            </p>
          ) : data.has_link ? (
            <p>
              Prosjektkoblingen finnes, men er ikke tilgjengelig med dagens
              prosjekttilgang eller er også koblet til en bolig. Kontroller
              prosjektet før du fortsetter.
            </p>
          ) : (
            <div className="bolig-integration-setup">
              <h4>Koble hovedprosjektet én gang</h4>
              <p>
                Koblingen samler HMS, sjekklister og timer på ett vanlig
                ProffDok-prosjekt. Eksisterende boliger og dokumenter beholdes.
                Velg et nytt prosjekt eller et eksisterende prosjekt fra
                firmaet.
              </p>
              {context.role === "manager" && !root.archived ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    save();
                  }}
                >
                  <label>
                    Prosjektkobling
                    <select
                      aria-label="Prosjektkobling"
                      disabled={locked}
                      value={form.mode}
                      onChange={(e) => change({ mode: e.target.value })}
                    >
                      <option value="create">
                        Opprett nytt koblet prosjekt
                      </option>
                      <option value="link">Bruk eksisterende prosjekt</option>
                    </select>
                  </label>
                  {form.mode === "link" ? (
                    <>
                      <label>
                        Søk etter eksisterende prosjekt
                        <input
                          disabled={locked}
                          type="search"
                          value={form.query || ""}
                          onChange={(e) => {
                            query.current = e.target.value;
                            change({ query: e.target.value, projectId: "" });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => load()}
                      >
                        Søk prosjekter
                      </button>
                      <label>
                        Eksisterende prosjekt
                        <select
                          aria-label="Eksisterende prosjekt"
                          required
                          value={form.projectId}
                          disabled={locked}
                          onChange={(e) =>
                            change({ projectId: e.target.value })
                          }
                        >
                          <option value="">Velg prosjekt</option>
                          {data.candidates.map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p>
                        Viser inntil 50 treff. Søk på navn eller prosjektnummer
                        ved behov.
                      </p>
                    </>
                  ) : (
                    <p>
                      Det nye prosjektet får navnet{" "}
                      <strong>{root.title}</strong> og referansen{" "}
                      {root.reference || "fra boligprosjektet"}. Det opprettes
                      først når du trykker knappen nedenfor.
                    </p>
                  )}
                  <p>
                    Velg riktig prosjekt. Koblingen beholdes slik at
                    dokumentasjon og timer får samme referanse over tid.
                  </p>
                  <button
                    disabled={
                      locked ||
                      (form.mode === "link" &&
                        !data.candidates.some((x) => x.id === form.projectId))
                    }
                  >
                    {busy
                      ? "Lagrer …"
                      : form.mode === "create"
                        ? "Opprett prosjektkobling"
                        : "Koble valgt prosjekt"}
                  </button>
                </form>
              ) : (
                <p>Prosjektleder kobler hovedprosjektet til ProffDok.</p>
              )}
            </div>
          )}
        </>
      )}
      {opened && (!data || (opened === "time" && !ownHr)) && (
        <p role="status">Arbeidsflaten er skjult til tilgangen er bekreftet. <button type="button" onClick={()=>setOpened(null)}>Lukk arbeidsflaten</button></p>
      )}
      {pending && (
        <p role="status">
          Koblingen er ikke bekreftet.{" "}
          <button type="button" disabled={busy || !data} onClick={save}>
            Prøv samme kobling igjen
          </button>
        </p>
      )}
      {opened && workspaceData && workspaceProject && (
        <Dialog
          suspended={!data || (opened === "time" && !ownHr)}
          title={
            opened === "hms"
              ? "Prosjektets KS/HMS"
              : "Mine timer på boligprosjektet"
          }
          onClose={() => setOpened(null)}
        >
          <div ref={setPortalTarget} />
          <DialogPortalTarget.Provider value={portalTarget}>
          {portalTarget && (
          <Suspense
            fallback={<p role="status">Henter eksisterende arbeidsflate …</p>}
          >
            {opened === "hms" && workspaceKs ? (
              <ProjectHms
                key={`${scope}:${workspaceProject.id}:${workspaceKs.manage}`}
                context={workspaceKs}
                projectId={workspaceProject.id}
                readOnly={
                  context.role !== "manager" || root.archived || workspaceProject.locked
                }
              />
            ) : opened === "time" && workspaceHr ? (
              <>
                <p>
                  Velg <strong>{workspaceProject.title}</strong> i prosjektfeltet når du
                  lager en ny timeregistrering. Kontroller prosjektet før
                  lagring. Eksisterende uker, godkjenning og eksport følger
                  samme timeføring som på Min side.
                </p>
                <MyTime key={`${scope}:${workspaceHr.administer}`} context={workspaceHr} />
              </>
            ) : (
              <p>Tilgangen må bekreftes før arbeidsflaten kan åpnes.</p>
            )}
          </Suspense>
          )}
          </DialogPortalTarget.Provider>
        </Dialog>
      )}
    </section>
  );
}
