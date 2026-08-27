// Expo ProffDok – FASE 31A2B
// Bruker ny A4-generator som speiler kundelinkens struktur og visuelle hierarki.
// Tidligere generator beholdes i salesOfferPdfCore.js som trygg rollback.
// Ingen lagring, SQL, RLS, Storage-policy eller Edge-logikk endres.

import { createPublishedOfferPdfPolished } from "./salesOfferPdfPolished.js";

export async function createPublishedOfferPdf(args = {}) {
  return createPublishedOfferPdfPolished(args);
}
