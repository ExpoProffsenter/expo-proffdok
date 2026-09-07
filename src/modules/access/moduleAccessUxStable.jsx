// Expo ProffDok – FASE 38A1 HOTFIX / HJELP
// Stabilitetswrapper for modultilgangs-UX. Den eksisterende tilgangsmodulen observerer
// React-DOM for å projisere tilgang i meny/Hjelp. Hjelp oppdaterer samtidig
// "Sist oppdatert"-teksten. Å skrive samme tekst på nytt kan utløse en childList-
// mutasjon og dermed en observer-loop. Denne wrapperen filtrerer kun den idempotente
// egenmutasjonen og lar alle reelle DOM-endringer gå videre.
//
// FASE 38A1: Samme observer brukes også til å tilpasse Hjelp etter serverlastet
// modultilgang. Vi oppretter ikke en ny global observer. Startside-hjelpen viser bare
// relevante arbeidsflyter, og Systemadmin/Firmaadmin får rolletilpasset veiledning.

import { installModuleAccessUx } from "./moduleAccessUx.jsx";
import { hasModuleAccess, readCachedModuleAccess } from "./moduleAccessClient.js";

const HELP_POLICY_VERSION = "38a-help-v2";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isOwnHelpTimestampMutation(record) {
  const target = record?.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName !== "SPAN") return false;
  return compactText(target.textContent) === "Sist oppdatert: 08.09.2026";
}

function helpCardByTitle(title) {
  const labels = Array.from(document.querySelectorAll("button b"));
  const label = labels.find((node) => compactText(node.textContent) === title);
  return label?.closest(".item") || null;
}

function setHelpLineVisibility(item, visible, reason) {
  if (!(item instanceof HTMLElement)) return;
  if (visible) {
    if (item.dataset.moduleHelpHidden === reason) {
      item.style.removeProperty("display");
      delete item.dataset.moduleHelpHidden;
    }
    return;
  }
  if (item.dataset.moduleHelpHidden === reason && item.style.display === "none") return;
  item.dataset.moduleHelpHidden = reason;
  item.style.display = "none";
}

function startsWithAny(text, prefixes = []) {
  return prefixes.some((prefix) => text.startsWith(prefix));
}

function adaptStartHelp(access) {
  const card = helpCardByTitle("🚀 Startside / kom i gang");
  if (!card) return;

  const canProjects = hasModuleAccess(access, "projects");
  const canSales = hasModuleAccess(access, "sales");
  const canStore = hasModuleAccess(access, "store_offers");

  const moduleNames = [];
  if (canProjects) moduleNames.push("Prosjekter og dokumentasjon");
  if (canSales) moduleNames.push("Befaring / Våtromstilbud");
  if (canStore) moduleNames.push("Butikktilbud");

  const purpose = card.querySelector("p.note");
  if (purpose) {
    const nextPurpose = moduleNames.length
      ? `Startsiden viser innganger og arbeidsoversikter for modulene du har tilgang til: ${moduleNames.join(", ")}.`
      : "Startsiden gir tilgang til globale funksjoner og viser bare moduler som er tildelt brukeren.";
    if (compactText(purpose.textContent) !== compactText(nextPurpose)) purpose.textContent = nextPurpose;
  }

  const salesPrefixes = [
    "Velg Ny forespørsel",
    "Bruk feltet Tilbud som bør følges opp",
    "Bruk Tilbud som bør følges opp",
  ];
  const projectPrefixes = [
    "Opprett et nytt prosjekt",
    "Bruk feltet Krever oppfølging",
    "Legg inn prosjektinformasjon",
    "Velg dokumentert tetthetsgaranti",
    "Dokumenter produkter, bilder, sjekklister",
    "Prosjektdata som kunde",
    "Ferdig rapport bør alltid",
    "Start dokumentasjonen ved prosjektoppstart",
    "Bruk Krever oppfølging",
    "Ta bilder og fyll ut sjekklister",
    "Bruk prosjektchatten",
  ];

  card.querySelectorAll("li").forEach((item) => {
    const text = compactText(item.textContent);

    if (text.startsWith("Krever oppfølging og Tilbud som bør følges opp")) {
      if (canProjects && canSales) {
        const original = "Krever oppfølging og Tilbud som bør følges opp er arbeidsoversikter basert på eksisterende prosjekt- og salgsdata. De oppretter ikke egne oppgaver og endrer ikke status automatisk.";
        if (compactText(item.textContent) !== compactText(original)) item.textContent = original;
        setHelpLineVisibility(item, true, "start-mixed");
      } else if (canProjects) {
        const projectOnly = "Krever oppfølging er en arbeidsoversikt basert på eksisterende prosjektdata. Den oppretter ikke egne oppgaver og endrer ikke status automatisk.";
        if (compactText(item.textContent) !== compactText(projectOnly)) item.textContent = projectOnly;
        setHelpLineVisibility(item, true, "start-mixed");
      } else if (canSales) {
        const salesOnly = "Tilbud som bør følges opp er en arbeidsoversikt basert på eksisterende salgsdata. Den oppretter ikke egne oppgaver og endrer ikke status automatisk.";
        if (compactText(item.textContent) !== compactText(salesOnly)) item.textContent = salesOnly;
        setHelpLineVisibility(item, true, "start-mixed");
      } else {
        setHelpLineVisibility(item, false, "start-mixed");
      }
      return;
    }

    if (startsWithAny(text, salesPrefixes)) {
      setHelpLineVisibility(item, canSales, "start-sales");
      return;
    }
    if (startsWithAny(text, projectPrefixes)) {
      setHelpLineVisibility(item, canProjects, "start-projects");
    }
  });
}

