// Expo ProffDok – FASE 31A2B
// Samme createAcceptanceProofPdf-kontrakt som før, men med profesjonell A4-presentasjon.
// Akseptlogikk, lagring, Storage-path og låsing beholdes uendret.

import { createAcceptanceProofPdfPolished } from "./salesAcceptancePdfPolished.js";

export async function createAcceptanceProofPdf(args = {}) {
  return createAcceptanceProofPdfPolished(args);
}
