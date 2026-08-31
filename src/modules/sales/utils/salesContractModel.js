// Expo ProffDok – FASE 33B.3
// Ren modell for den enkle forbrukerkontrakten. Akseptert tilbud forblir eget,
// låst avtalegrunnlag. Denne filen gjør ingen Supabase-, Storage- eller UI-kall.

import { getOfferTermsSnapshot } from "./salesUtils.js";

export const CONTRACT_VAT_FACTOR = 1.25;
export const DEFAULT_DAILY_PENALTY_GRACE_DAYS = 7;

export const AGREEMENT_CHANNELS = [
  {
    value: "business_premises",
    label: "I bedriftens faste forretningslokaler",
  },
  {
    value: "distance",
    label: "Digitalt eller per telefon",
  },
  {
    value: "customer_location",
    label: "Hos kunden eller annet sted utenfor bedriftens faste lokaler",
  },
];

export const PRICE_FORMS = [
  { value: "fixed", label: "Fastpris iht. akseptert tilbud" },
  { value: "estimate", label: "Prisoverslag" },
  { value: "maximum", label: "Høyeste pris" },
  { value: "hourly", label: "Regningsarbeid / timearbeid" },
];

export const DEFAULT_PAYMENT_PLAN = [
  {
    id: "startup",
    percent: 40,
    title: "Ved oppstart",
    description: "Forfall umiddelbart ved faktisk oppstart av arbeidene.",
  },
  {
    id: "milestone",
    percent: 40,
    title: "Ved hovedmilepæl",
    description:
      "Når flis-/overflatearbeidene i hovedsak er ferdigstilt og prosjektet går over i sluttmontasje.",
  },
  {
    id: "handover",
    percent: 20,
    title: "Etter overtagelse",
    description: "Forfall etter ferdigstillelse og signert overtagelse.",
  },
];

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toDateOnly(value = "") {
  const match = String(value || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function dateToIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function calculateExpectedFinishDate(startDate = "", durationWeeks = 0) {
  const start = toDateOnly(startDate);
  const weeks = toFiniteNumber(durationWeeks, 0);
  if (!start || weeks <= 0) return "";

  const result = new Date(start.getTime());
  result.setUTCDate(result.getUTCDate() + Math.round(weeks * 7));
  return dateToIsoDate(result);
}

function inferDurationWeeks(startDate = "", expectedFinishDate = "") {
  const start = toDateOnly(startDate);
  const finish = toDateOnly(expectedFinishDate);
  if (!start || !finish || finish <= start) return 0;
  return Math.max(1, Math.round((finish.getTime() - start.getTime()) / 604800000));
}

export function getAcceptedSalesOfferId(request = {}) {
  return (
    String(request?.acceptedPayload?.offer_id || "").trim() ||
    String(request?.salesOfferId || "").trim() ||
    String(request?.offerId || "").trim()
  );
}

export function getAcceptedSalesOfferVersionId(request = {}) {
  return (
    String(request?.acceptedPayload?.version_id || "").trim() ||
    String(request?.acceptedOfferVersionId || "").trim() ||
    String(request?.sentOfferVersionId || "").trim()
  );
}

export function getAcceptedSalesOfferVersionNumber(request = {}) {
  return (
    request?.acceptedPayload?.version_number ||
    request?.acceptedOfferVersionNumber ||
    request?.sentOfferVersionNumber ||
    ""
  );
}

export function getAcceptedTotalExVat(request = {}) {
  const candidates = [
    request?.acceptedTotal,
    request?.acceptedPayload?.version_snapshot?.total_ex_vat,
    request?.offerTotal,
  ];

  for (const candidate of candidates) {
    const number = Number(candidate);
    if (Number.isFinite(number)) return number;
  }

  return 0;
}

export function getAcceptedTotalInclVat(request = {}) {
  return getAcceptedTotalExVat(request) * CONTRACT_VAT_FACTOR;
}

export function getAcceptedOfferTerms(request = {}) {
  const snapshotLines = request?.acceptedPayload?.version_snapshot?.lines;
  const sourceLines =
    (Array.isArray(snapshotLines) && snapshotLines.length
      ? snapshotLines
      : Array.isArray(request?.acceptedOfferLines) && request.acceptedOfferLines.length
        ? request.acceptedOfferLines
        : request?.offerLines) || [];

  const terms = getOfferTermsSnapshot(sourceLines);
  return {
    terms: terms?.terms || request?.offerTerms || "",
    paymentTerms: terms?.paymentTerms || request?.offerPaymentTerms || "",
    included: terms?.included || request?.offerIncluded || "",
    excluded: terms?.excluded || request?.offerExcluded || "",
    customerSupplied:
      terms?.customerSupplied || request?.offerCustomerSupplied || "",
  };
}

export function getProjectAddress(request = {}) {
  return [
    String(request?.address || "").trim(),
    [request?.postnr, request?.city]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

export function createCompanyContractSnapshot(profile = {}) {
  return {
    company_name: profile?.companyName || "",
    org_number: profile?.orgNumber || "",
    address: profile?.address || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    logo_url: profile?.logoUrl || "",
  };
}

export function createInitialSalesContractDraft(request = {}) {
  const offerTerms = getAcceptedOfferTerms(request);

  return {
    schema_version: 2,
    contract_type: "simple_consumer_services",
    price_form: "fixed",
    price_ex_vat: getAcceptedTotalExVat(request),
    price_incl_vat: getAcceptedTotalInclVat(request),
    project_address: getProjectAddress(request),
    start_date: "",
    expected_duration_weeks: "",
    expected_finish_date: "",
    payment_plan: DEFAULT_PAYMENT_PLAN.map((item) => ({ ...item })),
    agreement_channel: "",
    early_start_requested: false,
    daily_penalty_agreed: false,
    daily_penalty_grace_days: DEFAULT_DAILY_PENALTY_GRACE_DAYS,
    daily_penalty_text: "",
    special_terms: "",
    offer_terms: offerTerms.terms,
    offer_payment_terms: offerTerms.paymentTerms,
    included: offerTerms.included,
    excluded: offerTerms.excluded,
    customer_supplied: offerTerms.customerSupplied,
  };
}

export function normalizeSalesContractDraft(value = {}, request = {}) {
  const initial = createInitialSalesContractDraft(request);
  const paymentPlan = Array.isArray(value?.payment_plan)
    ? value.payment_plan.map((item, index) => ({
        ...(initial.payment_plan[index] || {}),
        ...item,
        percent: toFiniteNumber(item?.percent, initial.payment_plan[index]?.percent || 0),
      }))
    : initial.payment_plan;

  const startDate = String(value?.start_date || initial.start_date || "").trim();
  const inferredWeeks = inferDurationWeeks(startDate, value?.expected_finish_date);
  const durationWeeksRaw =
    value?.expected_duration_weeks !== undefined && value?.expected_duration_weeks !== null
      ? value.expected_duration_weeks
      : inferredWeeks || initial.expected_duration_weeks;
  const durationWeeks =
    durationWeeksRaw === "" ? "" : toFiniteNumber(durationWeeksRaw, inferredWeeks || 0);
  const expectedFinishDate = calculateExpectedFinishDate(startDate, durationWeeks);

  return {
    ...initial,
    ...(value && typeof value === "object" ? value : {}),
    schema_version: 2,
    payment_plan: paymentPlan,
    price_ex_vat: toFiniteNumber(value?.price_ex_vat, initial.price_ex_vat),
    price_incl_vat: toFiniteNumber(value?.price_incl_vat, initial.price_incl_vat),
    start_date: startDate,
    expected_duration_weeks: durationWeeks,
    expected_finish_date: expectedFinishDate,
    early_start_requested: Boolean(value?.early_start_requested),
    daily_penalty_agreed: Boolean(value?.daily_penalty_agreed),
    daily_penalty_grace_days: Math.max(
      0,
      Math.round(
        toFiniteNumber(
          value?.daily_penalty_grace_days,
          DEFAULT_DAILY_PENALTY_GRACE_DAYS
        )
      )
    ),
  };
}

export function withCalculatedSchedule(draft = {}) {
  const startDate = String(draft?.start_date || "").trim();
  const durationWeeks =
    draft?.expected_duration_weeks === ""
      ? ""
      : toFiniteNumber(draft?.expected_duration_weeks, 0);
  return {
    ...draft,
    expected_duration_weeks: durationWeeks,
    expected_finish_date: calculateExpectedFinishDate(startDate, durationWeeks),
  };
}

export function getPaymentPlanPercentTotal(paymentPlan = []) {
  return (Array.isArray(paymentPlan) ? paymentPlan : []).reduce(
    (sum, item) => sum + toFiniteNumber(item?.percent, 0),
    0
  );
}

export function validateSalesContractStep(step, draft = {}) {
  if (step === 1) return "";

  if (step === 2) {
    if (!String(draft.start_date || "").trim()) {
      return "Velg avtalt oppstart.";
    }
    const durationWeeks = Number(draft.expected_duration_weeks);
    if (!Number.isFinite(durationWeeks) || durationWeeks <= 0) {
      return "Angi hvor mange uker arbeidet forventes å vare.";
    }
    if (!String(draft.price_form || "").trim()) {
      return "Velg prisform.";
    }
    if (Math.round(getPaymentPlanPercentTotal(draft.payment_plan)) !== 100) {
      return "Betalingsplanen må samlet være 100 %.";
    }
  }

  if (step === 3 && !String(draft.agreement_channel || "").trim()) {
    return "Velg hvordan avtalen er inngått.";
  }

  if (step === 3 && draft.daily_penalty_agreed) {
    const graceDays = Number(draft.daily_penalty_grace_days);
    if (!Number.isFinite(graceDays) || graceDays < 0) {
      return "Angi gyldig tilleggsfrist før eventuell dagmulkt begynner å løpe.";
    }
    if (!String(draft.daily_penalty_text || "").trim()) {
      return "Beskriv avtalt dagmulkt, for eksempel beløp per dag og eventuell maksgrense.";
    }
  }

  return "";
}

export function agreementChannelNeedsWithdrawalInfo(value = "") {
  return value === "distance" || value === "customer_location";
}
