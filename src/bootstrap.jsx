// FASE 29A5.2 / 29B1: Minimal bootstrap som aktiverer bildeoptimalisering
// og håndterer sikre private dokumentlenker før hovedappen lastes.
import { installGlobalStorageImageOptimizer } from './modules/images/imageUploadOptimizer.js';

installGlobalStorageImageOptimizer({
  maxDimension: 2560,
  quality: 0.85
});

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
