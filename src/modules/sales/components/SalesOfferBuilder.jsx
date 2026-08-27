// Expo ProffDok – FASE 31A1
// Stopper ugyldige prisverdier i tilbudsbyggeren før den eldre generiske
// valideringen og peker brukeren direkte til aktuell linje/opsjon.
// Norsk prisformat som 1600,- beholdes, mens enhetstekst som «lm» må ligge utenfor prisfeltet.
// Ingen SQL/RLS/Storage/Edge-endring.
// Expo ProffDok – FASE 30C2
// React-wrapper for tilbudsbyggeren som viser recovery-valg som en varig modal.
// Dialogen kan ikke tolke fokusbytte, Escape eller lukking som et valg.
// Recovery remounter kun SalesModule, aldri hele ProffDok-vinduet.
// FASE 30C2 UX: Nettstatus og serverstatus vises eksplisitt. Brukeren får aldri
// beskjed om bekreftet serverlagring når enheten er offline eller serverkallet feiler.

import { useEffect, useState } from "react";
import SalesOfferBuilderCore from "./SalesOfferBuilderCore.jsx";
import { STORAGE_KEY } from "../constants/salesConstants.js";
import {
  getPendingOfferDraftRecovery,
  resolvePendingOfferDraftRecovery,
} from "../services/salesLocalStorage.js";

const RECOVERY_TRANSITION_GUARD_MS = 2 * 60 * 1000;
const RECOVERY_DECISION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function formatRecoveryTime(value) {
  const time = Date.parse(value || "");
  if (!time) return "ukjent tidspunkt";

  try {
    return new Date(time).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value || "ukjent tidspunkt";
  }
}

function parseStorageJson(storage, key) {
  try {
    const value = storage?.getItem?.(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function findPendingRecoveryStorageKey(requestId) {
  if (typeof window === "undefined" || !window.localStorage || !requestId) {
    return "";
  }

  const storage = window.localStorage;
  const prefix = `${STORAGE_KEY}:offer-recovery-pending:`;
  const suffix = `:${requestId}`;

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix) && key.endsWith(suffix)) return key;
  }

  return "";
}

function getLatestConfirmedServerBaseline(requestId) {
  if (typeof window === "undefined" || !window.localStorage || !requestId) {
    return null;
  }

  const storage = window.localStorage;
  const prefix = `${STORAGE_KEY}:offer-server-baseline:`;
  const suffix = `:${requestId}`;
  const candidates = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix) || !key.endsWith(suffix)) continue;
    const baseline = parseStorageJson(storage, key);
    if (!baseline) continue;
    candidates.push({
      baseline,
      observedAt: Date.parse(baseline.observedAt || "") || 0,
    });
  }

  return candidates.sort((a, b) => b.observedAt - a.observedAt)[0]?.baseline || null;
}

function rememberRecoveredLocalChoiceAgainstServer(requestId, recovery) {
  if (
    recovery?.type !== "history" ||
    typeof window === "undefined" ||
    !window.localStorage
  ) {
    return;
  }

  const storage = window.localStorage;
  const recoveredLive = parseStorageJson(storage, recovery.liveKey);
  const baseline = getLatestConfirmedServerBaseline(requestId);
  const localSavedAt = Date.parse(recoveredLive?.savedAt || "") || 0;
  const serverSavedAt = Date.parse(
    baseline?.offerDraftSavedAt || baseline?.serverSavedAt || baseline?.observedAt || ""
  ) || 0;

  if (!localSavedAt || !serverSavedAt || localSavedAt <= serverSavedAt) return;

  const decisionKey = [
    "server",
    requestId,
    localSavedAt,
    serverSavedAt,
  ].join(":");
  const storageKey = `${STORAGE_KEY}:offer-recovery-decision:${decisionKey}`;
  const now = Date.now();

  try {
    storage.setItem(
      storageKey,
      JSON.stringify({
        choice: "local",
        decidedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + RECOVERY_DECISION_MAX_AGE_MS).toISOString(),
      })
    );
  } catch {
    // Hvis nettleserlagringen feiler, vil recovery-dialogen heller vises igjen
    // enn at lokal data overskrives stille.
  }
}

