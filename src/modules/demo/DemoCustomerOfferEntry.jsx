// Expo ProffDok – FASE 42L
// Isolert Kenneth-only kundevisning for demosuiten. Kjøres i egen browserfane og
// påvirker ikke intern Sales-navigasjon/recovery i adminfanen.

import React from "react";
import { createRoot } from "react-dom/client";
import "../sales/sales.css";
import DemoCustomerOfferPreview from "./DemoCustomerOfferPreview.jsx";

const rootElement = document.getElementById("demo-customer-offer-root");

if (!rootElement) {
  throw new Error("demo-customer-offer-root ble ikke funnet.");
}

function closeDemoCustomerView() {
  window.close();
  window.setTimeout(() => {
    if (!window.closed) window.location.assign("/");
  }, 80);
}

createRoot(rootElement).render(
  <React.StrictMode>
    <DemoCustomerOfferPreview onClose={closeDemoCustomerView} />
  </React.StrictMode>
);
