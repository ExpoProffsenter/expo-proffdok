// Expo ProffDok – FASE 32 / FASE 23E
// Nye bilder som velges inne i tilbudsbyggeren lagres i eksisterende
// project-images Storage og returneres som vanlig URL i det bakoverkompatible
// imageDataUrl-feltet. Gamle base64-bilder leses fortsatt uendret.
// Befaringsbilder beholder eksisterende lokale/komprimerte/private flyt.
// Ved offline, manglende session eller Storage-feil faller tilbudsbildet tilbake
// til gammel data-URL slik at eksisterende funksjonalitet ikke forsvinner.

import {
  createDefaultSalesSupabaseClient,
  getStoragePublicUrl,
  uploadStorageFile,
} from "./salesSupabase.js";

function readLocalFileAsDataUrl(file, errorMessage) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsDataURL(file);
  });
}

function isOfferBuilderImageContext() {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector(".sales-offer-save-scope"));
}

function sanitizeStoragePart(value = "") {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return clean || "image";
}

function randomStorageId() {
  return globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function uploadOfferImageToStorage(file) {
  const client = createDefaultSalesSupabaseClient();
  if (!client?.auth?.getSession) {
    throw new Error("Supabase-klienten er ikke tilgjengelig.");
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;

  const userId = String(sessionData?.session?.user?.id || "").trim();
  if (!userId) {
    throw new Error("Innloggingen er ikke klar.");
  }

  const cleanName = sanitizeStoragePart(file?.name || "tilbudsbilde");
  const path = `sales-offer-images/${userId}/${randomStorageId()}-${cleanName}`;
  const { error: uploadError } = await uploadStorageFile(
    client,
    "project-images",
    path,
    file,
    {
      cacheControl: "3600",
      contentType: file?.type || "application/octet-stream",
      upsert: false,
    }
  );
  if (uploadError) throw uploadError;

  const { data: publicFile } = getStoragePublicUrl(
    client,
    "project-images",
    path
  );
  const publicUrl = String(publicFile?.publicUrl || "").trim();
  if (!publicUrl) {
    throw new Error("Storage returnerte ingen bilde-URL.");
  }

  return publicUrl;
}

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
  const shouldUseStorage =
    isOfferBuilderImageContext() &&
    typeof navigator !== "undefined" &&
    navigator.onLine !== false;

  if (!shouldUseStorage) {
    return readLocalFileAsDataUrl(file, errorMessage);
  }

  return uploadOfferImageToStorage(file).catch((error) => {
    // Behold aktiv funksjonalitet ved nett-/Storage-feil. Da lagres bildet med
    // den eldre data-URL-metoden i akkurat denne situasjonen.
    console.warn(
      "Tilbudsbildet kunne ikke lagres i Storage; bruker bakoverkompatibel data-URL.",
      error
    );
    return readLocalFileAsDataUrl(file, errorMessage);
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
