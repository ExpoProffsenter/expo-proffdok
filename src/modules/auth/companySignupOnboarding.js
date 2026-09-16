import './companySignupOnboarding.css';

const PANEL_ID = 'expo-signup-company-onboarding';
const STORAGE_KEY = 'expoProffDokSignupCompanyDraftV1';
const FETCH_GUARD_KEY = '__expoProffDokCompanySignupFetchInstalled';

const normalizeText = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
const normalizeOrgNumber = (value = '') => String(value || '').replace(/\D/g, '').slice(0, 9);
const normalizePhoneDigits = (value = '') => String(value || '').replace(/\D/g, '');

const emptyDraft = () => ({
  mode: 'new_company',
  companyName: '',
  orgNumber: '',
  address: '',
  phone: '',
  website: ''
});

const readDraft = () => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...emptyDraft(), ...parsed };
  } catch {
    return null;
  }
};

const writeDraft = (draft) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...emptyDraft(), ...draft }));
  } catch {
    // Registreringen fungerer fortsatt uten mellomlagring.
  }
};

const clearDraft = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ingen kritisk feil.
  }
};

const buttonByText = (text) =>
  Array.from(document.querySelectorAll('button')).find(
    (button) => normalizeText(button.textContent) === text
  );

const findSignupGrid = () => {
  const submit = buttonByText('Send registrering');
  if (!(submit instanceof HTMLButtonElement)) return null;
  const main = submit.closest('main') || document.querySelector('main');
  if (!main) return null;
  return Array.from(main.querySelectorAll('.grid')).find((grid) => {
    const text = normalizeText(grid.textContent);
    return text.includes('Fullt navn') && text.includes('Mobilnummer') && text.includes('E-post');
  }) || null;
};

const createField = ({ label, key, type = 'text', placeholder = '', inputMode = '', autoComplete = '' }) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'signupCompanyField';

  const title = document.createElement('span');
  title.textContent = label;

  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.dataset.signupCompanyField = key;
  if (inputMode) input.inputMode = inputMode;
  if (autoComplete) input.autocomplete = autoComplete;

  const draft = readDraft() || emptyDraft();
  input.value = String(draft[key] || '');
  input.addEventListener('input', () => {
    const current = readDraft() || emptyDraft();
    const value = key === 'orgNumber' ? normalizeOrgNumber(input.value) : input.value;
    if (key === 'orgNumber' && input.value !== value) input.value = value;
    writeDraft({ ...current, [key]: value });
  });

  wrapper.append(title, input);
  return wrapper;
};

const syncPanelMode = (panel) => {
  const draft = readDraft() || emptyDraft();
  const invite = panel.querySelector('[data-signup-company-invite]');
  const fields = panel.querySelector('[data-signup-company-fields]');
  const note = panel.querySelector('[data-signup-company-note]');
  const isInvite = draft.mode === 'invite';
  if (invite instanceof HTMLInputElement) invite.checked = isInvite;
  if (fields instanceof HTMLElement) fields.hidden = isInvite;
  if (note instanceof HTMLElement) {
    note.textContent = isInvite
      ? 'Du registrerer bare brukeren. Når du logger inn kobles kontoen til firmaet via den eksisterende invitasjonen.'
      : 'Firmaopplysningene følger registreringen til Systemadmin. Første godkjente bruker for et nytt firma blir firmaadministrator.';
  }
};

const buildPanel = () => {
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.className = 'signupCompanyPanel';
  panel.innerHTML = `
    <div class="signupCompanyHeading">
      <div>
        <span class="signupCompanyEyebrow">FIRMAOPPLYSNINGER</span>
        <h3>Firma som skal bruke Expo ProffDok</h3>
      </div>
    </div>
    <p class="signupCompanyIntro" data-signup-company-note></p>
    <label class="signupCompanyInviteToggle">
      <input type="checkbox" data-signup-company-invite>
      <span>Jeg er invitert til et eksisterende firma</span>
    </label>
    <div class="signupCompanyFields" data-signup-company-fields></div>
  `;

  const fields = panel.querySelector('[data-signup-company-fields]');
  fields.append(
    createField({ label: 'Firmanavn', key: 'companyName', placeholder: 'Eksempel Rør AS', autoComplete: 'organization' }),
    createField({ label: 'Organisasjonsnummer', key: 'orgNumber', placeholder: '9 sifre', inputMode: 'numeric' }),
    createField({ label: 'Firmaadresse (gate, postnr. og sted)', key: 'address', placeholder: 'Gate 1, 0001 Oslo', autoComplete: 'street-address' }),
    createField({ label: 'Firmatelefon', key: 'phone', placeholder: '22 00 00 00', inputMode: 'tel', autoComplete: 'tel' }),
    createField({ label: 'Nettside (valgfritt)', key: 'website', placeholder: 'https://firma.no', inputMode: 'url', autoComplete: 'url' })
  );

  const invite = panel.querySelector('[data-signup-company-invite]');
  invite.addEventListener('change', () => {
    const current = readDraft() || emptyDraft();
    writeDraft({ ...current, mode: invite.checked ? 'invite' : 'new_company' });
    syncPanelMode(panel);
  });

  syncPanelMode(panel);
  return panel;
};

const ensurePanel = () => {
  const grid = findSignupGrid();
  if (!grid) {
    document.getElementById(PANEL_ID)?.remove();
    return false;
  }

  if (!readDraft()) writeDraft(emptyDraft());

  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = buildPanel();
    grid.insertAdjacentElement('afterend', panel);
  }
  syncPanelMode(panel);
  return true;
};

