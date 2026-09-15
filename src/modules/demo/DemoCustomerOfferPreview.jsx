// Expo ProffDok – FASE 42L
// Read-only demo av den eksisterende kundevisningen. Opsjoner kan klikkes for å
// demonstrere totalsum, men digital aksept stoppes lokalt og skriver ingenting.

import React, { useEffect, useState } from "react";
import SalesCustomerViewCore from "../sales/components/SalesCustomerViewCore.jsx";
import { loadDemoCustomerOfferPreview } from "./demoOfferPreviewClient.js";

export default function DemoCustomerOfferPreview({ onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [acceptanceForm, setAcceptanceForm] = useState({
    name: "Demo Kunde",
    confirmed: false,
    selectedOptionIds: [],
  });

  useEffect(() => {
    let cancelled = false;
    loadDemoCustomerOfferPreview()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError?.message || "Kundevisningen kunne ikke lastes.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAcceptedOption = (optionId) => {
    setAcceptanceForm((current) => ({
      ...current,
      selectedOptionIds: current.selectedOptionIds.includes(optionId)
        ? current.selectedOptionIds.filter((id) => id !== optionId)
        : [...current.selectedOptionIds, optionId],
    }));
  };

  const handleAcceptOffer = (event) => {
    event?.preventDefault?.();
    window.alert(
      "Demo/Test: Dette er kundevisningen av et demotilbud. Digital aksept er sperret og ingenting lagres."
    );
  };

  return (
    <div
      data-demo-customer-offer-preview
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        overflow: "auto",
        background: "#eef6f8",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100001,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: "#fff7d6",
          borderBottom: "1px solid #e5b83c",
          color: "#674d00",
          fontWeight: 850,
        }}
      >
        <span>DEMO / TEST · Kundevisning · Ingen e-post eller aksept lagres</span>
        <button type="button" className="secondary" onClick={onClose}>
          Lukk kundevisning
        </button>
      </div>

      {error ? (
        <div className="item" style={{ margin: 20, color: "#991b1b", fontWeight: 800 }}>
          {error}
        </div>
      ) : !data ? (
        <div className="item" style={{ margin: 20 }}>Laster demoens kundevisning …</div>
      ) : (
        <SalesCustomerViewCore
          mode="customer-offer"
          selectedRequest={data.request}
          companyProfile={data.companyProfile}
          acceptanceForm={acceptanceForm}
          setAcceptanceForm={setAcceptanceForm}
          toggleAcceptedOption={toggleAcceptedOption}
          handleAcceptOffer={handleAcceptOffer}
          onBack={onClose}
        />
      )}
    </div>
  );
}
