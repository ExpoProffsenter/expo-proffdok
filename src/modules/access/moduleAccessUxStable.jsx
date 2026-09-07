// Expo ProffDok – FASE 38A1 HOTFIX
// Stabilitetswrapper for modultilgangs-UX. Den eksisterende tilgangsmodulen observerer
// React-DOM for å projisere tilgang i meny/Hjelp. Hjelp oppdaterer samtidig
// "Sist oppdatert"-teksten. Å skrive samme tekst på nytt kan utløse en childList-
// mutasjon og dermed en observer-loop. Denne wrapperen filtrerer kun den idempotente
// egenmutasjonen og lar alle reelle DOM-endringer gå videre.

import { installModuleAccessUx } from "./moduleAccessUx.jsx";

function isOwnHelpTimestampMutation(record) {
  const target = record?.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName !== "SPAN") return false;
  return String(target.textContent || "").trim() === "Sist oppdatert: 08.09.2026";
}

export function installStableModuleAccessUx() {
  if (typeof window === "undefined" || typeof window.MutationObserver !== "function") {
    installModuleAccessUx();
    return;
  }

  const NativeMutationObserver = window.MutationObserver;

  class StableModuleAccessObserver {
    constructor(callback) {
      this.callback = callback;
      this.frame = 0;
      this.pendingRecords = [];
      this.inner = new NativeMutationObserver((records) => {
        const relevant = (records || []).filter((record) => !isOwnHelpTimestampMutation(record));
        if (!relevant.length) return;

        this.pendingRecords.push(...relevant);
        if (this.frame) return;

        this.frame = window.requestAnimationFrame(() => {
          this.frame = 0;
          const batch = this.pendingRecords.splice(0);
          this.callback(batch, this);
        });
      });
    }

    observe(target, options) {
      this.inner.observe(target, options);
    }

    disconnect() {
      if (this.frame) window.cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.pendingRecords = [];
      this.inner.disconnect();
    }

    takeRecords() {
      return this.inner.takeRecords();
    }
  }

  window.MutationObserver = StableModuleAccessObserver;
  try {
    installModuleAccessUx();
  } finally {
    window.MutationObserver = NativeMutationObserver;
  }
}
