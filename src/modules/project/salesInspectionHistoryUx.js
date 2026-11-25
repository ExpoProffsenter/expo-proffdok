// FASE 30A: React-eid skrivebeskyttet visning av opprinnelig forespørsel/befaring
// fra aktivert salgssak. Hurtigknappene og historikkpanelet eies nå av én React-root,
// slik at vi ikke er avhengige av globale capture-listeners eller skiftende DOM-noder.
// Data leses fortsatt firmascopet gjennom eksisterende Sales/Supabase-tjenester og RLS.

import { createElement, Fragment, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createDefaultSalesSupabaseClient,
  resolveSalesCompanyScope,
} from '../sales/services/salesSupabase.js';
import { INSPECTION_BUCKET } from '../sales/constants/salesConstants.js';

const SALES_REF_KEY = 'expoProffDokCurrentProjectSalesRef';
const SALES_TOKEN_KEY = 'expoProffDokCurrentProjectSalesPublicToken';
const QUICK_ID = 'expo-sales-origin-quick-actions';
const SIGNED_IMAGE_SECONDS = 60 * 60;

const text = (value = '') => String(value ?? '').trim();
const h = createElement;
let salesClient = null;

function getSalesClient() {
  if (!salesClient) salesClient = createDefaultSalesSupabaseClient();
  return salesClient;
}

function storedValue(key) {
  try {
    return text(window.sessionStorage.getItem(key));
  } catch {
    return '';
  }
}

function currentSalesRef() {
  const markerRef = text(
    document
      .querySelector('[data-expo-sales-origin-ref]')
      ?.getAttribute('data-expo-sales-origin-ref')
  );
  return markerRef || storedValue(SALES_REF_KEY);
}

function currentSalesToken() {
  const markerToken = text(
    document
      .querySelector('[data-expo-sales-public-token]')
      ?.getAttribute('data-expo-sales-public-token')
  );
  return markerToken || storedValue(SALES_TOKEN_KEY);
}

async function waitForSalesSession(client) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data?.session?.user) return data.session;
    if (attempt < 7) {
      await new Promise((resolve) => window.setTimeout(resolve, 125));
    }
  }

  throw new Error('Innloggingen er ikke klar ennå. Prøv igjen.');
}

async function hydrateInspectionPhotos(client, photos = []) {
  return Promise.all(
    (Array.isArray(photos) ? photos : []).map(async (photo) => {
      const path = text(photo?.path);
      if (!path) return photo;

      const { data, error } = await client.storage
        .from(INSPECTION_BUCKET)
        .createSignedUrl(path, SIGNED_IMAGE_SECONDS);

      if (error) {
        console.warn('Kunne ikke lage visningslenke for befaringsbilde', error);
        return { ...photo, dataUrl: text(photo?.dataUrl || photo?.url) };
      }

      return {
        ...photo,
        dataUrl: data?.signedUrl || text(photo?.dataUrl || photo?.url),
      };
    })
  );
}

async function fetchActivatedRequest() {
  const client = getSalesClient();
  const requestRef = currentSalesRef();

  if (!client) throw new Error('Supabase er ikke tilgjengelig i denne Preview-en.');
  if (!requestRef) throw new Error('Prosjektet mangler kobling til opprinnelig salgssak.');

  await waitForSalesSession(client);

  const { data: companyId, error: companyError } = await resolveSalesCompanyScope(client);
  if (companyError) throw companyError;
  if (!companyId) throw new Error('Kunne ikke fastslå firma for salgssaken.');

  const { data, error } = await client
    .from('sales_requests')
    .select('request_ref,payload,status')
    .eq('company_id', companyId)
    .eq('request_ref', requestRef)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload) throw new Error('Fant ikke den opprinnelige salgssaken.');

  const request = { ...(data.payload || {}), id: data.request_ref };
  return {
    ...request,
    inspectionPhotos: await hydrateInspectionPhotos(client, request.inspectionPhotos),
  };
}

function navButtonForLabel(label) {
  const clean = text(label);
  return Array.from(document.querySelectorAll('nav button')).find(
    (button) => text(button.textContent).replace(/\s+/g, ' ') === clean
  ) || null;
}

function openProjectOverview() {
  const destination = navButtonForLabel('Prosjektoversikt');
  destination?.click();
}

function openCustomerOffer() {
  const publicToken = currentSalesToken();
  if (!publicToken) return;

  const offerUrl = new URL(window.location.pathname || '/', window.location.origin);
  offerUrl.searchParams.set('publicOffer', publicToken);
  window.open(offerUrl.toString(), '_blank', 'noopener,noreferrer');
}

function textRow(label, value) {
  const clean = text(value);
  if (!clean) return null;

  return h(
    'div',
    {
      key: label,
      style: {
        padding: '12px 14px',
        border: '1px solid #d7e4ea',
        borderRadius: '12px',
        background: '#fff',
      },
    },
    h('strong', { style: { display: 'block', marginBottom: '5px' } }, label),
    h('div', { style: { whiteSpace: 'pre-wrap', lineHeight: '1.5' } }, clean)
  );
}

