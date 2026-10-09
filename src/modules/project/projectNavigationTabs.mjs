// Felles navigasjonskontrakt for startsiden og prosjektarbeidsflaten.
// Globale appfunksjoner skal ikke blandes inn i et aktivt eller nytt prosjekt.

export function isProjectDeviationNavLabel(label = '') {
  return /^Avvik(?:\/SJA\/RUH)?(?:\s*\(\d+\))?$/.test(String(label).trim());
}

export function createGlobalAppTabs({
  isCompanyAdminUser = false,
  canUseAdminProjectSync = false,
  canUseKshms = false,
  canUseHr = false,
  personalPage = false,
} = {}) {
  return [
    ["prosjekt", "Startside"],
    ["sales", "Befaring/Tilbud"],
    ["firma", "Firmaprofil"],
    ...(personalPage ? [["innlogging", "Min side"]] : [["innlogging", "Min profil / e-postvalg"]]),
    ...(isCompanyAdminUser ? [["firmaadmin", "Firma"]] : []),
    ["prosjektliste", "Prosjektliste"],
    ...(canUseKshms ? [["kshms", "KS/HMS"]] : []),
    ...(canUseHr ? [["hr", "HR"]] : []),
    ["hjelp", "Hjelp"],
    ...(canUseAdminProjectSync ? [["admin", "Systemadmin"]] : []),
  ];
}

export function createProjectWorkspaceTabs({
  isNewProject = false,
  hasSalesOrigin = false,
  warrantyIssued = false,
  openDeviationCount = 0,
  unreadForAdmin = 0,
  totalChatCount = 0,
  canUseKshms = false,
} = {}) {
  return [
    ["prosjekt", isNewProject ? "Nytt prosjekt" : "Prosjektoversikt"],
    ...(hasSalesOrigin ? [["sales", "Befaring/Tilbud"]] : []),
    ["prosjektinfo", "Prosjektbeskrivelse"],
    ["tilbud", "Tilbud/kontrakt"],
    ["prosjektering", "Prosjektering"],
    ["fremdrift", "Fremdrift"],
    ["produkter", "Produkter"],
    ["overflater", "Overflater og innredning"],
    ["bilder", "Bilder"],
    ["tilgang", "Tilgang"],
    ["installasjoner", "Fag/utstyr"],
    ["sjekklister", "Sjekklister"],
    ["avvik", `${canUseKshms ? 'Avvik/SJA/RUH' : 'Avvik'}${openDeviationCount > 0 ? ` (${openDeviationCount})` : ''}`],
    [
      "chat",
      unreadForAdmin > 0
        ? `Chat (${unreadForAdmin} ulest)`
        : totalChatCount > 0
          ? `Chat (${totalChatCount})`
          : "Chat",
    ],
    ["internt", "Interne notater"],
    ["overtagelse", "Overtagelse"],
    ["garanti", warrantyIssued ? "Garanti ✓" : "Garanti"],
    ["rapport", "Rapport"],
    // Hjelp beholdes som skjult kilde for den faste ? Hjelp-knappen i desktoplinjen.
    ["hjelp", "Hjelp"],
  ];
}

