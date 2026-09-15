// Expo ProffDok – FASE 42L / FASE 31A2B
// Samme createAcceptanceProofPdf-kontrakt som før, men med profesjonell A4-presentasjon.
// FASE 42L stopper servermerkede demosaker før låst PDF/Storage kan opprettes.

import { demoActionBlockedMessage, isDemoRequest } from "../../demo/demoCaseSafety.js";
import { createAcceptanceProofPdfPolished } from "./salesAcceptancePdfPolished.js";

export async function createAcceptanceProofPdf(args = {}) {
  if (isDemoRequest(args?.selectedRequest || {})) {
    throw new Error(demoActionBlockedMessage("oppretting av akseptbevis"));
  }
  return createAcceptanceProofPdfPolished(args);
}
