// Expo ProffDok – FASE 18 / FASE 45B
// Separat inngang for utvikling/testing. 45B bruker samme side til autentisert,
// skrivebeskyttet kundepreview av en lagret tilbudskladd.

import React from "react";
import { createRoot } from "react-dom/client";
import SalesModule from "./SalesModule";
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

createRoot(previewRoot).render(
  <React.StrictMode>
    {offerPreview ? <SalesDraftCustomerPreview /> : <SalesModule />}
  </React.StrictMode>
);
