// FASE 29A5.2: Felles klient-side bildeoptimalisering før Supabase Storage-opplasting.
// Bevarer filnavn/path slik at signerte kunde-/UE-opplastinger fortsatt valideres.

const DEFAULT_MAX_DIMENSION = 2560;
const DEFAULT_QUALITY = 0.85;
const NOTICE_SIZE_THRESHOLD = 1.5 * 1024 * 1024;
const NOTICE_ID = 'expo-image-optimization-notice';

const formatMb = (bytes = 0) => {
  const mb = Number(bytes || 0) / (1024 * 1024);
  return `${mb < 0.1 ? mb.toFixed(2) : mb.toFixed(1).replace('.', ',')} MB`;
};

const showNotice = (message, { persistent = false, tone = 'info' } = {}) => {
  if (typeof document === 'undefined' || !document.body) return;
  let el = document.getElementById(NOTICE_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = NOTICE_ID;
    Object.assign(el.style, {
      position: 'fixed',
      left: '50%',
      bottom: '22px',
      transform: 'translateX(-50%)',
      zIndex: '2147483000',
      maxWidth: 'calc(100vw - 28px)',
      padding: '10px 14px',
      borderRadius: '12px',
      boxShadow: '0 8px 28px rgba(15, 23, 42, 0.22)',
      fontSize: '14px',
      fontWeight: '800',
      lineHeight: '1.35',
      textAlign: 'center',
      pointerEvents: 'none',
      transition: 'opacity 160ms ease',
      opacity: '0'
    });
    document.body.appendChild(el);
  }

  const tones = {
    info: { background: '#0f172a', color: '#ffffff' },
    success: { background: '#166534', color: '#ffffff' },
    warning: { background: '#92400e', color: '#ffffff' }
  };
  Object.assign(el.style, tones[tone] || tones.info);
  el.textContent = message;
  el.style.opacity = '1';

  if (el.__expoHideTimer) window.clearTimeout(el.__expoHideTimer);
  if (!persistent) {
    el.__expoHideTimer = window.setTimeout(() => {
      el.style.opacity = '0';
    }, 2600);
  }
};

const hideNotice = () => {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(NOTICE_ID);
  if (!el) return;
  if (el.__expoHideTimer) window.clearTimeout(el.__expoHideTimer);
  el.style.opacity = '0';
};

const fileExtension = (file = {}) => {
  const name = String(file?.name || '').toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match?.[1] || '';
};

const supportedImageType = (file = {}) => {
  const mime = String(file?.type || '').toLowerCase();
  const ext = fileExtension(file);
  if (mime === 'image/jpeg' || ['jpg', 'jpeg', 'jfif'].includes(ext)) return 'image/jpeg';
  if (mime === 'image/png' || ext === 'png') return 'image/png';
  if (mime === 'image/webp' || ext === 'webp') return 'image/webp';
  return '';
};

const loadDrawableImage = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw(ctx, width, height) {
          ctx.drawImage(bitmap, 0, 0, width, height);
        },
        cleanup() {
          if (typeof bitmap.close === 'function') bitmap.close();
        }
      };
    } catch {
      // Safari/eldre nettlesere kan falle tilbake til vanlig Image.
    }
  }

  if (typeof Image === 'undefined' || typeof URL === 'undefined') {
    throw new Error('Nettleseren støtter ikke lokal bildebehandling.');
  }

  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      draw(ctx, width, height) {
        ctx.drawImage(image, 0, 0, width, height);
      },
      cleanup() {
        URL.revokeObjectURL(objectUrl);
      }
    });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Bildet kunne ikke leses lokalt.'));
    };
    image.src = objectUrl;
  });
};

const canvasToBlob = (canvas, mime, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Bildet kunne ikke komprimeres.'));
  }, mime, quality);
});

