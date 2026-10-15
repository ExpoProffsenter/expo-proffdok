import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {kshmsRpc} from '../kshms/kshmsAccess.js';

export const companyAdminRpc = (name, args = {}) => kshmsRpc(`company_admin_${name}`, args);

export async function sendCompanyInvitation(invitation, callerId) {
  const fresh = await companyAdminRpc('snapshot', {p_company_id: invitation.company_id});
  if (fresh.caller_id !== callerId || !fresh.invites.some(i => i.email === invitation.email)) {
    throw Error('Firma, innlogging eller invitasjon er endret. Hent oversikten på nytt.');
  }
  const client = getAppSupabaseClient();
  if (!client?.functions?.invoke) throw Error('E-posttjenesten er ikke klar.');
  const company = fresh.company_profile || {};
  const companyName = fresh.company_name;
  const origin = window.location.origin + window.location.pathname;
  const link = `${origin}?signup=1&invited=1&email=${encodeURIComponent(invitation.email)}&company=${encodeURIComponent(invitation.invite_company_name)}`;
  const {data, error} = await client.functions.invoke('smart-worker', {body: {
    toEmail: invitation.email, direction: 'company_user_invite', companyName, brandName: companyName,
    companyLogoUrl: company.logoUrl || '', logoUrl: company.logoUrl || '', emailLogoUrl: company.logoUrl || '',
    platformName: 'Expo ProffDok', sentViaText: `Sendt via Expo ProffDok på vegne av ${companyName}`,
    footerCompanyText: `${companyName} · Dokumentasjon levert gjennom Expo ProffDok`,
    subject: `Invitasjon til Expo ProffDok – ${companyName}`,
    message: `Du er invitert til ${companyName} i Expo ProffDok. Bruk e-postadressen ${invitation.email}. Logg inn eller opprett bruker med fullt navn, mobilnummer og eget passord. Kontoen kobles automatisk til firmaet når innloggingen eller registreringen er bekreftet.`,
    projectLink: link,
  }});
  if (error || data?.ok === false || data?.error) throw Error(error?.message || data?.error || 'E-posten kunne ikke sendes.');
}
