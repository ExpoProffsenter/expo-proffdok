// Expo ProffDok – FASE 18
// Isolert preview-inngang for Befaring / Tilbud / Aksept.
//
// Denne filen brukes kun til separat utvikling og testing.
// Den er IKKE koblet til produksjons-main.jsx.

import React from "react";
import { createRoot } from "react-dom/client";
import SalesModule from "./SalesModule";

const previewRoot = document.getElementById("sales-preview-root");

if (!previewRoot) {
  throw new Error("sales-preview-root ble ikke funnet.");
}

createRoot(previewRoot).render(
  <React.StrictMode>
    <SalesModule />
  </React.StrictMode>
);