export async function optimizeImageForUpload(file, {
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY
} = {}) {
  if (!file || typeof Blob === 'undefined' || !(file instanceof Blob)) {
    return { file, optimized: false, reason: 'not-blob' };
  }

  const outputMime = supportedImageType(file);
  if (!outputMime) {
    return { file, optimized: false, reason: 'unsupported-format' };
  }
  if (typeof document === 'undefined') {
    return { file, optimized: false, reason: 'no-document' };
  }

  let drawable = null;
  const shouldShowInitialNotice = Number(file.size || 0) >= NOTICE_SIZE_THRESHOLD;
  if (shouldShowInitialNotice) {
    showNotice('Optimaliserer bilde før opplasting …', { persistent: true });
  }

  try {
    drawable = await loadDrawableImage(file);
    const width = Number(drawable.width || 0);
    const height = Number(drawable.height || 0);
    if (!width || !height) return { file, optimized: false, reason: 'invalid-dimensions' };

    const longest = Math.max(width, height);
    const scale = longest > maxDimension ? maxDimension / longest : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const shouldResize = scale < 1;
    const shouldReencode = shouldResize || Number(file.size || 0) >= NOTICE_SIZE_THRESHOLD;

    if (!shouldReencode) {
      hideNotice();
      return { file, optimized: false, reason: 'already-small', width, height };
    }

    if (!shouldShowInitialNotice) {
      showNotice('Optimaliserer bilde før opplasting …', { persistent: true });
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: outputMime === 'image/png' });
    if (!ctx) throw new Error('Kunne ikke starte bildebehandling.');

    if (outputMime !== 'image/png') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    drawable.draw(ctx, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, outputMime, outputMime === 'image/png' ? undefined : quality);
    const originalBytes = Number(file.size || 0);
    const optimizedBytes = Number(blob.size || 0);

    if (!optimizedBytes || optimizedBytes >= originalBytes) {
      hideNotice();
      return {
        file,
        optimized: false,
        reason: 'not-smaller',
        width,
        height,
        targetWidth,
        targetHeight
      };
    }

    const optimizedFile = typeof File !== 'undefined'
      ? new File([blob], file.name || `bilde-${Date.now()}`, {
          type: outputMime,
          lastModified: Number(file.lastModified || Date.now())
        })
      : blob;

    showNotice(`Bilde optimalisert: ${formatMb(originalBytes)} → ${formatMb(optimizedBytes)}`, {
      tone: 'success'
    });

    return {
      file: optimizedFile,
      optimized: true,
      originalBytes,
      optimizedBytes,
      width,
      height,
      targetWidth,
      targetHeight
    };
  } catch (error) {
    console.warn('Bildeoptimalisering hoppet over – originalfil lastes opp:', error);
    showNotice('Kunne ikke optimalisere bildet – originalen lastes opp.', { tone: 'warning' });
    return { file, optimized: false, reason: 'error', error };
  } finally {
    try {
      drawable?.cleanup?.();
    } catch {
      // Ingen handling nødvendig ved oppryddingsfeil.
    }
  }
}

// Kan brukes direkte på en Supabase-klient dersom vi senere ønsker lokal installasjon
// i en avgrenset modul. 29A5.2 bruker global Storage-hook fra bootstrap for å dekke
// alle eksisterende opplastingspunkter uten å gjøre main.jsx større.
export function installImageUploadOptimizer(supabase, options = {}) {
  if (!supabase?.storage || typeof supabase.storage.from !== 'function') return false;
  if (supabase.__expoImageUploadOptimizerInstalled) return true;

  const originalFrom = supabase.storage.from.bind(supabase.storage);
  supabase.storage.from = (bucketId) => {
    const bucket = originalFrom(bucketId);
    if (!bucket || typeof bucket.upload !== 'function') return bucket;

    const originalUpload = bucket.upload.bind(bucket);
    bucket.upload = async (path, body, uploadOptions) => {
      const result = await optimizeImageForUpload(body, options);
      return originalUpload(path, result.file || body, uploadOptions);
    };
    return bucket;
  };

  supabase.__expoImageUploadOptimizerInstalled = true;
  return true;
}

const isExpoStorageUploadUrl = (value = '') => {
  const url = String(value || '');
  return /\/storage\/v1\/object\/(project-images|chat-images)(?:\/|$)/i.test(url);
};

const formDataWithOptimizedImage = async (formData, options = {}) => {
  if (typeof FormData === 'undefined' || !(formData instanceof FormData)) return formData;
  if (typeof Blob === 'undefined') return formData;

  const entries = Array.from(formData.entries());
  const imageIndex = entries.findIndex(([, value]) => value instanceof Blob && !!supportedImageType(value));
  if (imageIndex < 0) return formData;

  const originalImage = entries[imageIndex][1];
  const result = await optimizeImageForUpload(originalImage, options);
  if (!result?.optimized || !result.file || result.file === originalImage) return formData;

  const next = new FormData();
  entries.forEach(([key, value], index) => {
    if (index === imageIndex) {
      const replacement = result.file;
      const originalName = String(originalImage?.name || replacement?.name || 'bilde.jpg');
      next.append(key, replacement, originalName);
      return;
    }
    if (value instanceof Blob) {
      next.append(key, value, String(value?.name || 'blob'));
      return;
    }
    next.append(key, value);
  });
  return next;
};

export function installGlobalStorageImageOptimizer(options = {}) {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return false;
  if (window.__expoGlobalStorageImageOptimizerInstalled) return true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : String(input?.url || '');
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    const body = init?.body;

    if ((method === 'POST' || method === 'PUT') && isExpoStorageUploadUrl(url) && body instanceof FormData) {
      try {
        const optimizedBody = await formDataWithOptimizedImage(body, options);
        if (optimizedBody !== body) {
          return originalFetch(input, { ...(init || {}), body: optimizedBody });
        }
      } catch (error) {
        console.warn('Global bildeoptimalisering hoppet over – original request brukes:', error);
      }
    }

    return originalFetch(input, init);
  };

  window.__expoGlobalStorageImageOptimizerInstalled = true;
  return true;
}
