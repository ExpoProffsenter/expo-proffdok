import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const BOLIG_IMAGE_BUCKET = "bolig-catalog-images";
const MAX_INPUT = 10 * 1024 * 1024;
const MAX_STORED = 2 * 1024 * 1024;
// Store a stable object reference in existing snapshots. The bucket stays private;
// only the image renderer obtains a short-lived download URL after authorization.
export function boligImagePath(value, client = getAppSupabaseClient()) {
  try {
    const url = new URL(value),
      base = new URL(client.supabaseUrl);
    const prefix = `/storage/v1/object/public/${BOLIG_IMAGE_BUCKET}/`;
    if (url.origin === base.origin && url.pathname.startsWith(prefix)) {
      const path = url.pathname.slice(prefix.length);
      if (/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(path))
        return path;
    }
  } catch {}
  return null;
}
export async function readBoligImage(value) {
  if (!value) return "";
  const client = getAppSupabaseClient(),
    path = boligImagePath(value, client);
  if (!path) return /^https:\/\//.test(value) ? value : "";
  const { data, error } = await client.storage
    .from(BOLIG_IMAGE_BUCKET)
    .createSignedUrl(path, 300);
  if (error || !data?.signedUrl) throw Error("Bildet kunne ikke hentes.");
  return data.signedUrl;
}
export async function prepareBoligImage(file) {
  if (
    !file ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !file.size ||
    file.size > MAX_INPUT
  )
    throw Error("Velg et JPG-, PNG- eller WebP-bilde på inntil 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () =>
        reject(Error("Bildet kunne ikke åpnes. Velg en annen bildefil."));
      img.src = url;
    });
    const scale = Math.min(
      1,
      1600 / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Bildet kunne ikke klargjøres.");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob || blob.size > MAX_STORED)
      throw Error("Bildet ble for stort. Velg et mindre bilde.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function uploadBoligImage(
  context,
  rootId,
  file,
  isCurrent = () => true,
) {
  if (!context.enabled || context.role !== "manager")
    throw Error("Prosjektledertilgang kreves.");
  const client = getAppSupabaseClient();
  if (!client?.storage) throw Error("Bildeopplasting er ikke klar.");
  const blob = await prepareBoligImage(file);
  if (!isCurrent()) return null;
  const path = `${context.company_id}/${rootId}/${crypto.randomUUID()}.jpg`;
  const { error } = await client.storage
    .from(BOLIG_IMAGE_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error)
    throw Error(
      "Bildet kunne ikke lastes opp. Kladden og det forrige bildet er beholdt.",
    );
  if (!isCurrent()) return null;
  return client.storage.from(BOLIG_IMAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
