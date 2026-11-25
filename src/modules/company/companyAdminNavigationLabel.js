// FASE 42N – kun presentasjonsnavn for eksisterende firmaadmin-fane.
// Native tab-id, tilgangskontroll og click-handler eies fortsatt av React-kjernen.

const normalizeText = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

function applyCompanyAdminLabel() {
  let changed = false;

  document.querySelectorAll('nav').forEach((nav) => {
    if (!(nav instanceof HTMLElement)) return;

    const directButtons = Array.from(nav.querySelectorAll(':scope > button'));
    const labels = directButtons.map((button) => normalizeText(button.textContent));

    // Begrens til Expo ProffDok sin interne hovednavigasjon. Firma-knappen finnes
    // bare når React-kjernen allerede har gitt bruker firmaadmin-tilgang.
    if (!labels.includes('Firmaprofil') || !labels.includes('Hjelp')) return;

    const companyAdminButton = directButtons.find(
      (button) => normalizeText(button.textContent) === 'Firma'
    );
    if (!(companyAdminButton instanceof HTMLButtonElement)) return;

    companyAdminButton.textContent = 'Firmaadmin';
    companyAdminButton.dataset.expoCompanyAdminLabel = '1';
    changed = true;
  });

  return changed;
}

export function installCompanyAdminNavigationLabel() {
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyCompanyAdminLabel();
    });
  };

  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
}