function InspectionHistoryPanel({ request }) {
  const rows = [
    ['Opprinnelig forespørsel', request?.note],
    ['Kundens ønsker', request?.inspectionCustomerWishes],
    ['Eksisterende forhold', request?.inspectionExistingConditions],
    ['Målinger', request?.inspectionMeasurements],
    ['Faglige observasjoner', request?.inspectionObservations],
  ]
    .map(([label, value]) => textRow(label, value))
    .filter(Boolean);

  const photos = (Array.isArray(request?.inspectionPhotos) ? request.inspectionPhotos : [])
    .filter((photo) => text(photo?.dataUrl || photo?.url));

  const meta = [];
  if (text(request?.surveyDate)) {
    meta.push(
      h(
        'span',
        { key: 'date' },
        `Befaring: ${text(request.surveyDate)}${text(request?.surveyTime) ? ` kl. ${text(request.surveyTime)}` : ''}`
      )
    );
  }
  if (text(request?.surveyResponsible || request?.projectResponsible)) {
    meta.push(
      h(
        'span',
        { key: 'responsible' },
        `Ansvarlig: ${text(request?.surveyResponsible || request?.projectResponsible)}`
      )
    );
  }

  return h(
    'section',
    {
      className: 'item',
      'data-expo-sales-inspection-content': '1',
      style: {
        flexBasis: '100%',
        width: '100%',
        marginTop: '6px',
        marginBottom: '6px',
        borderColor: '#b9d9df',
        background: '#f8fbfc',
      },
    },
    h('h3', { style: { marginTop: 0 } }, '📋 Forespørsel og befaringsinnhold'),
    h(
      'p',
      { className: 'note' },
      'Skrivebeskyttet historikk fra forespørselen og befaringen som lå til grunn for tilbudet og prosjektaktiveringen.'
    ),
    meta.length
      ? h(
          'div',
          {
            style: {
              display: 'flex',
              gap: '8px 16px',
              flexWrap: 'wrap',
              marginTop: '10px',
              color: '#42606b',
              fontSize: '14px',
            },
          },
          ...meta
        )
      : null,
    rows.length
      ? h('div', { style: { display: 'grid', gap: '10px', marginTop: '12px' } }, ...rows)
      : null,
    photos.length
      ? h(
          Fragment,
          null,
          h('h4', { style: { margin: '16px 0 8px' } }, `Befaringsbilder (${photos.length})`),
          h(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
                gap: '10px',
              },
            },
            ...photos.map((photo, index) => {
              const src = text(photo?.dataUrl || photo?.url);
              return h(
                'button',
                {
                  key: photo?.id || photo?.path || index,
                  type: 'button',
                  className: 'secondary',
                  'aria-label': `Åpne befaringsbilde ${index + 1}`,
                  onClick: () => window.open(src, '_blank', 'noopener,noreferrer'),
                  style: {
                    padding: '0',
                    overflow: 'hidden',
                    minHeight: '120px',
                    background: '#f8fbfc',
                  },
                },
                h('img', {
                  src,
                  alt: text(photo?.name) || `Befaringsbilde ${index + 1}`,
                  loading: 'lazy',
                  style: {
                    display: 'block',
                    width: '100%',
                    height: '130px',
                    objectFit: 'cover',
                  },
                })
              );
            })
          )
        )
      : null,
    !rows.length && !photos.length
      ? h(
          'p',
          { className: 'note' },
          'Det er ikke registrert forespørselsnotat, befaringsnotat eller befaringsbilder på denne saken.'
        )
      : null
  );
}

function SalesOriginQuickActions() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const hasOffer = Boolean(currentSalesToken());

  async function toggleInspectionHistory() {
    if (open) {
      setOpen(false);
      return;
    }

    if (request) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const nextRequest = await fetchActivatedRequest();
      setRequest(nextRequest);
      setOpen(true);
    } catch (fetchError) {
      console.error('Kunne ikke hente befaringsinnhold', fetchError);
      setError(fetchError?.message || 'Kunne ikke hente befaringsinnholdet. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  return h(
    Fragment,
    null,
    h(
      'button',
      {
        type: 'button',
        className: 'secondary',
        onClick: toggleInspectionHistory,
        disabled: loading,
        'aria-busy': loading ? 'true' : undefined,
        title: 'Viser opprinnelig forespørsel, kundens ønsker, forhold, målinger, observasjoner og befaringsbilder.',
      },
      loading
        ? '⏳ Henter befaringsinnhold …'
        : open
          ? 'Skjul innhold fra befaring'
          : 'Se innhold fra befaring'
    ),
    hasOffer
      ? h(
          'button',
          {
            type: 'button',
            className: 'secondary',
            onClick: openCustomerOffer,
            title: 'Åpner den publiserte kundevisningen av tilbudet i en ny fane.',
          },
          'Se kundens tilbud'
        )
      : null,
    h(
      'button',
      {
        type: 'button',
        className: 'secondary',
        onClick: openProjectOverview,
        title: 'Åpner kunde, telefon, e-post, adresse og prosjektansvarlig.',
      },
      'Se kunde/prosjektdata'
    ),
    error
      ? h(
          'p',
          {
            className: 'note',
            role: 'alert',
            style: {
              flexBasis: '100%',
              width: '100%',
              margin: '2px 0 0',
              color: '#9a3412',
              fontWeight: '700',
            },
          },
          error
        )
      : null,
    open && request ? h(InspectionHistoryPanel, { request }) : null
  );
}

export function installSalesInspectionHistoryUx() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.__expoSalesInspectionHistoryUxInstalled) return true;

  let currentQuick = null;
  let root = null;
  let scheduled = false;

  const mount = () => {
    scheduled = false;

    if (currentQuick && !currentQuick.isConnected) {
      try { root?.unmount(); } catch {}
      currentQuick = null;
      root = null;
    }

    const quick = document.getElementById(QUICK_ID);
    if (!(quick instanceof HTMLElement)) return;
    if (quick === currentQuick && root) return;

    if (root) {
      try { root.unmount(); } catch {}
    }

    currentQuick = quick;
    root = createRoot(quick);
    quick.setAttribute('data-expo-sales-react-root', '1');
    root.render(h(SalesOriginQuickActions));
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(mount);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.__expoSalesInspectionHistoryUxInstalled = true;
  schedule();
  return true;
}
