// Expo ProffDok – FASE 41B.5B
// Lar en eksisterende Befaring fortsette som Våtromstilbud eller Butikktilbud.
// Samme salgssak beholdes; kunde, befaring, bilder og historikk flyttes ikke til ny sak.
// Ingen prosjektopprettelse skjer i denne overgangen.

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  hasModuleAccess,
  readCachedModuleAccess,
} from "../access/moduleAccessClient.js";
import {
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "../access/workProfileClient.js";
import {
  createDefaultSalesSupabaseClient,
  resolveSalesCompanyScope,
  upsertSalesRequests,
} from "./services/salesSupabase.js";
import {
  buildSalesStorageKey,
  loadRequests,
  loadSalesNavigation,
  saveRequests,
  saveSalesNavigation,
} from "./services/salesLocalStorage.js";
import { STORE_OFFER_SOURCE, isStoreOfferRequest } from "./services/salesStoreOffers.js";

const HOST_ID = "expo-store-offer-from-survey-picker";
const ALLOWED_STORE_COMPANIES = new Set([
  "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo",
]);

let root = null;
let rootHost = null;
let bypassNextOfferClick = false;
let originalOfferButton = null;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function destroyPicker() {
  root?.unmount?.();
  root = null;
  rootHost = null;
  originalOfferButton = null;
  document.getElementById(HOST_ID)?.remove();
}

function isOfferStartButton(button) {
  const text = compactText(button?.textContent);
  return text === "Opprett tilbud" || text === "Opprett tilbud uten befaringsnotat";
}

function canChooseStoreOffer() {
  const access = readCachedModuleAccess();
  return Boolean(access.loaded && hasModuleAccess(access, "store_offers"));
}

async function resolveContext() {
  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const sessionResult = await client.auth.getSession();
  const userId = String(sessionResult?.data?.session?.user?.id || "").trim();
  if (!userId) throw new Error("Innloggingen er ikke klar ennå.");

  let workProfile = readCachedWorkProfileState();
  if (!workProfile?.active_company_id || !workProfile?.active_company_profile) {
    workProfile = await getMyWorkProfileState();
  }

  const companyName = String(
    workProfile?.active_company_profile?.companyName ||
      workProfile?.active_company_profile?.company_name ||
      ""
  ).trim();
  if (!ALLOWED_STORE_COMPANIES.has(companyName)) {
    throw new Error("Butikktilbud kan bare opprettes for Ringside Rørleggerbedrift AS eller Bademiljø Expo.");
  }

  let companyId = String(workProfile?.active_company_id || "").trim();
  if (!companyId) {
    const { data, error } = await resolveSalesCompanyScope(client);
    if (error) throw error;
    companyId = String(
      typeof data === "string"
        ? data
        : data?.company_id || data?.id || data?.companyId || ""
    ).trim();
  }
  if (!companyId) throw new Error("Fant ikke aktivt firma for salgssaken.");

  const storageKey = buildSalesStorageKey({
    integrationMode: "app",
    companyName,
    userId,
  });
  const navigation = loadSalesNavigation(storageKey);
  const requestId = String(navigation?.selectedRequestId || "").trim();
  const requests = loadRequests(storageKey);
  const request = requests.find((item) => String(item?.id || "") === requestId);

  if (!request || request.status !== "Befaring") {
    throw new Error("Saken står ikke lenger i Befaring.");
  }
  if (isStoreOfferRequest(request)) {
    throw new Error("Saken er allerede et Butikktilbud.");
  }

  return { client, companyId, storageKey, requests, request };
}

async function convertSurveyToStoreOffer() {
  const context = await resolveContext();
  const now = new Date().toISOString();
  const request = context.request;
  const updatedRequest = {
    ...request,
    directOffer: true,
    source: STORE_OFFER_SOURCE,
    storeOfferFromSurvey: true,
    storeOfferConvertedFromSurveyAt: now,
    storeOfferOriginSource:
      request.storeOfferOriginSource || String(request.source || "").trim(),
  };
  const nextRequests = context.requests.map((item) =>
    String(item?.id || "") === String(request.id) ? updatedRequest : item
  );

  // Lokal cache oppdateres først slik at rehydrert Sales åpner riktig builder.
  // Ved serverfeil rulles cachen tilbake før brukeren får feilmelding.
  saveRequests(nextRequests, context.storageKey);

  const { error } = await upsertSalesRequests(context.client, [
    {
      company_id: context.companyId,
      request_ref: String(request.id),
      status: request.status || "Befaring",
      archived_at: request.archivedAt || null,
      payload: updatedRequest,
      updated_at: now,
    },
  ]);

  if (error) {
    saveRequests(context.requests, context.storageKey);
    throw error;
  }

  saveSalesNavigation(context.storageKey, "offer-builder", String(request.id));
  window.dispatchEvent(new Event("expo-proffdok-sales-rehydrate"));
}

function OfferTypePicker({ onWetroom, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function chooseStore() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await convertSurveyToStoreOffer();
      destroyPicker();
    } catch (conversionError) {
      setError(conversionError?.message || "Kunne ikke starte Butikktilbud fra befaringen.");
      setBusy(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 26000,
        display: "grid",
        placeItems: "center",
        padding: 18,
        background: "rgba(5,18,25,.46)",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-offer-type-title"
        style={{
          width: "min(560px,100%)",
          boxSizing: "border-box",
          padding: 22,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 24px 70px rgba(5,18,25,.3)",
        }}
      >
        <h2 id="survey-offer-type-title" style={{ margin: "0 0 7px" }}>
          Opprett tilbud fra befaring
        </h2>
        <p style={{ margin: "0 0 16px", color: "#52616b", lineHeight: 1.45 }}>
          Samme kunde, befaring, bilder og notater beholdes. Velg hvilken tilbudstype saken skal fortsette som.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={onWetroom}
            disabled={busy}
            style={{ textAlign: "left", padding: "14px 16px" }}
          >
            <strong style={{ display: "block" }}>Våtromstilbud</strong>
            <small style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
              Fortsett med dagens ordinære tilbudsbygger.
            </small>
          </button>

          <button
            type="button"
            className="secondary"
            onClick={chooseStore}
            disabled={busy}
            style={{ textAlign: "left", padding: "14px 16px" }}
          >
            <strong style={{ display: "block" }}>{busy ? "Starter Butikktilbud …" : "Butikktilbud"}</strong>
            <small style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
              Bruk vare-/produktbyggeren på den samme befaringssaken.
            </small>
          </button>
        </div>

        {error ? (
          <p style={{ margin: "12px 0 0", color: "#a33232", fontWeight: 700 }}>{error}</p>
        ) : null}

        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={onClose}
          style={{ marginTop: 14 }}
        >
          Avbryt
        </button>
      </section>
    </div>
  );
}

function openPicker(button) {
  originalOfferButton = button;
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);
  }
  if (!root) {
    rootHost = host;
    root = createRoot(host);
  }

  const continueWetroom = () => {
    const sourceButton = originalOfferButton;
    destroyPicker();
    if (!(sourceButton instanceof HTMLButtonElement)) return;
    bypassNextOfferClick = true;
    sourceButton.click();
  };

  root.render(
    <OfferTypePicker
      onWetroom={continueWetroom}
      onClose={destroyPicker}
    />
  );
}

function handleOfferStartClick(event) {
  if (bypassNextOfferClick) {
    bypassNextOfferClick = false;
    return;
  }

  const button = event.target instanceof Element
    ? event.target.closest("button")
    : null;
  if (!(button instanceof HTMLButtonElement) || !isOfferStartButton(button)) return;
  if (!canChooseStoreOffer()) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  openPicker(button);
}

export function installStoreOfferFromSurveyUx() {
  if (typeof window === "undefined" || window.__expoStoreOfferFromSurveyUxInstalled) return;
  window.__expoStoreOfferFromSurveyUxInstalled = true;
  document.addEventListener("click", handleOfferStartClick, true);
}
