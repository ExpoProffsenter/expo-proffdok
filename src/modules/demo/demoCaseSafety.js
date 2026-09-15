// Expo ProffDok – FASE 42L
// Felles, ren sikkerhetskontrakt for Demo/Test-saker.
// En sak er bare demo når både suite-markør og deterministisk DEMO42L-referanse stemmer.

export const DEMO_SUITE_KEY = "expo-proffdok-demo-42l";
export const DEMO_REQUEST_PREFIX = "DEMO42L-";
export const DEMO_OPERATOR_EMAIL = "kenneth@ringside.no";

export const DEMO_REQUEST_REFS = Object.freeze({
  request: "DEMO42L-01-FORESPORSEL",
  survey: "DEMO42L-02-BEFARING",
  offer: "DEMO42L-03-TILBUD",
  accepted: "DEMO42L-04-AKSEPTERT",
  project: "DEMO42L-05-PROSJEKT",
});

const DEMO_REQUEST_REF_SET = new Set(Object.values(DEMO_REQUEST_REFS));

export function isDemoOperatorEmail(email = "") {
  return String(email || "").trim().toLowerCase() === DEMO_OPERATOR_EMAIL;
}

export function assertDemoOperator(user = {}, workProfile = {}) {
  if (!workProfile?.is_systemadmin || !isDemoOperatorEmail(user?.email)) {
    throw new Error("Demo/Test er bare tilgjengelig for demoansvarlig.");
  }
  return true;
}

export function isDemoRequest(request = {}) {
  const requestRef = String(request?.id || request?.request_ref || "").trim();
  return Boolean(
    request?.demoCase === true &&
      request?.demoSuiteKey === DEMO_SUITE_KEY &&
      DEMO_REQUEST_REF_SET.has(requestRef)
  );
}

export function isDemoRequestRef(requestRef = "") {
  return DEMO_REQUEST_REF_SET.has(String(requestRef || "").trim());
}

export function isDemoProjectData(data = {}) {
  const project = data?.project || {};
  const requestRef = String(project?.salesOrigin?.requestRef || "").trim();
  return Boolean(
    project?.demoCase === true &&
      project?.demoSuiteKey === DEMO_SUITE_KEY &&
      isDemoRequestRef(requestRef)
  );
}

export function demoActionBlockedMessage(action = "handlingen") {
  return `Demo/Test: ${action} er sperret for å unngå e-post, låste dokumenter eller historikk i produksjonsdata. Bruk neste ferdige demosak for å vise neste steg.`;
}