function installRecoveryTransitionGuard(storageKey, recovery) {
  if (
    !storageKey ||
    !recovery ||
    typeof window === "undefined" ||
    !window.localStorage
  ) {
    return;
  }

  const now = Date.now();

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...recovery,
        type: "transition",
        transitionFrom: recovery.type || "",
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + RECOVERY_TRANSITION_GUARD_MS).toISOString(),
      })
    );
  } catch {
    // Overgangsvakten er ekstra beskyttelse. Eksisterende beslutning beholdes.
  }
}

function getSaveStatus(status) {
  if (status === "offline") {
    return {
      className: "sales-offer-save-offline",
      text: "⚠ Lagret lokalt – venter på server.",
    };
  }
  if (status === "saving") {
    return {
      className: "sales-offer-save-saving",
      text: "Lagrer på server …",
    };
  }
  if (status === "saved") {
    return {
      className: "sales-offer-save-saved",
      text: "✓ Lagret på server.",
    };
  }
  if (status === "error") {
    return {
      className: "sales-offer-save-error",
      text: "⚠ Lagret lokalt – serveren er ikke tilgjengelig. Endringene beholdes på denne enheten.",
    };
  }
  return {
    className: "sales-offer-save-idle",
    text: "Kladden lagres automatisk lokalt og på server.",
  };
}

function isValidOfferAmount(value) {
  let normalized = String(value ?? "").trim().replace(/\s/g, "");
  if (!normalized) return true;

  normalized = normalized.replace(/,-$/, "").replace(/\.-$/, "").replace(",", ".");
  if (!normalized) return false;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;

  return Number.isFinite(Number(normalized));
}

function findInvalidOfferAmount(offerForm = {}) {
  const lines = Array.isArray(offerForm.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm.options) ? offerForm.options : [];

  const invalidLine = lines.find(
    (line) => String(line?.amount ?? "").trim() && !isValidOfferAmount(line.amount)
  );
  if (invalidLine) {
    return {
      kind: "line",
      id: invalidLine.id,
      value: String(invalidLine.amount || ""),
      title: invalidLine.description || invalidLine.mainPostTitle || "Tilbudslinje",
    };
  }

  const invalidOption = options.find(
    (option) =>
      String(option?.amount ?? "").trim() && !isValidOfferAmount(option.amount)
  );
  if (invalidOption) {
    return {
      kind: "option",
      id: invalidOption.id,
      value: String(invalidOption.amount || ""),
      title: invalidOption.title || invalidOption.mainPostTitle || "Opsjon",
    };
  }

  return null;
}

