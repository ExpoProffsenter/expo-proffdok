// Expo ProffDok – FASE 31A2B
// Bruker profesjonell A4-generator som speiler kundelinken og har robust paginering.
// Tidligere generatorer beholdes som trygg rollback. Ingen lagring/SQL/RLS/Storage/Edge-endring.

import { createPublishedOfferPdfPolishedV2 } from "./salesOfferPdfPolishedV2.js";

export async function createPublishedOfferPdf(args = {}) {
  return createPublishedOfferPdfPolishedV2(args);
}
