// Expo ProffDok – FASE 33B.5 / 33B.6
// Kun presentasjon: eksisterende intern tab-/datanøkkel `tilbud` beholdes urørt.
// Dette lar eldre og direkte opprettede prosjekter fungere uten migrering samtidig
// som brukerflaten konsekvent omtaler samlet tilbud/kontrakt/endringer som Avtalegrunnlag.
// Noen få tekniske HJELP-formuleringer normaliseres også til vanlig proffspråk.
// FASE 33B.6 presiserer at kontrakt fortsatt er valgfritt for vanlige prosjekter,
// men kreves før dokumentert tetthetsgaranti kan utstedes.

const REPLACEMENTS = [
  ["Tilbud / kontrakt", "Avtalegrunnlag"],
  ["Tilbud/kontrakt", "Avtalegrunnlag"],
  [
    "Et prosjekt uten tilbud og uten kontrakt er en gyldig normaltilstand; Avtalegrunnlag blir da bare stedet der eventuelle senere avtaledokumenter og endringer kan samles.",
    "Et prosjekt uten tilbud og uten kontrakt er helt normalt. Avtalegrunnlag er da stedet der du kan samle eventuelle avtaledokumenter og senere endringer.",
  ],
  ["stoppes autosave", "stoppes automatisk lagring"],
  [
    "Kontraktkortet på Sales-saken viser kontraktsstatus direkte.",
    "Kontraktkortet på saken viser kontraktsstatus direkte.",
  ],
  [
    "Når begge parter har signert, opprettes og arkiveres en endelig PDF fra det låste servergrunnlaget. PDF-en inneholder kontrakten, begge signaturer, den aksepterte tilbudsversjonen og aksept-/signatursporbarhet.",
    "Når begge parter har signert, opprettes og arkiveres en endelig PDF fra den signerte og låste kontrakten. PDF-en inneholder kontrakten, begge signaturer, tilbudet kunden aksepterte og dokumentasjon på aksept og signering.",
  ],
  [
    "Hvis saken allerede er aktivert som prosjekt, legges slutt-PDF-en idempotent i prosjektets Avtalegrunnlag. Hvis prosjektet aktiveres senere, følger PDF-en automatisk med ved aktiveringen.",
    "Hvis saken allerede er aktivert som prosjekt, legges den signerte PDF-en automatisk i Avtalegrunnlag uten å opprette duplikater. Hvis prosjektet aktiveres senere, følger PDF-en automatisk med.",
  ],
  [
    "Systemadministrator i Sales-supportmodus kan lese kontraktsstatus, men sluttarkivering utføres ikke automatisk i supportmodus. Support er ikke en skrivebypass.",
    "Systemadministrator i supportmodus kan se kontraktsstatus, men den signerte PDF-en arkiveres ikke automatisk. Dette hindrer at supportbrukeren gjør endringer på vegne av firmaet.",
  ],
  [
    "Kontrakt er valgfritt for vanlige prosjekter. Etter akseptert tilbud kan du opprette Expo-kontrakt, laste opp bedriftens egen kontrakt eller fortsette til prosjekt uten kontrakt.",
    "Kontrakt er valgfritt for vanlige prosjekter. Etter akseptert tilbud kan du opprette Expo-kontrakt, laste opp bedriftens egen kontrakt eller fortsette til prosjekt uten kontrakt. Skal prosjektet ha dokumentert tetthetsgaranti, må en signert kontrakt ligge i Avtalegrunnlag før garantien kan utstedes.",
  ],
  [
    "Følg garantifremdriften og fullfør alle krav før garantien utstedes.",
    "Følg garantifremdriften og fullfør alle krav. Kontroller også at signert kontrakt ligger i Avtalegrunnlag før garantien utstedes.",
  ],
  [
    "Garantisertifikat kan ikke utstedes dersom det finnes åpne avvik.",
    "Garantisertifikat kan ikke utstedes dersom det finnes åpne avvik, eller før en signert kontrakt ligger i Avtalegrunnlag. Dette kan være signert Expo-kontrakt eller bedriftens egen signerte kontrakt.",
  ],
];

function replaceAgreementBasisText(value = "") {
  let next = String(value || "");
  for (const [from, to] of REPLACEMENTS) {
    if (next.includes(from)) next = next.split(from).join(to);
  }
  return next;
}

function normalizeTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const current = node.nodeValue || "";
  const next = replaceAgreementBasisText(current);
  if (next !== current) node.nodeValue = next;
}

function normalizeSubtree(root) {
  if (typeof document === "undefined" || !root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    normalizeTextNode(root);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    normalizeTextNode(node);
    node = walker.nextNode();
  }
}

let installed = false;

export function installAgreementBasisTerminology() {
  if (installed || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  installed = true;

  const start = () => {
    normalizeSubtree(document.body || document.documentElement);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          normalizeTextNode(mutation.target);
          continue;
        }
        mutation.addedNodes.forEach(normalizeSubtree);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

installAgreementBasisTerminology();
