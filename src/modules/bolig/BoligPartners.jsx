import React, { useState } from "react";
import {
  Truck,
  UsersRound,
  ShieldCheck,
  Plus,
  ExternalLink,
} from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import Items from "./BoligPartnerItems.jsx";
import {
  partnerManagerRpc,
  partnerToken,
  partnerDate,
  readPartnerDraft,
  storePartnerDraft,
  useLivePartner,
} from "./boligPartnerClient.js";
import "./boligPartners.css";
const featureNames = {
  progress: "Fremdrift",
  checklists: "Sjekklister",
  orders: "Bestillinger og leveranser",
};
const defaults = (kind) =>
  kind === "ue"
    ? ["progress", "checklists", "quality_write"]
    : ["progress", "orders"];
const blank = {
  name: "",
  email: "",
  organisation: "",
  kind: "supplier",
  days: 30,
  features: defaults("supplier"),
  supplier_name: "",
};
export default function BoligPartners({ context, root }) {
  const key = `expo.bolig-partners.v1:${context.user_id}:${context.company_id}:${root.id}`;
  const scope = `${key}:${context.role}:${context.enabled}`;
  const { data, error, busy, load, run } = useLivePartner(scope, () =>
    partnerManagerRpc(context, root.id),
  );
  const [draft, setDraft] = useState(() => ({
      ...blank,
      ...readPartnerDraft(key, { ...blank }),
    })),
    [pending, setPending] = useState(() =>
      readPartnerDraft(key + ":pending", null),
    ),
    [links, setLinks] = useState(() => readPartnerDraft(key + ":links", {}));
  const [editor, setEditor] = useState(false),
    [selected, setSelected] = useState(null),
    [editing, setEditing] = useState(
      () => readPartnerDraft(key, {}).editing || null,
    ),
    [stale, setStale] = useState(false),
    [localError, setLocalError] = useState(""),
    [notice, setNotice] = useState("");
  const manager =
    context.role === "manager" && context.enabled && !root.archived;
  const update = (fields) => {
    if (pending) return;
    const next = { ...draft, ...fields };
    try {
      storePartnerDraft(key, next);
      setDraft(next);
      setLocalError("");
    } catch {
      setLocalError(
        "Nettleseren kunne ikke sikre kladden. Behold vinduet åpent.",
      );
    }
  };
  const create = () => {
    if (!data || !manager || busy || stale) return;
    let attempt = pending;
    try {
      if (!attempt) {
        attempt = {
          action: editing ? "permissions" : "create",
          payload: {
            ...(editing
              ? { id: editing.id, revision: editing.revision }
              : {
                  name: draft.name,
                  email: draft.email,
                  organisation: draft.organisation,
                  kind: draft.kind,
                  days: draft.days,
                  id: crypto.randomUUID(),
                  token: partnerToken(),
                }),
            request_id: crypto.randomUUID(),
            access_mode: "project",
            reviewed: true,
            features: draft.features,
            supplier_name: draft.supplier_name,
          },
        };
        storePartnerDraft(key + ":pending", attempt);
        setPending(attempt);
      }
      run(
        () =>
          partnerManagerRpc(context, root.id, attempt.action, attempt.payload),
        (result) => {
          if (result.created_id !== attempt.payload.id)
            throw Error("Tilgangsreferansen stemmer ikke.");
          const next = {
            ...links,
            ...(attempt.action === "create"
              ? {
                  [result.created_id]: `${location.origin}/bolig-kunde.html#partner=${attempt.payload.token}`,
                }
              : {}),
          };
          storePartnerDraft(key + ":links", next);
          storePartnerDraft(key + ":pending", null);
          storePartnerDraft(key, { ...blank });
          setLinks(next);
          setPending(null);
          setDraft({ ...blank });
          setEditor(false);
          setEditing(null);
          setSelected(result.created_id);
          setNotice(
            attempt.action === "permissions"
              ? "Funksjonene er oppdatert for hele prosjektet. Samme lenke gjelder."
              : "Tilgangslenken er klar. Ingen invitasjon er sendt.",
          );
        },
        (e) => {
          if (["PT409", "22023"].includes(e.code)) {
            storePartnerDraft(key + ":pending", null);
            setPending(null);
            setLocalError(e.message);
            if (attempt.action === "permissions" && e.code === "PT409")
              setStale(true);
            load();
          }
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  const revoke = (id) => {
    const k = key + ":revoke:" + id;
    let attempt = readPartnerDraft(k, null) || {
      id,
      request_id: crypto.randomUUID(),
    };
    try {
      storePartnerDraft(k, attempt);
      run(
        () => partnerManagerRpc(context, root.id, "revoke", attempt),
        () => {
          localStorage.removeItem(k);
          setNotice("Tilgangen er trukket tilbake.");
        },
      );
    } catch (e) {
      setLocalError(e.message);
    }
  };
  const active = data?.partners.filter((x) => x.active).length || 0;
  const partner = data?.partners.find((p) => p.id === selected);
  return (
    <section className="bolig-partners" aria-label="UE og leverandører">
      <header className="bolig-partner-hero">
        <span className="bolig-partner-icon">
          <Truck size={29} />
        </span>
        <div>
          <small>SAMARBEID I PROSJEKTET</small>
          <h2>UE og leverandører</h2>
          <p>
            Gi tilgang til hele prosjektet og velg funksjonene hver UE eller
            leverandør skal kunne følge. Se bekreftede datoer og avvik her.
          </p>
        </div>
        {manager && (
          <button
            type="button"
            className="bolig-primary"
            disabled={!data || busy}
            onClick={() => {
              setEditing(
                pending?.action === "permissions"
                  ? {
                      id: pending.payload.id,
                      revision: pending.payload.revision,
                    }
                  : draft.editing || null,
              );
              setEditor(true);
            }}
          >
            <Plus size={17} />
            Gi tilgang
          </button>
        )}
      </header>
      {(error || localError) && <p role="alert">{localError || error}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="bolig-partner-toolbar">
        <span>
          <UsersRound size={17} /> {active} aktive tilganger
        </span>
        <button type="button" disabled={busy} onClick={load}>
          Hent siste status
        </button>
      </div>
      {!data ? (
        <p role="status">
          {error
            ? "Tilgangen må kontrolleres på nytt."
            : "Kontrollerer tilgang og henter leveranser …"}
        </p>
      ) : (
        <>
          {!data.partners.length && (
            <div className="bolig-partner-empty">
              <ShieldCheck size={35} />
              <h3>Riktig innsyn til hver samarbeidspartner</h3>
              <p>
                Velg kontakt og funksjoner én gang. Tilgangen omfatter alle
                aktive leiligheter i prosjektet, også nye som legges til senere.
                Leverandørens svar vises her.
              </p>
            </div>
          )}
          <div className="bolig-partner-cards">
            {data.partners.map((p) => {
              const issues = p.events.filter(
                (e, i, all) =>
                  all.findIndex(
                    (x) => x.target_id === e.target_id && x.kind === e.kind,
                  ) === i &&
                  e.current &&
                  e.status === "issue",
              ).length;
              return (
                <button
                  className="bolig-partner-card"
                  type="button"
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                >
                  <span className="bolig-partner-tag">
                    {p.active
                      ? p.kind === "ue"
                        ? "UE"
                        : "Leverandør"
                      : p.revoked
                        ? "Tilbakekalt"
                        : "Utløpt / stanset"}
                  </span>
                  <b>{p.organisation}</b>
                  <span>{p.name}</span>
                  <small>
                    {p.orders.length} leveranser · {p.tasks.length} aktiviteter
                    · {issues} avvik
                  </small>
                  <small>
                    {p.access_mode === "project"
                      ? (p.features || [])
                          .filter((x) => featureNames[x])
                          .map((x) => featureNames[x])
                          .join(" · ")
                      : "Eldre tilgang til utvalgte rader"}
                  </small>
                  <small>Til {partnerDate(p.expires_at)}</small>
                  <span>Åpne oppfølging →</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {editor && manager && (
        <Dialog
          className="bolig-partner-dialog"
          title={
            editing ? "Endre funksjoner" : "Gi UE eller leverandør tilgang"
          }
          busy={busy}
          onClose={() => setEditor(false)}
        >
          <p>
            Velg hva kontakten får se. Lenken gir tilgang til den som har den.
            Del den bare med den navngitte kontakten.
          </p>
          {(error || localError) && <p role="alert">{localError || error}</p>}
          {!data ? (
            <p>Kontrollerer tilgang …</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                create();
              }}
            >
              <fieldset disabled={busy || !!pending || !!editing}>
                <div className="bolig-partner-fields">
                  <label>
                    Bedrift
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      value={draft.organisation}
                      onChange={(e) => update({ organisation: e.target.value })}
                    />
                  </label>
                  <label>
                    Kontaktperson
                    <input
                      required
                      minLength={2}
                      maxLength={120}
                      value={draft.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    E-post
                    <input
                      required
                      type="email"
                      maxLength={254}
                      value={draft.email}
                      onChange={(e) => update({ email: e.target.value })}
                    />
                  </label>
                  <label>
                    Type
                    <select
                      aria-label="Type"
                      value={draft.kind}
                      onChange={(e) =>
                        update({
                          kind: e.target.value,
                          features: defaults(e.target.value),
                        })
                      }
                    >
                      <option value="supplier">Leverandør</option>
                      <option value="ue">UE</option>
                    </select>
                  </label>
                  <label>
                    Gyldig i
                    <select
                      aria-label="Gyldig i"
                      value={draft.days}
                      onChange={(e) => update({ days: Number(e.target.value) })}
                    >
                      {[7, 14, 30, 60, 90].map((n) => (
                        <option key={n} value={n}>
                          {n} dager
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>
              <div className="bolig-partner-project">
                <div>
                  <h3>
                    Hele boligprosjektet · {data.unit_count || 0} leiligheter
                  </h3>
                  <p>
                    Alle aktive leiligheter omfattes. Nye leiligheter får samme
                    tilgang automatisk.
                  </p>
                </div>
              </div>
              <h3>Velg funksjoner</h3>
              <fieldset
                className="bolig-partner-features"
                disabled={busy || !!pending}
              >
                {Object.entries(featureNames).map(([id, label]) => (
                  <label key={id}>
                    <input
                      type="checkbox"
                      checked={draft.features.includes(id)}
                      onChange={(e) =>
                        update({
                          features: e.target.checked
                            ? [...draft.features, id]
                            : draft.features.filter(
                                (x) =>
                                  x !== id &&
                                  (id !== "checklists" ||
                                    x !== "quality_write"),
                              ),
                        })
                      }
                    />
                    <span>
                      <b>{label}</b>
                      <small>
                        {id === "progress"
                          ? "Planlagte aktiviteter og datoer. Bekreft dato eller meld avvik."
                          : id === "checklists"
                            ? "Se sjekklister, kontrollpunkter og status. UE kan også gis rett til egen utfylling og vedlegg."
                            : "Bestilte varer, leveringsdatoer og mottaksstatus for valgt leverandør. Uten priser."}
                      </small>
                    </span>
                  </label>
                ))}
                {draft.features.includes("orders") && (
                  <label className="bolig-partner-supplier">
                    Leverandør på bestillingene
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      list="bolig-partner-suppliers"
                      value={draft.supplier_name}
                      onChange={(e) =>
                        update({ supplier_name: e.target.value })
                      }
                    />
                    <datalist id="bolig-partner-suppliers">
                      {(data.suppliers || []).map((x) => (
                        <option key={x} value={x} />
                      ))}
                    </datalist>
                    <small>
                      Bruk samme leverandørnavn som på bestillingen. Bare denne
                      leverandørens ordre vises, på tvers av alle leiligheter.
                    </small>
                  </label>
                )}
              </fieldset>
              {draft.kind === "ue" && draft.features.includes("checklists") && (
                <label>
                  Tilgang til sjekklister
                  <select
                    aria-label="Tilgang til sjekklister"
                    disabled={busy || !!pending}
                    value={
                      draft.features.includes("quality_write")
                        ? "write"
                        : "read"
                    }
                    onChange={(e) =>
                      update({
                        features:
                          e.target.value === "write"
                            ? [
                                ...draft.features.filter(
                                  (x) => x !== "quality_write",
                                ),
                                "quality_write",
                              ]
                            : draft.features.filter(
                                (x) => x !== "quality_write",
                              ),
                      })
                    }
                  >
                    <option value="read">Les sjekklister</option>
                    <option value="write">
                      Fyll ut egne sjekklister og last opp vedlegg og bilder
                    </option>
                  </select>
                </label>
              )}
              <p>
                Forslag: UE får fremdrift og sjekklister. Leverandør får
                fremdrift og bestillinger. Du kan justere valgene.
              </p>
              {stale && editing && (
                <p role="alert">
                  Tilgangen er endret. Se over siste registrerte funksjoner før
                  du lagrer utkastet:{" "}
                  {(
                    data.partners.find((x) => x.id === editing.id)?.features ||
                    []
                  )
                    .filter((x) => featureNames[x])
                    .map((x) => featureNames[x])
                    .join(" · ")}
                  .{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const latest = data.partners.find(
                        (x) => x.id === editing.id,
                      );
                      if (!latest?.active) return;
                      const nextEditing = {
                        id: latest.id,
                        revision: latest.revision,
                      };
                      try {
                        storePartnerDraft(key, {
                          ...draft,
                          editing: nextEditing,
                        });
                        setDraft({ ...draft, editing: nextEditing });
                        setEditing(nextEditing);
                        setStale(false);
                        setLocalError("");
                      } catch {
                        setLocalError("Nettleseren kunne ikke sikre kladden.");
                      }
                    }}
                  >
                    Jeg har sett siste tilgang
                  </button>
                </p>
              )}
              {pending && (
                <p>
                  Et forsøk venter på kvittering. Prøv samme forsøk igjen for å
                  unngå dobbelt tilgang.
                </p>
              )}
              <footer>
                <button type="button" onClick={() => setEditor(false)}>
                  Lukk og behold utkast
                </button>
                <button
                  className="bolig-primary"
                  type="submit"
                  disabled={
                    busy ||
                    stale ||
                    (!pending &&
                      (!draft.features.length ||
                        (draft.features.includes("orders") &&
                          draft.supplier_name.trim().length < 2)))
                  }
                >
                  {busy
                    ? "Lagrer …"
                    : pending
                      ? "Prøv samme forsøk igjen"
                      : editing
                        ? "Lagre funksjoner"
                        : "Opprett tilgangslenke"}
                </button>
              </footer>
            </form>
          )}
        </Dialog>
      )}
      {partner && (
        <Dialog
          className="bolig-partner-dialog"
          title={`${partner.organisation} – oppfølging`}
          busy={busy}
          onClose={() => setSelected(null)}
        >
          <p>
            {partner.name} · {partner.email} · Til{" "}
            {partnerDate(partner.expires_at)} ·{" "}
            {partner.active
              ? "Aktiv tilgang"
              : partner.revoked
                ? "Tilbakekalt"
                : "Utløpt / stanset"}
          </p>
          {error && <p role="alert">{error}</p>}
          {manager && partner.active && (
            <div className="bolig-partner-toolbar">
              {links[partner.id] ? (
                <label>
                  Tilgangslenke
                  <input
                    readOnly
                    aria-label="Tilgangslenke"
                    value={links[partner.id]}
                    onFocus={(e) => e.target.select()}
                  />
                  <a href={links[partner.id]} target="_blank" rel="noreferrer">
                    <ExternalLink size={15} />
                    Åpne mottakersiden
                  </a>
                </label>
              ) : (
                <p>
                  Lenken finnes i nettleseren der den ble opprettet. Trenger
                  kontakten en ny lenke, trekk tilbake og opprett ny tilgang.
                </p>
              )}
              {partner.access_mode === "project" && (
                <button
                  type="button"
                  disabled={busy || !!pending}
                  onClick={() => {
                    const next = {
                      ...blank,
                      name: partner.name,
                      email: partner.email,
                      organisation: partner.organisation,
                      kind: partner.kind,
                      features: partner.features,
                      supplier_name: partner.supplier_name || "",
                      editing: { id: partner.id, revision: partner.revision },
                    };
                    try {
                      storePartnerDraft(key, next);
                      setDraft(next);
                      setEditing({
                        id: partner.id,
                        revision: partner.revision,
                      });
                      setSelected(null);
                      setEditor(true);
                    } catch {
                      setLocalError("Nettleseren kunne ikke sikre kladden.");
                    }
                  }}
                >
                  Endre funksjoner
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => revoke(partner.id)}
              >
                Trekk tilbake tilgang
              </button>
            </div>
          )}
          <p>
            {partner.access_mode === "project"
              ? `Hele prosjektet · ${partner.unit_count} leiligheter · ${(
                  partner.features || []
                )
                  .filter((x) => featureNames[x])
                  .map((x) => featureNames[x])
                  .join(" · ")}`
              : "Eldre tilgang: Bare tidligere valgte rader deles. Opprett ny tilgang for å dele hele prosjektet."}
          </p>
          <p>
            Svarene endrer ikke prosjektplanen eller registrert varemottak.
            Datoendringer følges opp i «Fremdrift og varsler». Mottak
            registreres under boligens bestilling.
          </p>
          <Items
            items={[...partner.orders, ...partner.tasks]}
            events={partner.events}
          />
        </Dialog>
      )}
    </section>
  );
}