function appendUniqueListItem(list, text) {
  if (!(list instanceof HTMLUListElement)) return;
  const exists = Array.from(list.querySelectorAll(":scope > li"))
    .some((item) => compactText(item.textContent) === compactText(text));
  if (exists) return;
  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);
}

function adaptSystemAdminHelp(access) {
  if (!access?.isSystemAdmin) return;
  const card = helpCardByTitle("⚙️ Systemadministrasjon");
  if (!card) return;

  const purpose = card.querySelector("p.note");
  const purposeText = "Systemadministrasjon er kontrollsenteret for godkjenning av brukere, roller, modultilganger, tverrfirma-support, produktmaster, appnyheter og kontroll av systemdata.";
  if (purpose && compactText(purpose.textContent) !== compactText(purposeText)) {
    purpose.textContent = purposeText;
  }

  const lists = Array.from(card.querySelectorAll("ul"));
  const workflow = lists[0];
  const important = lists[1];
  const best = lists[2];

  appendUniqueListItem(workflow, "Ved ny bruker: kontroller firma og rolle, velg minst én modultilgang under Brukere og tilganger, og godkjenn først deretter.");
  appendUniqueListItem(workflow, "Bruk Prosjekter og dokumentasjon, Befaring / Våtromstilbud og Butikktilbud som hovedmoduler. Butikktilbud krever samtidig Befaring / Våtromstilbud.");
  appendUniqueListItem(workflow, "Etter godkjenning kan firmaadministrator administrere egne ansatte, men bare delegere moduler firmaadministratoren selv har.");
  appendUniqueListItem(workflow, "Systemadministratorer har alltid alle hovedmoduler og kan administrere modultilganger på tvers av firma.");

  appendUniqueListItem(important, "Rolle, firmatilhørighet og modultilgang er tre separate forhold: rolle styrer administrasjon, firma styrer datascope og modultilgang styrer hvilke hovedfunksjoner brukeren kan bruke.");
  appendUniqueListItem(important, "Meny og Hjelp følger modultilgangen, men backend/RLS er den faktiske sikkerhetsgrensen.");
  appendUniqueListItem(important, "Endret modultilgang omskriver ikke historiske tilbud, aksepter, kontrakter eller prosjekter og skal ikke bryte allerede publiserte kundelenker.");

  appendUniqueListItem(best, "Gi bare modulene brukeren faktisk trenger, og la firmaadministrator ta den løpende administrasjonen av egne ansatte innenfor sin tildelte ramme.");
  appendUniqueListItem(best, "Kontroller Hjelp og meny etter større tilgangsendringer slik at brukeropplevelsen samsvarer med serverrettighetene.");
}