export default function SalesOfferBuilder(props) {
  const requestId = String(props?.selectedRequest?.id || "");
  const [recovery, setRecovery] = useState(() =>
    getPendingOfferDraftRecovery(requestId)
  );
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine !== false
  );
  const [amountValidation, setAmountValidation] = useState(null);

  useEffect(() => {
    const refreshNetworkStatus = () => {
      setIsOnline(navigator.onLine !== false);
    };

    refreshNetworkStatus();
    window.addEventListener("online", refreshNetworkStatus);
    window.addEventListener("offline", refreshNetworkStatus);

    return () => {
      window.removeEventListener("online", refreshNetworkStatus);
      window.removeEventListener("offline", refreshNetworkStatus);
    };
  }, []);

  useEffect(() => {
    const refreshRecovery = () => {
      setRecovery(getPendingOfferDraftRecovery(requestId));
    };

    refreshRecovery();
    window.addEventListener("expo-proffdok-offer-recovery", refreshRecovery);
    window.addEventListener("storage", refreshRecovery);
    window.addEventListener("focus", refreshRecovery);

    return () => {
      window.removeEventListener("expo-proffdok-offer-recovery", refreshRecovery);
      window.removeEventListener("storage", refreshRecovery);
      window.removeEventListener("focus", refreshRecovery);
    };
  }, [requestId]);

  useEffect(() => {
    if (recovery?.type !== "transition") return undefined;

    const timer = window.setInterval(() => {
      const next = getPendingOfferDraftRecovery(requestId);
      if (!next || next.type !== "transition") {
        window.clearInterval(timer);
        setRecovery(next);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [recovery?.type, requestId]);

  useEffect(() => {
    if (!recovery || recovery.type === "transition") return undefined;

    const blockEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("keydown", blockEscape, true);
    return () => window.removeEventListener("keydown", blockEscape, true);
  }, [recovery]);

  function chooseRecovery(choice) {
    if (!recovery || recovery.type === "transition" || !requestId) return;

    const pendingStorageKey = findPendingRecoveryStorageKey(requestId);
    const resolved = resolvePendingOfferDraftRecovery(requestId, choice);
    if (!resolved) {
      setRecovery(getPendingOfferDraftRecovery(requestId));
      return;
    }

    if (choice === "local") {
      rememberRecoveredLocalChoiceAgainstServer(requestId, recovery);
    }

    installRecoveryTransitionGuard(pendingStorageKey, recovery);
    setRecovery({ ...recovery, type: "transition" });

    window.dispatchEvent(
      new CustomEvent("expo-proffdok-sales-rehydrate", {
        detail: { requestId },
      })
    );
  }

  function validateOfferAmounts(event) {
    const invalidAmount = findInvalidOfferAmount(props.offerForm);
    if (!invalidAmount) return false;

    event?.preventDefault?.();
    event?.stopPropagation?.();
    setAmountValidation(invalidAmount);
    return true;
  }

  function handleValidatedSaveOffer(event) {
    if (validateOfferAmounts(event)) return false;
    return props.handleSaveOffer?.(event);
  }

  function handleValidatedSaveOfferTemplate(...args) {
    if (validateOfferAmounts()) return;
    return props.handleSaveOfferTemplate?.(...args);
  }

  function focusInvalidAmount() {
    const validation = amountValidation;
    setAmountValidation(null);
    if (!validation?.id || typeof document === "undefined") return;

    const tryFocus = () => {
      const selector =
        validation.kind === "option"
          ? `[data-offer-option-id="${validation.id}"]`
          : `[data-offer-line-id="${validation.id}"]`;

      let card = document.querySelector(selector);
      if (!card) {
        card = Array.from(document.querySelectorAll(".sales-offer-line")).find((candidate) =>
          Array.from(candidate.querySelectorAll("input")).some(
            (input) => String(input.value ?? "").trim() === validation.value.trim()
          )
        );
      }
      if (!card) return false;

      const inputs = Array.from(card.querySelectorAll("input"));
      const amountInput =
        inputs.find(
          (input) => String(input.value ?? "").trim() === validation.value.trim()
        ) || inputs.find((input) => input.getAttribute("placeholder") === "0");

      card.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });

      if (amountInput) {
        amountInput.focus({ preventScroll: true });
        amountInput.select?.();
      }
      return true;
    };

    // Dialogen må først være fjernet av React. Første forsøk er raskt,
    // de neste dekker tregere render/scroll i store tilbud.
    [0, 80, 220].forEach((delay) => {
      window.setTimeout(tryFocus, delay);
    });
  }

  const visibleRecovery = recovery?.type === "transition" ? null : recovery;
  const isHistoryRecovery = visibleRecovery?.type === "history";
  const localTime = isHistoryRecovery
    ? visibleRecovery?.recoverySavedAtText
    : visibleRecovery?.localSavedAtText;
  const otherTime = isHistoryRecovery
    ? visibleRecovery?.liveSavedAtText
    : visibleRecovery?.serverSavedAtText;
  const effectiveOfferDraftSaveStatus = isOnline
    ? props.offerDraftSaveStatus
    : "offline";
  const saveStatus = getSaveStatus(effectiveOfferDraftSaveStatus);

  return (
    <>
      <style>{`
        .sales-offer-save-scope .sales-form-hero > p.sales-subtitle:last-child {
          display: none;
        }
        .sales-offer-save-scope .sales-form-hero::after {
          display: block;
          margin-top: 8px;
          font-size: 0.98rem;
          line-height: 1.45;
          color: #42606b;
        }
        .sales-offer-save-saved .sales-form-hero::after {
          content: "✓ Lagret på server.";
          color: #176b42;
          font-weight: 750;
        }
        .sales-offer-save-saving .sales-form-hero::after {
          content: "Lagrer på server …";
        }
        .sales-offer-save-offline .sales-form-hero::after {
          content: "⚠ Lagret lokalt – venter på server.";
          color: #8a5a00;
          font-weight: 750;
        }
        .sales-offer-save-error .sales-form-hero::after {
          content: "⚠ Lagret lokalt – serveren er ikke tilgjengelig. Endringene beholdes på denne enheten.";
          color: #9a3412;
          font-weight: 750;
        }
        .sales-offer-save-idle .sales-form-hero::after {
          content: "Kladden lagres automatisk lokalt og på server.";
        }
      `}</style>

      <div
        className={`sales-offer-save-scope ${saveStatus.className}`}
        style={{ display: "contents" }}
      >
        <span
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {saveStatus.text}
        </span>
        <SalesOfferBuilderCore
          {...props}
          handleSaveOffer={handleValidatedSaveOffer}
          handleSaveOfferTemplate={handleValidatedSaveOfferTemplate}
          offerDraftSaveStatus={effectiveOfferDraftSaveStatus}
        />
      </div>

      {amountValidation ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-offer-amount-validation-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 25000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(15, 23, 42, 0.52)",
          }}
        >
          <div
            style={{
              width: "min(92vw, 560px)",
              padding: 22,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
            }}
          >
            <h2
              id="sales-offer-amount-validation-title"
              style={{ margin: "0 0 10px", fontSize: 20 }}
            >
              Kontroller prisfeltet
            </h2>
            <p style={{ margin: "0 0 12px", lineHeight: 1.55 }}>
              Beløpet <strong>{amountValidation.value}</strong> på «{amountValidation.title}»
              kan ikke brukes som pris.
            </p>
            <p style={{ margin: "0 0 18px", lineHeight: 1.55 }}>
              Prisfeltet kan inneholde tall, komma/punktum, minus og norsk avslutning
              som <strong>1600,-</strong>. Enhet som <strong>lm</strong>, <strong>stk</strong>
              eller <strong>m²</strong> skal ikke stå i selve prisfeltet.
            </p>
            <button
              className="sales-primary-button"
              type="button"
              onClick={focusInvalidAmount}
              autoFocus
            >
              OK – gå til prisfeltet
            </button>
          </div>
        </div>
      ) : null}

      {visibleRecovery ? (
        <div
          data-sales-offer-recovery-dialog="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-offer-recovery-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(15, 23, 42, 0.62)",
          }}
        >
          <div
            style={{
              width: "min(94vw, 620px)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 28px 90px rgba(15, 23, 42, 0.35)",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#0891b2",
              }}
            >
              Tilbudssikkerhet
            </p>
            <h2
              id="sales-offer-recovery-title"
              style={{ margin: "0 0 12px", fontSize: 24, lineHeight: 1.2 }}
            >
              {isHistoryRecovery
                ? "Lokal sikkerhetskopi funnet"
                : "Nyere lokal kladd funnet"}
            </h2>

            <p style={{ margin: "0 0 16px", lineHeight: 1.55 }}>
              {isHistoryRecovery
                ? "Vi fant en lokal sikkerhetskopi med mer innhold enn siste kladd. Velg hvilken versjon du vil fortsette med."
                : "Denne enheten har en nyere tilbudskladd enn den siste versjonen som er bekreftet av serveren. Velg hvilken versjon du vil fortsette med."}
            </p>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginBottom: 18,
                padding: 16,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #dbe7ee",
              }}
            >
              <div>
                <strong>
                  Lokal sikkerhetskopi: {Number(visibleRecovery.localLines || 0)} tilbudslinjer og {Number(visibleRecovery.localOptions || 0)} opsjoner
                </strong>
                <div style={{ marginTop: 3, color: "#52616b", fontSize: 14 }}>
                  {formatRecoveryTime(localTime)}
                </div>
              </div>
              <div>
                <strong>
                  {isHistoryRecovery ? "Siste kladd" : "Server"}: {Number(visibleRecovery.serverLines || 0)} tilbudslinjer og {Number(visibleRecovery.serverOptions || 0)} opsjoner
                </strong>
                <div style={{ marginTop: 3, color: "#52616b", fontSize: 14 }}>
                  {formatRecoveryTime(otherTime)}
                </div>
              </div>
            </div>

            <p
              style={{
                margin: "0 0 18px",
                padding: "11px 13px",
                borderRadius: 12,
                background: "#ecfeff",
                color: "#164e63",
                lineHeight: 1.45,
                fontWeight: 650,
              }}
            >
              Autosave er stoppet mens dette valget står åpent. Fokusskifte eller Escape velger ingenting.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="sales-secondary-button"
                onClick={() => chooseRecovery("server")}
              >
                {isHistoryRecovery
                  ? `Behold siste ${Number(visibleRecovery.serverLines || 0)} linjer`
                  : `Bruk serverens ${Number(visibleRecovery.serverLines || 0)} linjer`}
              </button>
              <button
                type="button"
                className="sales-primary-button"
                data-sales-offer-recovery-local="true"
                onClick={() => chooseRecovery("local")}
                autoFocus
              >
                Gjenopprett {Number(visibleRecovery.localLines || 0)} linjer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}