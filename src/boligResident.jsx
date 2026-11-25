import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import BoligResidentPage from "./modules/bolig/BoligResidentPage.jsx";
import "./modules/bolig/boligResident.css";
import BoligPortalPage from "./modules/bolig/BoligPortalPage.jsx";
const BoligPartnerPage = lazy(
  () => import("./modules/bolig/BoligPartnerPage.jsx"),
);
createRoot(document.getElementById("root")).render(
  window.location.hash.startsWith("#partner=") ? (
    <Suspense fallback={<p role="status">Henter samarbeidssiden …</p>}>
      <BoligPartnerPage />
    </Suspense>
  ) : window.location.hash.startsWith("#portal=") ? (
    <BoligPortalPage />
  ) : (
    <BoligResidentPage />
  ),
);
