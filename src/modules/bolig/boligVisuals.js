import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";

export const VISUAL_BUCKET = "bolig-project-visuals";
export const VISUAL_EVENT = "expo-proffdok-bolig-visuals";
export async function visualRpc(
  context,
  root,
  scope,
  action = "list",
  revision = null,
  payload = {},
) {
  const pending = getAppSupabaseClient()?.rpc("bolig_visuals", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_scope_id: scope,
    p_action: action,
    p_revision: revision,
    p_payload: payload,
  });
  if (!pending) throw Error("Appens innlogging er ikke klar.");
  const { data, error } = await (typeof pending.retry === "function"
    ? pending.retry(false)
    : pending);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    !data?.context?.enabled ||
    data.context.user_id !== context.user_id ||
    data.context.company_id !== context.company_id ||
    data.root_id !== root ||
    data.scope_id !== scope ||
    !Array.isArray(data.sheets) ||
    !Array.isArray(data.targets)
  )
    throw Object.assign(Error("Firma eller bildetilgang er endret."), {
      code: "42501",
    });
  return data;
}

// Draft blobs are kept independently of component lifetime and before upload.
// This database belongs only to the visual editor, never to Sales recovery.
export function visualBlob(key, value) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("expo-bolig-visual-drafts-v1", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files");
    open.onerror = () =>
      reject(Error("Bildefilen kunne ikke sikres lokalt. Behold siden åpen."));
    open.onsuccess = () => {
      const db = open.result,
        tx = db.transaction(
          "files",
          value === undefined ? "readonly" : "readwrite",
        ),
        files = tx.objectStore("files");
      const req =
        value === undefined
          ? files.get(key)
          : value === null
            ? files.delete(key)
            : files.put(value, key);
      let result;
      req.onsuccess = () => {
        result = req.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(result || null);
      };
      tx.onerror = () => {
        db.close();
        reject(Error("Bildefilen kunne ikke sikres lokalt."));
      };
    };
  });
}
export async function inspectVisualImage(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (
    !file ||
    !extensions[file.type] ||
    !file.size ||
    file.size > 12 * 1024 * 1024
  )
    throw Error(
      "Velg JPG, PNG eller WebP på inntil 12 MB. Eksporter PDF-tegningen som bilde først.",
    );
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(Error("Bildefilen kunne ikke åpnes."));
      img.src = url;
    });
    if (
      !img.naturalWidth ||
      !img.naturalHeight ||
      Math.max(img.naturalWidth, img.naturalHeight) > 12000
    )
      throw Error("Velg et bilde med inntil 12 000 piksler på lengste side.");
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      extension: extensions[file.type],
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function uploadVisualImage(path, blob) {
  const bucket = getAppSupabaseClient().storage.from(VISUAL_BUCKET);
  const { error } = await bucket.upload(path, blob, {
    upsert: false,
    contentType: blob.type,
  });
  if (!error) return;
  // A lost upload acknowledgement may have left exactly this immutable object.
  const existing = await bucket.download(path);
  if (!existing.error && existing.data) {
    const hash = async (b) =>
      Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await b.arrayBuffer()),
        ),
      ).join(",");
    if ((await hash(blob)) === (await hash(existing.data))) return;
  }
  throw Error(
    "Opplastingen kunne ikke bekreftes. Bildefilen og kladden er beholdt. Prøv igjen.",
  );
}
export function visualPayload(draft) {
  return {
    request_id: draft.request_id,
    sheet_id: draft.sheet_id,
    title: draft.title,
    path: draft.path,
    width: draft.width,
    height: draft.height,
    archived: !!draft.archived,
    basis: draft.basis,
    markers: draft.markers.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })),
  };
}
export function clampMarker(marker) {
  const round = (n) => Math.round(n * 1e6) / 1e6;
  const w = round(Math.max(0.012, Math.min(1, Number(marker.w) || 0.08)));
  const h = round(Math.max(0.012, Math.min(1, Number(marker.h) || 0.06)));
  return {
    id: marker.id,
    x: round(Math.max(0, Math.min(1 - w, Number(marker.x) || 0))),
    y: round(Math.max(0, Math.min(1 - h, Number(marker.y) || 0))),
    w,
    h,
  };
}
export function suggestVisualMarkers(targets, kind) {
  if (!targets.length) return [];
  if (kind === "facade") {
    const groups = [...new Set(targets.map((t) => t.entrance_id))];
    return groups.flatMap((group, gi) => {
      const rows = targets.filter((t) => t.entrance_id === group),
        floors = [...new Set(rows.map((t) => t.floor))].sort((a, b) => b - a);
      return floors.flatMap((floor, fi) => {
        const units = rows
          .filter((t) => t.floor === floor)
          .sort((a, b) => a.position - b.position);
        return units.map((u, i) =>
          clampMarker({
            id: u.id,
            x:
              0.08 +
              (gi * 0.84) / groups.length +
              (i * 0.84) / groups.length / units.length,
            y: 0.14 + (fi * 0.7) / floors.length,
            w: Math.min(0.13, 0.7 / groups.length / units.length),
            h: Math.min(0.1, 0.5 / floors.length),
          }),
        );
      });
    });
  }
  const columns = Math.ceil(Math.sqrt(targets.length));
  return targets.map((t, i) =>
    clampMarker({
      id: t.id,
      x: 0.1 + ((i % columns) * 0.8) / columns,
      y:
        0.12 +
        (Math.floor(i / columns) * 0.75) / Math.ceil(targets.length / columns),
      w: Math.min(0.22, 0.65 / columns),
      h: 0.09,
    }),
  );
}
