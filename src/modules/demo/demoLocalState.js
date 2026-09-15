// Expo ProffDok – FASE 42L
// Rydder kun nettleserstate som eksplisitt tilhører de fem DEMO42L-sakene.
// Ordinære Sales-cache/kladddata for ekte saker beholdes urørt.

import { DEMO_REQUEST_REFS } from "./demoCaseSafety.js";

const DEMO_REFS = Object.values(DEMO_REQUEST_REFS);
const SALES_KEY_HINT = /sales|offer|draft|audit|baseline|resume|reopen|navigation/i;

function containsDemoRef(value = "") {
  const text = String(value || "");
  return DEMO_REFS.some((requestRef) => text.includes(requestRef));
}

function shouldRemoveByKey(key = "") {
  const text = String(key || "");
  return Boolean(SALES_KEY_HINT.test(text) && containsDemoRef(text));
}

function shouldRemoveByValue(key = "", value = "") {
  const keyText = String(key || "");
  if (!SALES_KEY_HINT.test(keyText)) return false;
  if (!containsDemoRef(value)) return false;

  // Ikke slett den store Sales-listecachen bare fordi den inneholder demo-rader.
  // Den kan også inneholde offline-data for ekte saker og blir hydrert normalt fra server.
  if (/requests|cache|storage/i.test(keyText) && !/navigation|resume|reopen/i.test(keyText)) {
    return false;
  }
  return true;
}

function clearStorage(storage) {
  if (!storage) return 0;
  const keys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) keys.push(key);
  }

  let removed = 0;
  for (const key of keys) {
    let value = "";
    try {
      value = storage.getItem(key) || "";
    } catch {
      value = "";
    }
    if (!shouldRemoveByKey(key) && !shouldRemoveByValue(key, value)) continue;
    try {
      storage.removeItem(key);
      removed += 1;
    } catch {
      // Nettleserlagring er et ekstra recovery-lag. Reset skal ikke feile om den er utilgjengelig.
    }
  }
  return removed;
}

export function clearDemoBrowserState() {
  if (typeof window === "undefined") return { local: 0, session: 0 };
  return {
    local: clearStorage(window.localStorage),
    session: clearStorage(window.sessionStorage),
  };
}
