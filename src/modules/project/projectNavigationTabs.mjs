// Felles navigasjonskontrakt for startsiden og prosjektarbeidsflaten.
// Globale appfunksjoner skal ikke blandes inn i et aktivt eller nytt prosjekt.

export function createGlobalAppTabs({
  isCompanyAdminUser = false,
  canUseAdminProjectSync = false,
  canUseKshms = false,
} = {}) {
  return [
    ["prosjekt", "Startside"],
    ["sales", "Befaring/Tilbud"],
    ["firma", "Firmaprofil"],
    ["innlogging", "Min profil / e-postvalg"],
    ...(isCompanyAdminUser ? [["firmaadmin", "Firma"]] : []),
    ["prosjektliste", "Prosjektliste"],
    ...(canUseKshms ? [["kshms", "KS/HMS"]] : []),
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
    ["avvik", openDeviationCount > 0 ? `Avvik (${openDeviationCount})` : "Avvik"],
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

