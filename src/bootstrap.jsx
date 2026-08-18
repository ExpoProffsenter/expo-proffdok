// FASE 29A5.2 / 29B1: Minimal bootstrap som aktiverer bildeoptimalisering
// og håndterer sikre private dokumentlenker før hovedappen lastes.
// FASE 29B3 UI: Kundetilbud åpner tilbudsbilder i innebygd lightbox i stedet for ny fane.
// FASE 29B5: Permanente private dokumentlenker beholdes canonical i data/PDF, men klikk i
// aktiv app åpnes på samme origin slik at Preview-/produksjonssesjonen følger med.
// Kunde-/UE-portal åpner private dokumenter i samme fane slik at verifisert portalkode
// forblir tilgjengelig i sessionStorage uten å legges i URL-en.
import { installGlobalStorageImageOptimizer } from './modules/images/imageUploadOptimizer.js';

installGlobalStorageImageOptimizer({
  maxDimension: 2560,
  quality: 0.85
});

const SALES_IMAGE_LIGHTBOX_ID = 'sales-customer-image-lightbox';

function openSalesImageLightbox(src, alt = 'Tilbudsbilde') {
  if (!src) return;

  document.getElementById(SALES_IMAGE_LIGHTBOX_ID)?.remove();

  const overlay = document.createElement('div');
  overlay.id = SALES_IMAGE_LIGHTBOX_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', alt || 'Større bilde');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '100000',
    display: 'grid',
    placeItems: 'center',
    padding: '20px',
    background: 'rgba(5, 18, 25, 0.88)',
    cursor: 'zoom-out'
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    maxWidth: '96vw',
    maxHeight: '94vh',
    cursor: 'default'
  });

  const image = document.createElement('img');
  image.src = src;
  image.alt = alt || 'Tilbudsbilde';
  Object.assign(image.style, {
    display: 'block',
    maxWidth: '94vw',
    maxHeight: '88vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)'
  });

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Lukk bilde');
  Object.assign(closeButton.style, {
    position: 'absolute',
    top: '-14px',
    right: '-14px',
    width: '42px',
    height: '42px',
    border: '0',
    borderRadius: '999px',
    background: '#fff',
    color: '#10212b',
    fontSize: '30px',
    lineHeight: '1',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.28)'
  });

  const close = () => {
    document.removeEventListener('keydown', handleKeyDown);
    overlay.remove();
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') close();
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', handleKeyDown);

  panel.append(image, closeButton);
  overlay.append(panel);
  document.body.append(overlay);
  closeButton.focus();
}

document.addEventListener(
  'click',
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest('a[title="Åpne større bilde"]');
    if (!anchor) return;

    const image = anchor.querySelector('img');
    const src = image?.src || anchor.href || '';
    if (!src) return;

    event.preventDefault();
    event.stopPropagation();
    openSalesImageLightbox(
      src,
      image?.alt || anchor.getAttribute('aria-label') || 'Tilbudsbilde'
    );
  },
  true
);

function rewritePrivateDocumentAnchorForCurrentOrigin(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) return null;

  let url;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  if (url.searchParams.get('privateDocument') !== '1') return null;

  const isKnownAppHost =
    url.hostname === 'expo-proffdok.app' ||
    url.hostname === window.location.hostname;
  if (!isKnownAppHost) return null;

  if (url.origin !== window.location.origin) {
    url.protocol = window.location.protocol;
    url.host = window.location.host;
  }

  if (anchor.hasAttribute('download')) {
    url.searchParams.set('download', '1');
  }

  anchor.href = url.toString();
  return url;
}

const normalizePortalRole = (value = '') => {
  const clean = String(value || '').trim().toLowerCase();
  return clean === 'underleverandor' ||
    clean === 'underleverandør' ||
    clean === 'underentreprenør'
    ? 'underleverandor'
    : clean === 'kunde'
      ? 'kunde'
      : '';
};

document.addEventListener(
  'click',
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest('a[href]');
    if (!anchor) return;

    const privateDocumentUrl = rewritePrivateDocumentAnchorForCurrentOrigin(anchor);
    if (!privateDocumentUrl) return;

    const currentParams = new URLSearchParams(window.location.search);
    const currentProjectId = String(currentParams.get('project') || '').trim();
    const currentPortalRole = normalizePortalRole(currentParams.get('role') || '');
    const documentProjectId = String(
      privateDocumentUrl.searchParams.get('project') || ''
    ).trim();

    if (
      currentProjectId &&
      currentPortalRole &&
      documentProjectId === currentProjectId
    ) {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(privateDocumentUrl.toString());
    }
  },
  true
);

const params = new URLSearchParams(window.location.search);
if (params.get('privateDocument') === '1') {
  import('./modules/documents/privateDocumentRedirect.js')
    .then(({ runPrivateDocumentRedirect }) => runPrivateDocumentRedirect())
    .catch((error) => {
      console.error('Kunne ikke starte privat dokumentrute:', error);
      document.body.innerHTML = '<main style="font-family:Arial,sans-serif;padding:24px"><h1>Dokumentet kunne ikke åpnes</h1><p>Prøv igjen fra Expo ProffDok.</p></main>';
    });
} else {
  import('./main.jsx');
}
