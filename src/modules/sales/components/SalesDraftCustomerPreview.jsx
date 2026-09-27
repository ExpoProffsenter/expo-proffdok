// Expo ProffDok – FASE 45B
// Autentisert, skrivebeskyttet forhåndsvisning av tilbudskladden i samme
// kundepresentasjon som publisert tilbud. Denne komponenten publiserer ikke,
// oppretter ingen kundelenke og sender ingen e-post.

import { useEffect, useMemo, useState } from "react";
import SalesCustomerView from "./SalesCustomerView.jsx";
import { fetchSalesCompanyProfile } from "../services/salesCommunication.js";
import {
  createDefaultSalesSupabaseClient,
  fetchSalesRequestDetailRow,
  getSalesSession,
  resolveSalesCompanyScope,
} from "../services/salesSupabase.js";
import { buildOfferSnapshot } from "../utils/salesOfferLogic.js";

function getPreviewRequestRef() {
  if (typeof window === "undefined") return "";
  return String(new URLSearchParams(window.location.search).get("offerPreview") || "").trim();
}

function normalizeDraftForPreview(request = {}) {
  return {
    ...request,
    offerLines: (Array.isArray(request.offerLines) ? request.offerLines : []).filter(
      (line) => !line?.__offerTermsMeta && !(line?.__companyMeta && !line?.__storeOfferMeta)
    ),
  };
}

function companyFields(profile = {}) {
  return {
    companyName: profile.companyName || "",
    companyOrgNumber: profile.orgNumber || "",
    companyAddress: profile.address || "",
    companyPhone: profile.phone || "",
    companyEmail: profile.email || "",
    companyWebsite: profile.website || "",
    companyLogoUrl: profile.logoUrl || "/expo-logo.png",
  };
}

function buildPreviewRequest(request, companyProfile) {
  const source = normalizeDraftForPreview(request);
  const snapshot = buildOfferSnapshot(
    source,
    companyProfile,
    new Date().toISOString(),
    `draft-customer-preview-${String(source.id || "offer")}`
  );

  return {
    ...source,
    ...companyFields(companyProfile),
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Forhåndsvisning",
    offerVersions: [snapshot],
    sentOfferVersionId: snapshot.id,
    // Bevisst tomt: kundepresentasjonen skal vise «Ikke sendt».
    sentOfferVersionNumber: null,
    publicToken: "",
    isPublicOffer: true,
    acceptedAt: "",
    acceptedBy: "",
  };
}

export default function SalesDraftCustomerPreview() {
  const requestRef = useMemo(getPreviewRequestRef, []);
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [acceptanceForm, setAcceptanceForm] = useState({
    name: "",
    confirmed: false,
    selectedOptionIds: [],
  });

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      setLoading(true);
      setError("");
      try {
        if (!client || !requestRef) throw new Error("Tilbudet kunne ikke identifiseres.");

        const { data: sessionData } = await getSalesSession(client);
        if (!sessionData?.session?.user?.id) {
          throw new Error("Du må være innlogget i Expo ProffDok for å forhåndsvise en tilbudskladd.");
        }

        const { data: companyId, error: companyError } = await resolveSalesCompanyScope(client);
        if (companyError || !companyId) {
          throw companyError || new Error("Firmaet kunne ikke bekreftes.");
        }

        const [{ data: row, error: requestError }, profile] = await Promise.all([
          fetchSalesRequestDetailRow(client, companyId, requestRef),
          fetchSalesCompanyProfile(client),
        ]);
        if (requestError || !row?.payload) {
          throw requestError || new Error("Tilbudskladden finnes ikke i valgt firma.");
        }
        if (!profile?.companyName) {
          throw new Error("Firmaprofilen kunne ikke hentes for forhåndsvisningen.");
        }

        const payload = { ...(row.payload || {}), id: row.request_ref || row.payload?.id || requestRef };
        if (!Array.isArray(payload.offerLines) || !payload.offerLines.some((line) => !line?.__companyMeta && !line?.__offerTermsMeta)) {
          throw new Error("Tilbudet har ingen kundesynlige poster ennå.");
        }

        if (!active) return;
        setCompanyProfile(profile);
        setRequest(buildPreviewRequest(payload, profile));
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.message || "Kunne ikke åpne kundens forhåndsvisning.");
        setRequest(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPreview();
    return () => {
      active = false;
    };
  }, [client, requestRef]);

  function toggleAcceptedOption(optionId) {
    if (!request) return;
    const option = (request.offerOptions || []).find((item) => String(item?.id) === String(optionId));
    setAcceptanceForm((current) => {
      const selected = new Set((current.selectedOptionIds || []).map(String));
      const id = String(optionId || "");
      if (selected.has(id)) selected.delete(id);
      else {
        if (option?.optionType === "alternative" && option?.replacementLineId) {
          (request.offerOptions || []).forEach((candidate) => {
            if (
              candidate?.optionType === "alternative" &&
              String(candidate?.replacementLineId || "") === String(option.replacementLineId) &&
              String(candidate?.id || "") !== id
            ) {
              selected.delete(String(candidate.id));
            }
          });
        }
        selected.add(id);
      }
      return { ...current, selectedOptionIds: [...selected] };
    });
  }

  if (loading || error || !request) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel" role={error ? "alert" : "status"}>
              <p className="sales-eyebrow">Forhåndsvisning</p>
              <h1 className="sales-title">{error ? "Kundetilbudet kunne ikke forhåndsvises" : "Henter tilbudskladden …"}</h1>
              <p className="sales-subtitle">{error || "Visningen bygges direkte fra den lagrede kladden uten publisering eller utsending."}</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-draft-customer-preview">
      <div className="sales-draft-preview-banner" role="status">
        <strong>Forhåndsvisning – ikke sendt til kunde</strong>
        <span>Dette er kundens visning av den lagrede kladden. Opsjonsvalg her er kun lokal test og lagres ikke.</span>
      </div>
      <style>{`
        .sales-draft-customer-preview .sales-customer-accept-form,
        .sales-draft-customer-preview .store-customer-decision-shell { display:none!important; }
        .sales-draft-preview-banner{position:sticky;top:0;z-index:30000;display:flex;justify-content:center;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 16px;background:#fff7d6;border-bottom:1px solid #e4c15d;color:#4a3810;box-shadow:0 4px 18px rgba(50,42,18,.08)}
        .sales-draft-preview-banner strong{font-weight:900}.sales-draft-preview-banner span{font-size:13px;font-weight:650}
      `}</style>
      <SalesCustomerView
        mode="customer-offer"
        selectedRequest={request}
        companyProfile={companyProfile || {}}
        acceptanceForm={acceptanceForm}
        setAcceptanceForm={setAcceptanceForm}
        toggleAcceptedOption={toggleAcceptedOption}
        handleAcceptOffer={(event) => event?.preventDefault?.()}
        onBack={() => window.close()}
      />
    </div>
  );
}
