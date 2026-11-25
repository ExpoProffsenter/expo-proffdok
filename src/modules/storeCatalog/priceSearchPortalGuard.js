// FASE 45B – sikkerhetsnett for eksisterende Prissøk-printportal.
// React-portalen ligger under body. Dersom Prissøk tidligere ble remountet uten korrekt
// unmount kunne portalen bli stående på Startsiden når CSS-treet forsvant.

const INLINE_ID = "expo-price-search-inline";
const PRINT_SELECTOR = ".priceSearchPrintPortal";

function cleanPortals() {
  if (typeof document === "undefined") return;
  const portals = Array.from(document.querySelectorAll(PRINT_SELECTOR));
  if (!portals.length) return;

  const searchOpen = Boolean(document.getElementById(INLINE_ID));
  if (!searchOpen) {
    portals.forEach((portal) => portal.remove());
    return;
  }

  // Én aktiv Prissøk-flate skal ha nøyaktig én printportal.
  portals.slice(0, -1).forEach((portal) => portal.remove());
  const activePortal = portals.at(-1);
  if (activePortal instanceof HTMLElement) {
    // @media print bruker display:block!important og overstyrer dette under faktisk utskrift.
    activePortal.style.display = "none";
  }
}

export function installPriceSearchPortalGuard() {
  if (typeof window === "undefined" || window.__expoPriceSearchPortalGuardInstalled) return;
  window.__expoPriceSearchPortalGuardInstalled = true;

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      cleanPortals();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("click", schedule, true);
  window.addEventListener("focus", schedule);
  document.addEventListener("visibilitychange", schedule);
  schedule();
}
