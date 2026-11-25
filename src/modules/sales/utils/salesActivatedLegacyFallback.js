// Expo ProffDok – FASE 45B
// Smal kompatibilitetslogikk for eldre/seedede Sales-saker som er Aktivert,
// men mangler projectActivatedAt/surveyDate. Ingen backenddata endres her.

export const LEGACY_SURVEY_PLANNING_PROMPT =
  "Registrer dato, tidspunkt, ansvarlig og en kort intern merknad. Når planen lagres flyttes saken til Befaring.";

export function needsActivatedContractFallback(request = {}, { storeOffer = false } = {}) {
  return Boolean(
    !storeOffer &&
      String(request?.status || "").trim() === "Aktivert" &&
      !String(request?.projectActivatedAt || "").trim()
  );
}

export function shouldHideLegacySurveyPlanningPrompt(request = {}) {
  const status = String(request?.status || "").trim();
  return !["Forespørsel", "Befaring"].includes(status);
}

export function asAcceptedContractRequest(request = {}) {
  if (String(request?.status || "").trim() !== "Aktivert") return request;
  return { ...request, status: "Akseptert" };
}