function adaptModuleAccessHelp(access) {
  const item = document.querySelector("[data-module-access-help='1']");
  if (!(item instanceof HTMLElement)) return;

  const roleKey = access?.isSystemAdmin ? "systemadmin" : access?.isFirmaAdmin ? "firmaadmin" : "user";
  const policyKey = `${HELP_POLICY_VERSION}:${roleKey}`;
  if (item.dataset.helpPolicyVersion === policyKey) return;

  const content = item.querySelector("button + div");
  if (!(content instanceof HTMLElement)) return;
  const intro = content.querySelector("p");
  const list = content.querySelector("ul");
  if (!(list instanceof HTMLUListElement)) return;

  const lines = access?.isSystemAdmin
    ? [
        "Ved ny bruker: kontroller firma og rolle, velg minst én relevant modultilgang, lagre tilgangen og godkjenn brukeren først etterpå.",
        "Prosjekter og dokumentasjon, Befaring / Våtromstilbud og Butikktilbud er egne hovedtilganger. Butikktilbud krever Befaring / Våtromstilbud.",
        "Systemadministrator har alltid alle hovedmoduler og kan administrere brukere på tvers av firma.",
        "Firmaadministrator kan etter godkjenning administrere egne ansatte, men kan aldri delegere moduler firmaadministratoren selv mangler.",
        "Firmaadministrator kan ikke endre egen modultilgang eller en systemadministrator. Egen tilgang styres av systemadministrator.",
        "Meny, handlinger og Hjelp følger tildelte moduler. Server/RLS håndhever den faktiske data- og skrivetilgangen.",
        "Å fjerne en modultilgang skal ikke omskrive historiske saker eller bryte publiserte kundelenker og aksepter.",
      ]
    : [
        "Firmaadministrator kan administrere brukere i eget firma og bare delegere moduler firmaadministratoren selv har.",
        "Prosjekter og dokumentasjon, Befaring / Våtromstilbud og Butikktilbud er egne hovedtilganger. Butikktilbud krever Befaring / Våtromstilbud.",
        "Firmaadministrator kan ikke endre egen modultilgang. Egen tilgang styres av systemadministrator.",
        "Systemadministrator styrer rammen for firmaet og kan gi eller fjerne moduler på tvers av firma.",
        "Meny, arbeidsflater og Hjelp følger tildelte moduler. Server/RLS håndhever den faktiske data- og skrivetilgangen.",
      ];

  if (intro) {
    const introText = access?.isSystemAdmin
      ? "Systemadministrator setter rammen for hvilke hovedmoduler hver bruker får, og godkjenner nye brukere først etter at firma, rolle og modultilgang er kontrollert."
      : "Firmaadministrator administrerer egne brukere innenfor modulene systemadministrator har gjort tilgjengelig for firmaadministratoren.";
    if (compactText(intro.textContent) !== compactText(introText)) intro.textContent = introText;
  }

  list.replaceChildren(...lines.map((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  }));
  item.dataset.helpPolicyVersion = policyKey;
}

function adaptHelpRoleCopy() {
  document.querySelectorAll("p,small,span").forEach((node) => {
    const text = compactText(node.textContent);
    if (text === "Kun innhold relevant for din brukerrolle vises.") {
      node.textContent = "Kun innhold relevant for din rolle og tildelte modultilganger vises.";
    }
  });
}

function applyModuleAwareHelpCopy() {
  const access = readCachedModuleAccess();
  if (!access?.loaded) return;
  adaptStartHelp(access);
  adaptSystemAdminHelp(access);
  adaptModuleAccessHelp(access);
  adaptHelpRoleCopy();
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
          applyModuleAwareHelpCopy();
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

  window.requestAnimationFrame(() => applyModuleAwareHelpCopy());
}
