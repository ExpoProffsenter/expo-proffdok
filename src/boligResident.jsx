import React from "react";
import { createRoot } from "react-dom/client";
import BoligResidentPage from "./modules/bolig/BoligResidentPage.jsx";
import "./modules/bolig/boligResident.css";
import BoligPortalPage from "./modules/bolig/BoligPortalPage.jsx";
createRoot(document.getElementById("root")).render(window.location.hash.startsWith("#portal=") ? <BoligPortalPage/> : <BoligResidentPage/>);
