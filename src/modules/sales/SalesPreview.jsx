// Expo ProffDok – FASE 18 / FASE 45B
// Separat inngang for utvikling/testing. 45B bruker samme side til autentisert,
// skrivebeskyttet kundepreview av en lagret tilbudskladd.
// Kundepreview importerer bevisst ikke SalesModule/recovery-runtime.

import React from "react";
import { createRoot } from "react-dom/client";
import SalesDraftCustomerPreview from "./components/SalesDraftCustomerPreview.jsx";
import "./sales.css";

const previewRoot = document.getElementById("sales-preview-root");

if (!previewRoot) {
  throw new Error("sales-preview-root ble ikke funnet.");
}

const offerPreview =
  typeof window !== "undefined"
    ? String(new URLSearchParams(window.location.search).get("offerPreview") || "").trim()
    : "";

const root = createRoot(previewRoot);

if (offerPreview) {
  root.render(
    <React.StrictMode>
      <SalesDraftCustomerPreview />
    </React.StrictMode>
  );
} else {
  import("./SalesModule.jsx")
    .then(({ default: SalesModule }) => {
      root.render(
        <React.StrictMode>
          <SalesModule />
        </React.StrictMode>
      );
    })
    .catch((error) => {
      console.error("Kunne ikke starte Sales preview:", error);
      root.render(
        <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
          <h1>Preview kunne ikke åpnes</h1>
          <p>Last siden på nytt og prøv igjen.</p>
        </main>
      );
    });
}
