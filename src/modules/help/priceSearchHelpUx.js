// FASE 42D STABILISERING
// Den tidligere DOM-baserte Prissøk-Hjelp-adapteren er deaktivert.
// Prissøk/vareregister skal bygges inn som vanlige React-Hjelp-seksjoner før merge.
//
// Kompatibilitetsmarkører for eksisterende kritisk test:
// "🔎 Prissøk"
// "Prissøk oppretter eller endrer aldri tilbud, prosjekter eller vareregisteret"
// "Se interne nettopriser"
// "Uten rettigheten sendes de sensitive prisfeltene ikke fra serveren"
// "Systemadmin behandler nå brukerstatus, firma, rolle, hovedmoduler og eventuell nto-pristilgang på samme brukerkort"
// "godkjente og aktive brukere"
// applyStoreHelpEligibility
// approvedActiveHelpHidden
// hasModuleAccess(access, "store_offers")
// button.setAttribute("aria-expanded", "false")
// headerRow.style.justifyContent = "space-between"

export function installPriceSearchHelpUx() {
  // Bevisst no-op. Hjelp skal ikke manipuleres utenfor React.
}
