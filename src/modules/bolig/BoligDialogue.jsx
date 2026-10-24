import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import Dialog from "./BoligEditorDialog.jsx";
import PortalManager from "./BoligPortalManager.jsx";
import { useBoligCoordination } from "./boligCoordination.js";
import { portalStamp } from "./boligPortalClient.js";
export function DialogueBadge({ row, onOpen }) {
  if (!row?.pending) return null;
  return (
    <button
      type="button"
      className={`bolig-dialogue-badge ${row.unread ? "unread" : "pending"}`}
      aria-label={`Meldinger for ${row.number}: ${row.unread ? `${row.unread} uleste` : `${row.pending} venter på oppfølging`}`}
      title={
        row.unread ? "Ny melding fra beboer" : "Lest – venter på oppfølging"
      }
      onClick={(e) => {
        e.stopPropagation();
        onOpen(row.unit_id);
      }}
    >
      <MessageCircle size={13} />
      <span>{row.unread || row.pending}</span>
    </button>
  );
}
export function CoordinationConflict({ coordination }) {
  const { data, draft, update } = coordination;
  if (
    draft.basisRevision == null ||
    !data ||
    draft.basisRevision === data.revision
  )
    return null;
  return (
    <div role="status">
      <p>
        Oppsettet er endret siden du begynte. Kladden er beholdt. Se over
        nåværende grupper og meldingsvalg før du lagrer igjen.
      </p>
      <button
        type="button"
        onClick={() => update({ basisRevision: data.revision })}
      >
        Jeg har sett gjennom siste oppsett
      </button>
    </div>
  );
}
export function DialogueSettings({ coordination, context, root, unit = null, showError = true }) {
  const { data, error, busy, draft, update, run, disabled } = coordination;
  const [problem, setProblem] = useState("");
  if (!data) return <p role="status">{error || "Henter meldingsoppsett …"}</p>;
  const writable =
    context.enabled && data.context.role === "manager" && !root.archived;
  const patch = (v) => {
    try {
      update(v);
      setProblem("");
    } catch (e) {
      setProblem(e.message);
    }
  };
  const selected = unit
    ? [unit.id]
    : (draft.selected || []).filter((id) =>
        data.units.some((u) => u.id === id),
      );
  const current = unit ? data.units.find((u) => u.id === unit.id) : null;
  const mode =
    draft.mode ??
    (current?.override == null ? "inherit" : current.override ? "on" : "off");
  return (
    <details className="bolig-dialogue-settings">
      <summary>
        Meldinger av/på{" "}
        {unit
          ? `· ${current?.enabled ? "På" : "Av"}`
          : `· prosjektstandard ${data.messaging_enabled ? "På" : "Av"}`}
      </summary>
      <p>
        Frie meldinger kan slås av uten å stenge fremdriftsvarsler, dokumenter
        eller avtaler. Historikk og åpne oppfølginger beholdes.
      </p>
      {((showError && error) || problem) && (
        <p role="alert">{(showError && error) || problem}</p>
      )}
      <CoordinationConflict coordination={coordination} />
      {writable ? (
        <>
          <fieldset disabled={disabled}>
            {!unit && (
              <>
                <label className="bolig-plan-check">
                  <input
                    type="checkbox"
                    checked={draft.enabled ?? data.messaging_enabled}
                    onChange={(e) => patch({ enabled: e.target.checked })}
                  />
                  Tillat meldinger som standard i prosjektet
                </label>
                <label>
                  Ansvarlig for beboerdialog
                  <select
                    value={draft.manager_id ?? data.manager_id ?? ""}
                    onChange={(e) => patch({ manager_id: e.target.value })}
                  >
                    <option value="">Velg aktiv prosjektleder</option>
                    {data.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      await run("settings", {
                        enabled: draft.enabled ?? data.messaging_enabled,
                        manager_id: draft.manager_id ?? data.manager_id,
                      })
                    ) {
                      patch({
                        enabled: null,
                        manager_id: null,
                        basisRevision: null,
                      });
                    }
                  }}
                >
                  Lagre prosjektets meldingsoppsett
                </button>
                <h4>Unntak for valgte leiligheter</h4>
                <div className="bolig-dialogue-unit-choices">
                  {data.units.map((u) => (
                    <label key={u.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={(e) =>
                          patch({
                            selected: e.target.checked
                              ? [...selected, u.id]
                              : selected.filter((id) => id !== u.id),
                          })
                        }
                      />
                      {u.number} · {u.address}
                      <small>
                        {u.override === null
                          ? "Arver prosjektet"
                          : u.override
                            ? "Eget valg: På"
                            : "Eget valg: Av"}
                      </small>
                    </label>
                  ))}
                </div>
              </>
            )}
            <label>
              Meldinger for{" "}
              {unit ? unit.number : `${selected.length} valgte leiligheter`}
              <select
                value={mode}
                onChange={(e) => patch({ mode: e.target.value })}
              >
                <option value="inherit">
                  Arv prosjektets innstilling (
                  {data.messaging_enabled ? "På" : "Av"})
                </option>
                <option value="on">På</option>
                <option value="off">Av</option>
              </select>
            </label>
            <button
              type="button"
              disabled={!selected.length}
              onClick={async () => {
                await run("units", { unit_ids: selected, mode });
              }}
            >
              Lagre meldingsvalg for {unit ? "leiligheten" : "utvalget"}
            </button>
          </fieldset>
          {draft.pending && (
            <button
              disabled={busy}
              type="button"
              onClick={() => run(null, {}, true)}
            >
              Prøv samme meldingsoppsett igjen
            </button>
          )}
        </>
      ) : (
        <p>Prosjektleder kan endre meldingsoppsettet.</p>
      )}
    </details>
  );
}
export default function BoligDialogue({
  coordination,
  context,
  record,
  openUnit,
  onOpen,
  onClose,
}) {
  const [all, setAll] = useState(false),
    [query, setQuery] = useState("");
  const data = coordination.data;
  const unit = record.units.find((u) => u.id === openUnit && !u.archived),
    rows = (data?.inbox || []).filter((r) =>
      `${r.number} ${r.address} ${r.contact_name || ""}`
        .toLocaleLowerCase("nb")
        .includes(query.toLocaleLowerCase("nb")),
    );
  return (
    <section
      className="bolig-dialogue-inbox"
      aria-label="Beboerdialog og oppfølging"
    >
      <div className="bolig-dialogue-inbox-heading">
        <div>
          <small>BEBOERDIALOG</small>
          <h4>
            Krever oppfølging <span>{data?.inbox?.length || 0}</span>
          </h4>
          <p>
            Ulest og ubehandlet er to forskjellige ting. Å lese fjerner ikke
            oppfølgingen.
          </p>
        </div>
        <button
          type="button"
          disabled={coordination.busy}
          onClick={coordination.load}
        >
          Oppdater meldinger
        </button>
      </div>
      {coordination.error && <p role="alert">{coordination.error}</p>}
      {!!data?.inbox?.length && (
        <>
          <label>
            Søk i beboermeldinger
            <input
              type="search"
              placeholder="Bolig, adresse eller beboer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="bolig-dialogue-inbox-list">
            {rows.slice(0, all ? rows.length : 6).map((r) => (
              <button
                type="button"
                key={r.unit_id}
                onClick={() => onOpen(r.unit_id)}
              >
                <MessageCircle size={22} />
                <span>
                  <strong>
                    {r.number} · {r.address}
                  </strong>
                  <span>{r.preview}</span>
                  <small>
                    {r.unread
                      ? `${r.unread} uleste`
                      : `${r.pending} venter på oppfølging`}{" "}
                    · {portalStamp(r.latest_at)}
                    {!r.enabled ? " · Meldinger er av" : ""}
                    {r.revoked ? " · Portal tilbakekalt" : ""}
                  </small>
                </span>
                <b>Åpne →</b>
              </button>
            ))}
          </div>
          {rows.length > 6 && (
            <button type="button" onClick={() => setAll((v) => !v)}>
              {all ? "Vis færre" : `Vis alle ${rows.length} leiligheter`}
            </button>
          )}
        </>
      )}
      {data && !data.inbox.length && <p>Ingen ubehandlede beboermeldinger.</p>}
      <DialogueSettings
        showError={false}
        coordination={coordination}
        context={context}
        root={record.root}
      />
      {unit && (
        <Dialog
          title={`${unit.number} · Meldinger og oppfølging`}
          onClose={onClose}
          className="bolig-dialogue-conversation"
        >
          <PortalManager
            key={`${context.user_id}/${context.company_id}/${record.root.id}/${unit.id}`}
            context={context}
            root={record.root}
            unit={unit}
            messagesOnly
          />
        </Dialog>
      )}
    </section>
  );
}
export function UnitDialogueSettings({ context, root, unit }) {
  const coordination = useBoligCoordination(context, root, `unit-${unit.id}`);
  return (
    <DialogueSettings
      coordination={coordination}
      context={context}
      root={root}
      unit={unit}
    />
  );
}
export function CoordinationGroupDialog({
  coordination,
  selected,
  onClose,
  onSaved,
}) {
  const { data, draft, update, run, disabled, error } = coordination;
  const [problem, setProblem] = useState("");
  if (!data) return null;
  const moving = data.groups.filter((g) =>
    g.unit_ids.some((id) => selected.includes(id)),
  );
  return (
    <Dialog
      title="Lagre stammegruppe fra byggbildet"
      onClose={onClose}
      busy={coordination.busy}
    >
      <div className="bolig-plan-dialog-body">
        <CoordinationConflict coordination={coordination} />
        <p>
          {selected.length} leiligheter er valgt. Datoer og aktiviteter endres
          ikke når du lagrer gruppen.
        </p>
        {(error || problem) && <p role="alert">{error || problem}</p>}
        <fieldset disabled={disabled}>
          <label>
            Navn på ny stammegruppe
            <input
              maxLength={80}
              value={draft.groupName || ""}
              onChange={(e) => {
                try {
                  update({ groupName: e.target.value });
                } catch (err) {
                  setProblem(err.message);
                }
              }}
            />
          </label>
          <p>
            {data.units
              .filter((u) => selected.includes(u.id))
              .map((u) => `${u.number} (${u.address})`)
              .join(" · ")}
          </p>
          {moving.length > 0 && (
            <label className="bolig-plan-check">
              <input
                type="checkbox"
                checked={!!draft.groupMove}
                onChange={(e) => {
                  try {
                    update({ groupMove: e.target.checked });
                  } catch (err) {
                    setProblem(err.message);
                  }
                }}
              />
              Flytt valgte boliger fra {moving.map((g) => g.name).join(", ")}
            </label>
          )}
          <button
            type="button"
            disabled={
              !selected.length ||
              !(draft.groupName || "").trim() ||
              (moving.length > 0 && !draft.groupMove)
            }
            onClick={async () => {
              if (
                await run("group", {
                  id: crypto.randomUUID(),
                  name: draft.groupName,
                  unit_ids: selected,
                  move_confirmed: !!draft.groupMove,
                })
              ) {
                update({
                  groupName: "",
                  groupMove: false,
                  basisRevision: null,
                });
                onSaved();
              }
            }}
          >
            Lagre stammegruppe
          </button>
        </fieldset>
        {draft.pending && (
          <button
            type="button"
            disabled={coordination.busy}
            onClick={async () => {
              if (await run(null, {}, true)) onSaved();
            }}
          >
            Prøv samme gruppelagring igjen
          </button>
        )}
      </div>
    </Dialog>
  );
}