const validateDraft = () => {
  const draft = readDraft() || emptyDraft();
  if (draft.mode === 'invite') return { ok: true, draft };

  const companyName = normalizeText(draft.companyName);
  const orgNumber = normalizeOrgNumber(draft.orgNumber);
  const address = normalizeText(draft.address);
  const phone = normalizeText(draft.phone);
  const website = normalizeText(draft.website);

  if (companyName.length < 2) return { ok: false, message: 'Fyll inn firmanavn.' };
  if (orgNumber.length !== 9) return { ok: false, message: 'Organisasjonsnummer må inneholde 9 sifre.' };
  if (address.length < 5) return { ok: false, message: 'Fyll inn firmaadresse med gate, postnummer og sted.' };
  if (normalizePhoneDigits(phone).length < 8) return { ok: false, message: 'Fyll inn firmatelefon.' };

  const normalized = { ...draft, companyName, orgNumber, address, phone, website, mode: 'new_company' };
  writeDraft(normalized);
  return { ok: true, draft: normalized };
};

const signupErrorResponse = (message, status = 400) =>
  new Response(
    JSON.stringify({
      code: 'signup_company_validation_failed',
      error_code: 'signup_company_validation_failed',
      msg: message,
      message,
      error_description: message
    }),
    { status, headers: { 'content-type': 'application/json' } }
  );

const preflightCompany = async (request, draft, nativeFetch) => {
  const endpoint = new URL(request.url);
  endpoint.pathname = '/rest/v1/rpc/signup_company_application_available';
  endpoint.search = '';

  const headers = new Headers(request.headers);
  headers.set('content-type', 'application/json');
  headers.set('accept', 'application/json');
  const apiKey = headers.get('apikey');
  if (!headers.get('authorization') && apiKey) {
    headers.set('authorization', `Bearer ${apiKey}`);
  }

  const response = await nativeFetch(endpoint.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      p_company_name: draft.companyName,
      p_org_number: draft.orgNumber
    })
  });

  if (!response.ok) {
    return { ok: false, message: 'Kunne ikke kontrollere firmaet nå. Prøv registreringen på nytt.' };
  }

  const result = await response.json().catch(() => null);
  if (!result?.available) {
    if (result?.reason === 'existing_company') {
      return {
        ok: false,
        message: 'Firmaet finnes allerede i Expo ProffDok. Be firmaadministrator invitere deg i stedet.'
      };
    }
    if (result?.reason === 'invalid_org_number') {
      return { ok: false, message: 'Organisasjonsnummer må inneholde 9 sifre.' };
    }
    return { ok: false, message: 'Kontroller firmaopplysningene før du sender registreringen.' };
  }

  return { ok: true };
};

const installSignupFetchBridge = () => {
  if (window[FETCH_GUARD_KEY]) return;
  window[FETCH_GUARD_KEY] = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    let request;
    try {
      request = new Request(input, init);
    } catch {
      return nativeFetch(input, init);
    }

    const url = String(request.url || '');
    if (request.method !== 'POST' || !/\/auth\/v1\/signup(?:\?|$)/.test(url)) {
      return nativeFetch(input, init);
    }

    const draft = readDraft();
    if (!draft) return nativeFetch(input, init);

    let payload;
    try {
      payload = await request.clone().json();
    } catch {
      return nativeFetch(input, init);
    }

    const checked = validateDraft();
    if (!checked.ok) return signupErrorResponse(checked.message);

    payload.data = { ...(payload.data || {}) };

    if (checked.draft.mode === 'invite') {
      payload.data.expo_proffdok_signup_mode = 'invite';
    } else {
      const preflight = await preflightCompany(request, checked.draft, nativeFetch);
      if (!preflight.ok) return signupErrorResponse(preflight.message);

      payload.data.expo_proffdok_signup_mode = 'new_company';
      payload.data.expo_proffdok_company_name = checked.draft.companyName;
      payload.data.expo_proffdok_org_number = checked.draft.orgNumber;
      payload.data.expo_proffdok_company_address = checked.draft.address;
      payload.data.expo_proffdok_company_phone = checked.draft.phone;
      payload.data.expo_proffdok_company_website = checked.draft.website;
    }

    const headers = new Headers(request.headers);
    headers.set('content-type', 'application/json');
    const nextRequest = new Request(request, {
      headers,
      body: JSON.stringify(payload)
    });

    const response = await nativeFetch(nextRequest);
    if (response.ok) clearDraft();
    return response;
  };
};

const blockInvalidSubmission = (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const submit = target?.closest('button');
  if (!(submit instanceof HTMLButtonElement) || normalizeText(submit.textContent) !== 'Send registrering') return;

  ensurePanel();
  const checked = validateDraft();
  if (checked.ok) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  window.alert(checked.message);
};

const blockInvalidEnter = (event) => {
  if (event.key !== 'Enter' || !buttonByText('Send registrering')) return;
  const target = event.target instanceof HTMLInputElement ? event.target : null;
  if (!target?.closest('main')) return;

  ensurePanel();
  const checked = validateDraft();
  if (checked.ok) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  window.alert(checked.message);
};

export function installCompanySignupOnboarding() {
  installSignupFetchBridge();

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      ensurePanel();
    });
  };

  document.addEventListener('click', blockInvalidSubmission, true);
  document.addEventListener('keydown', blockInvalidEnter, true);
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('pageshow', schedule);
  schedule();

  return () => {
    observer.disconnect();
    document.removeEventListener('click', blockInvalidSubmission, true);
    document.removeEventListener('keydown', blockInvalidEnter, true);
    window.removeEventListener('pageshow', schedule);
    document.getElementById(PANEL_ID)?.remove();
  };
}
