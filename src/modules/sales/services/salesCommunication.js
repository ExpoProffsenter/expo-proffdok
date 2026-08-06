// Expo ProffDok – FASE 23Q
// Samler henting av firmaprofil, sending av kunde-e-post og tekst til befaringsbekreftelse.
// Ingen React-state, UI-rendering, databaseendring, RLS-, Storage- eller Edge Function-endring.

import {
  formatInspectionDateTime,
  hasCompanyProfile,
  normalizeCompanyProfile,
} from "../utils/salesUtils.js";
import {
  fetchCurrentSalesUser,
  fetchProfileByEmail,
  fetchProfileById,
  getSalesSession,
  invokeSmartWorker,
} from "./salesSupabase.js";

const COMPANY_PROFILE_SELECT =
  "company_name,org_number,address,phone,email,website,logo_url";

export async function fetchSalesCompanyProfile(client) {
  if (!client) return null;

  const { data: sessionData } = await getSalesSession(client);
  let user = sessionData?.session?.user || null;

  if (!user) {
    const { data: userData } = await fetchCurrentSalesUser(client);
    user = userData?.user || null;
  }

  if (!user?.id) return null;

  const { data, error } = await fetchProfileById(
    client,
    user.id,
    COMPANY_PROFILE_SELECT
  );

  if (error) return null;

  let nextProfile = data
    ? normalizeCompanyProfile(data, user.email || "")
    : null;

  if (!hasCompanyProfile(nextProfile) && user.email) {
    const fallback = await fetchProfileByEmail(
      client,
      user.email,
      COMPANY_PROFILE_SELECT
    );

    if (!fallback.error && fallback.data) {
      nextProfile = normalizeCompanyProfile(
        fallback.data,
        user.email || ""
      );
    }
  }

  return hasCompanyProfile(nextProfile) ? nextProfile : null;
}

export async function sendSalesCustomerEmail(client, payload) {
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data, error } = await invokeSmartWorker(client, payload);

  if (error) throw error;
  if (data?.ok === false) {
    throw new Error(data.error || "E-posten kunne ikke sendes.");
  }

  return data;
}

export function buildInspectionConfirmationMessage({
  date,
  time,
  note,
  responsible,
  responsibleContactEmail = "",
  responsibleContactPhone = "",
} = {}) {
  const contactLines = [
    responsible ? `Navn: ${responsible}` : "",
    responsibleContactEmail ? `E-post: ${responsibleContactEmail}` : "",
    responsibleContactPhone ? `Telefon: ${responsibleContactPhone}` : "",
  ].filter(Boolean);

  return [
    `Dato og tidspunkt: ${formatInspectionDateTime(date, time)}`,
    note ? `Merknad: ${note}` : "",
    "",
    "Dersom tidspunktet ikke passer eller du har spørsmål om befaringen, ber vi deg kontakte ansvarlig saksbehandler.",
    contactLines.length ? contactLines.join("\n") : "",
  ]
    .filter((line, index, lines) =>
      line || (index > 0 && lines[index - 1])
    )
    .join("\n");
}
