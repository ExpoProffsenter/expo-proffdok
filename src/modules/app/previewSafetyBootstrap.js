// Expo ProffDok – FASE 35B
// Sørger for at Vercel Preview aldri bruker produksjonslagring/sending ved et uhell.
// Offisielt produksjonsdomene påvirkes ikke. Main-alias beholdes som produksjonsnært miljø.

const SAFE_PARAM = 'progressTest';
const SAFE_VALUE = 'safe';
const PRODUCTION_VERCEL_HOSTS = new Set([
  'expo-proffdok-git-main-ringside.vercel.app',
]);

export function ensureSafePreviewModeFromHost() {
  if (typeof window === 'undefined') return false;

  const host = String(window.location.hostname || '').toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const isVercelPreview = host.endsWith('.vercel.app') && !PRODUCTION_VERCEL_HOSTS.has(host);
  if (!isLocal && !isVercelPreview) return false;

  const url = new URL(window.location.href);
  if (url.searchParams.get(SAFE_PARAM) !== SAFE_VALUE) {
    url.searchParams.set(SAFE_PARAM, SAFE_VALUE);
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }
  return true;
}
