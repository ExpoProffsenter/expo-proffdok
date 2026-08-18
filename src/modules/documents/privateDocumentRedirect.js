// FASE 29B1/29B2/29B3: Sikker dokumentrute for private prosjekt-/salgsdokumenter.
// Ruten brukes som varig URL i prosjektdata og PDF. Selve Storage-lenken lages først
// ved åpning og er kortlivet. Kundekode legges aldri i URL-en. Kundesynlige tilbudsvedlegg
// kan åpnes med tilbudets eksisterende publicOffer-token etter server-side kontroll.

import { createClient } from '@supabase/supabase-js';
import {
  PRIVATE_DOCUMENT_BUCKET,
  buildPrivateSalesStoragePath,
  isPrivateOfferAttachmentLogicalPath,
  isPrivateSalesLogicalPath,
} from './privateDocumentTools.js';

const normalizeRole = (value = 'kunde') => {
  const clean = String(value || '').trim().toLowerCase();
  return clean === 'underleverandor' || clean === 'underleverandør' || clean === 'underentreprenør'
    ? 'underleverandor'
    : 'kunde';
};

const normalizeCode = (value = '') =>
  String(value || '').trim().replace(/\s+/g, '').toUpperCase();

const portalStorageKey = (projectId = '', role = 'kunde') =>
  `expoProffDokPortalAccess:${String(projectId || '').trim()}:${normalizeRole(role)}`;

const safeText = (value = '') => String(value || '').replace(/[<>]/g, '');

const setBody = (html) => {
  document.body.innerHTML = html;
};

const pageShell = (content = '') => `
  <main style="min-height:100vh;background:#f4f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;box-sizing:border-box;display:flex;align-items:center;justify-content:center;">
    <section style="width:min(520px,100%);background:#fff;border:1px solid #dbe7ec;border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,.12);padding:24px;box-sizing:border-box;">
      <div style="font-weight:900;color:#0c2a52;font-size:13px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px;">Expo ProffDok</div>
      ${content}
    </section>
  </main>`;

const showLoading = () => {
  setBody(pageShell(`
    <h1 style="font-size:22px;margin:0 0 10px;">Åpner sikkert dokument …</h1>
    <p style="margin:0;color:#475569;line-height:1.5;">Tilgangen kontrolleres før dokumentet åpnes.</p>
  `));
};

const showError = (message = 'Dokumentet kunne ikke åpnes.') => {
  setBody(pageShell(`
    <h1 style="font-size:22px;margin:0 0 10px;">Dokumentet kunne ikke åpnes</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.5;">${safeText(message)}</p>
    <button id="private-doc-close" type="button" style="border:0;border-radius:10px;padding:11px 16px;background:#0c2a52;color:#fff;font-weight:800;cursor:pointer;">Lukk</button>
  `));
  document.getElementById('private-doc-close')?.addEventListener('click', () => window.close());
};

const redirectToSignedUrl = (signedUrl, download = false) => {
  if (!signedUrl) throw new Error('Mangler sikker dokumentlenke.');
  if (download) {
    const anchor = document.createElement('a');
    anchor.href = signedUrl;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => window.close(), 900);
    return;
  }
  window.location.replace(signedUrl);
};

const requestPortalSignedUrl = async (client, { projectId = '', role, code, path, download }) => {
  const { data, error } = await client.functions.invoke('private-document-access', {
    body: {
      projectId,
      role: normalizeRole(role),
      code: normalizeCode(code),
      path,
      download: !!download,
    },
  });
  if (error) throw error;
  if (!data?.ok || !data?.signedUrl) {
    throw new Error(data?.error || 'Tilgangen ble ikke godkjent.');
  }
  return data.signedUrl;
};

const requestOfferSignedUrl = async (client, { offerToken, path, download }) => {
  const { data, error } = await client.functions.invoke('private-document-access', {
    body: {
      offerToken: String(offerToken || '').trim(),
      path,
      download: !!download,
    },
  });
  if (error) throw error;
  if (!data?.ok || !data?.signedUrl) {
    throw new Error(data?.error || 'Vedlegget er ikke tilgjengelig fra denne tilbudslenken.');
  }
  return data.signedUrl;
};

const storedPortalCandidates = (role = 'kunde') => {
  const candidates = [];
  const normalizedRole = normalizeRole(role);
  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index) || '';
      const match = key.match(/^expoProffDokPortalAccess:([^:]+):([^:]+)$/);
      if (!match || normalizeRole(match[2]) !== normalizedRole) continue;
      const code = normalizeCode(window.sessionStorage.getItem(key) || '');
      if (!code) continue;
      candidates.push({ projectId: match[1], code });
    }
  } catch {}
  return candidates;
};

