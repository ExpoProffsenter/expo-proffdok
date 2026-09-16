// Expo ProffDok – FASE 42M
// Ordinære Våtromstilbud kobles til eksisterende oppfølgingsmotor uten å endre
// Butikktilbudets metadata. Planen lagres separat og låses til aktiv publisert versjon.

import { useEffect, useMemo, useState } from "react";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";

const DEFAULT_FIRST_DAYS = 7;
const DEFAULT_REPEAT_DAYS = 7;
const DEFAULT_MAX_REMINDERS = 3;

function boundedInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function versionMatches(request = {}) {
  const activeVersionId = String(request?.sentOfferVersionId || "").trim();
  const configuredVersionId = String(request?.wetroomFollowUpVersionId || "").trim();
  return Boolean(activeVersionId && configuredVersionId === activeVersionId);
}

function enabledForVersion(request = {}) {
  return versionMatches(request) && request?.wetroomFollowUpEnabled === true;
}

export default function SalesWetroomFollowUpActions({ request = {} }) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const activeVersionId = String(request?.sentOfferVersionId || "").trim();
  const activeVersionNumber = Number(request?.sentOfferVersionNumber || 0) || 0;
  const matches = versionMatches(request);
  const [enabled, setEnabled] = useState(() => enabledForVersion(request));
  const [firstDays, setFirstDays] = useState(() => matches ? boundedInteger(request?.wetroomFollowUpFirstDays, DEFAULT_FIRST_DAYS, 1, 90) : DEFAULT_FIRST_DAYS);
  const [repeatDays, setRepeatDays] = useState(() => matches ? boundedInteger(request?.wetroomFollowUpRepeatDays, DEFAULT_REPEAT_DAYS, 1, 90) : DEFAULT_REPEAT_DAYS);
  const [maxReminders, setMaxReminders] = useState(() => matches ? boundedInteger(request?.wetroomFollowUpMaxReminders, DEFAULT_MAX_REMINDERS, 1, 10) : DEFAULT_MAX_REMINDERS);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const configured = versionMatches(request);
    setEnabled(enabledForVersion(request));
    setFirstDays(configured ? boundedInteger(request?.wetroomFollowUpFirstDays, DEFAULT_FIRST_DAYS, 1, 90) : DEFAULT_FIRST_DAYS);
    setRepeatDays(configured ? boundedInteger(request?.wetroomFollowUpRepeatDays, DEFAULT_REPEAT_DAYS, 1, 90) : DEFAULT_REPEAT_DAYS);
    setMaxReminders(configured ? boundedInteger(request?.wetroomFollowUpMaxReminders, DEFAULT_MAX_REMINDERS, 1, 10) : DEFAULT_MAX_REMINDERS);
    setFeedback("");
    setError("");
  }, [
    activeVersionId,
    request?.wetroomFollowUpVersionId,
    request?.wetroomFollowUpEnabled,
    request?.wetroomFollowUpFirstDays,
    request?.wetroomFollowUpRepeatDays,
    request?.wetroomFollowUpMaxReminders,
  ]);

  const visible = Boolean(
    request?.status === "Tilbud" &&
    activeVersionId &&
    request?.publicToken
  );

  if (!visible) return null;

  async function savePlan() {
    if (busy) return;
    if (!client?.rpc) {
      setError("Supabase er ikke tilgjengelig.");
      return;
    }

    const safeFirst = boundedInteger(firstDays, DEFAULT_FIRST_DAYS, 1, 90);
    const safeRepeat = boundedInteger(repeatDays, DEFAULT_REPEAT_DAYS, 1, 90);
    const safeMax = boundedInteger(maxReminders, DEFAULT_MAX_REMINDERS, 1, 10);
    setFirstDays(safeFirst);
    setRepeatDays(safeRepeat);
    setMaxReminders(safeMax);
    setBusy(true);
    setFeedback("");
    setError("");

    try {
      const { data, error: rpcError } = await client.rpc("set_wetroom_offer_follow_up_config", {
        requested_request_ref: String(request?.id || "").trim(),
        requested_version_id: activeVersionId,
        requested_enabled: Boolean(enabled),
        requested_first_days: safeFirst,
        requested_repeat_days: safeRepeat,
        requested_max_reminders: safeMax,
      });
      if (rpcError) throw rpcError;
      setFeedback(
        data?.enabled
          ? `Automatisk oppfølging er aktivert for tilbudsversjon v${activeVersionNumber || "-"}.`
          : `Automatisk oppfølging er slått av for tilbudsversjon v${activeVersionNumber || "-"}.`
      );
    } catch (saveError) {
      setError(saveError?.message || "Kunne ikke lagre oppfølgingsplanen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto 30px", padding: "0 18px" }}>
      <section className="sales-form-preview" style={{ margin: 0 }}>
        <p className="sales-eyebrow" style={{ marginBottom: 4 }}>Våtromstilbud</p>
        <h2 style={{ margin: "0 0 7px" }}>Automatisk oppfølging</h2>
        <p className="sales-subtitle" style={{ margin: 0 }}>
          Planen gjelder kun publisert tilbudsversjon v{activeVersionNumber || "-"}. Eldre versjoner påvirkes ikke, og en ny publisert versjon må få sin egen plan.
        </p>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16, fontWeight: 800 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => {
              setEnabled(event.target.checked);
              setFeedback("");
            }}
          />
          <span>Send automatiske påminnelser dersom kunden ikke har svart</span>
        </label>

        {enabled ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 14 }}>
            <label className="sales-field">
              <span>Første påminnelse etter</span>
              <input type="number" min="1" max="90" value={firstDays} onChange={(event) => setFirstDays(event.target.value)} />
              <small>Dager etter utsendelse eller aktivering av planen, det som skjer sist.</small>
            </label>
            <label className="sales-field">
              <span>Gjenta hver</span>
              <input type="number" min="1" max="90" value={repeatDays} onChange={(event) => setRepeatDays(event.target.value)} />
              <small>Dager mellom automatiske påminnelser.</small>
            </label>
            <label className="sales-field">
              <span>Maks antall påminnelser</span>
              <input type="number" min="1" max="10" value={maxReminders} onChange={(event) => setMaxReminders(event.target.value)} />
              <small>Deretter må saken vurderes manuelt.</small>
            </label>
          </div>
        ) : (
          <p className="sales-subtitle" style={{ margin: "12px 0 0" }}>
            Ingen automatiske påminnelser sendes. Manuell oppfølging fungerer som før.
          </p>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
          <button type="button" className="sales-secondary-button" onClick={savePlan} disabled={busy}>
            {busy ? "Lagrer …" : "Lagre oppfølgingsplan"}
          </button>
          {feedback ? <strong style={{ color: "#176b42" }}>{feedback}</strong> : null}
          {error ? <strong style={{ color: "#a83232" }}>{error}</strong> : null}
        </div>
      </section>
    </div>
  );
}
