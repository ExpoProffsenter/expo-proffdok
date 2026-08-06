// Expo ProffDok – FASE 23E
// Felles bildebehandling for Befaring / Tilbud / Aksept.
// Ingen React-state, Supabase-kall, Storage-regler eller UI-rendering.

export function dataUrlToBlob(dataUrl) {
  const [header, encoded] = String(dataUrl).split(",");
  const mimeType = header?.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const bytes = atob(encoded || "");
  const buffer = new Uint8Array(bytes.length);

  for (let index = 0; index < bytes.length; index += 1) {
    buffer[index] = bytes.charCodeAt(index);
  }

  return new Blob([buffer], { type: mimeType });
}

export function readFileAsDataUrl(
  file,
  errorMessage = "Bildet kunne ikke leses."
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsDataURL(file);
  });
}

export function getImageNaturalSize(
  dataUrl,
  errorMessage = "Bildet har ugyldig bildeformat."
) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error(errorMessage));
    image.src = dataUrl;
  });
}

export async function compressImageDataUrl(
  dataUrl,
  maxDimension = 1920,
  quality = 0.78
) {
  const image = new Image();
  image.src = dataUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}