const showPortalCodeForm = ({ client, projectId, role, path, download }) => {
  const roleLabel = normalizeRole(role) === 'underleverandor' ? 'underentreprenør' : 'kunde';
  setBody(pageShell(`
    <h1 style="font-size:22px;margin:0 0 10px;">Skriv inn tilgangskode</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.5;">Dette er et privat dokument. Bruk samme tilgangskode som til ${roleLabel}portalen.</p>
    <label style="display:block;font-weight:800;margin-bottom:6px;" for="private-doc-code">Tilgangskode</label>
    <input id="private-doc-code" inputmode="text" autocomplete="one-time-code" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font-size:18px;text-transform:uppercase;margin-bottom:10px;" />
    <div id="private-doc-error" style="display:none;color:#991b1b;font-weight:700;margin-bottom:10px;"></div>
    <button id="private-doc-open" type="button" style="width:100%;border:0;border-radius:10px;padding:12px 16px;background:#0c2a52;color:#fff;font-weight:800;cursor:pointer;">Åpne dokument</button>
  `));

  const input = document.getElementById('private-doc-code');
  const button = document.getElementById('private-doc-open');
  const errorBox = document.getElementById('private-doc-error');

  const submit = async () => {
    const code = normalizeCode(input?.value || '');
    if (!code) return;
    button.disabled = true;
    button.textContent = 'Kontrollerer …';
    errorBox.style.display = 'none';
    try {
      const signedUrl = await requestPortalSignedUrl(client, {
        projectId,
        role,
        code,
        path,
        download,
      });
      if (projectId) {
        try {
          window.sessionStorage.setItem(portalStorageKey(projectId, role), code);
        } catch {}
      }
      redirectToSignedUrl(signedUrl, download);
    } catch (error) {
      errorBox.textContent = error?.message || 'Feil tilgangskode eller manglende dokumenttilgang.';
      errorBox.style.display = 'block';
      button.disabled = false;
      button.textContent = 'Åpne dokument';
    }
  };

  button?.addEventListener('click', submit);
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submit();
  });
  input?.focus();
};

export async function runPrivateDocumentRedirect() {
  showLoading();

  const params = new URLSearchParams(window.location.search);
  const path = String(params.get('path') || '').trim().replace(/^\/+/, '');
  const projectId = String(params.get('project') || '').trim();
  const role = normalizeRole(params.get('role') || 'kunde');
  const offerToken = String(params.get('publicOffer') || '').trim();
  const download = params.get('download') === '1';

  if (!path) {
    showError('Dokumentlenken mangler Storage-path.');
    return;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    showError('Appen mangler Supabase-konfigurasjon.');
    return;
  }

  const client = createClient(supabaseUrl, anonKey);

  try {
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData?.session?.user) {
      let physicalPath = path;
      if (
        isPrivateSalesLogicalPath(path) ||
        isPrivateOfferAttachmentLogicalPath(path)
      ) {
        const { data: companyScopeId, error: scopeError } = await client.rpc('resolve_sales_company_scope');
        if (scopeError || !companyScopeId) throw scopeError || new Error('Mangler firmascope.');
        physicalPath = buildPrivateSalesStoragePath({
          companyScopeId,
          logicalPath: path,
        });
      }
      const { data, error } = await client.storage
        .from(PRIVATE_DOCUMENT_BUCKET)
        .createSignedUrl(physicalPath, 10 * 60, download ? { download: true } : undefined);
      if (!error && data?.signedUrl) {
        redirectToSignedUrl(data.signedUrl, download);
        return;
      }
    }
  } catch {
    // Fall gjennom til token- eller kodebasert tilgang.
  }

  if (offerToken && isPrivateOfferAttachmentLogicalPath(path)) {
    try {
      const signedUrl = await requestOfferSignedUrl(client, {
        offerToken,
        path,
        download,
      });
      redirectToSignedUrl(signedUrl, download);
      return;
    } catch (error) {
      showError(error?.message || 'Vedlegget kunne ikke åpnes fra denne tilbudslenken.');
      return;
    }
  }

  if (projectId) {
    let storedCode = '';
    try {
      storedCode = normalizeCode(window.sessionStorage.getItem(portalStorageKey(projectId, role)) || '');
    } catch {}

    if (storedCode) {
      try {
        const signedUrl = await requestPortalSignedUrl(client, {
          projectId,
          role,
          code: storedCode,
          path,
          download,
        });
        redirectToSignedUrl(signedUrl, download);
        return;
      } catch {
        try {
          window.sessionStorage.removeItem(portalStorageKey(projectId, role));
        } catch {}
      }
    }
  } else {
    for (const candidate of storedPortalCandidates(role)) {
      try {
        const signedUrl = await requestPortalSignedUrl(client, {
          projectId: candidate.projectId,
          role,
          code: candidate.code,
          path,
          download,
        });
        redirectToSignedUrl(signedUrl, download);
        return;
      } catch {
        // Kandidaten tilhører et annet prosjekt eller er utløpt. Prøv neste.
      }
    }
  }

  showPortalCodeForm({ client, projectId, role, path, download });
}
