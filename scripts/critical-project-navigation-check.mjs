import fs from "node:fs";

const failures = [];
const requireCheck = (condition, message) => {
  if (!condition) failures.push(message);
};

const guide = fs.readFileSync("src/modules/app/projectWorkspaceHeaderGuide.js", "utf8");
const css = fs.readFileSync("src/modules/app/projectWorkspaceHeaderGuide.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");

requireCheck(
  guide.includes("Velg prosjektinnhold fra Meny"),
  "Prosjektarbeidsflaten mangler veivisertekst til kollapset meny."
);
requireCheck(
  ["Oversikt", "Bilder", "Sjekklister", "Chat"].every((label) => guide.includes(`label: \"${label}\"`)),
  "Prosjektarbeidsflaten mangler ett eller flere avtalte hurtigvalg."
);
requireCheck(
  guide.includes('source: "Prosjektoversikt"') &&
    guide.includes("target.click()"),
  "Hurtigvalg bruker ikke eksisterende native prosjektnavigasjon."
);
requireCheck(
  !guide.includes("window.location.assign") && !guide.includes("history.pushState"),
  "Prosjektveiviseren lager en ny navigasjonsmotor i stedet for å gjenbruke eksisterende meny."
);
requireCheck(
  css.includes("@media (max-width: 1180px)") && css.includes("display: none !important"),
  "Desktop-veiviseren lekker inn i mobilskallet."
);
requireCheck(
  index.includes("installProjectWorkspaceHeaderGuide"),
  "Prosjektveiviseren installeres ikke fra app-shell."
);

if (failures.length) {
  console.error("\n❌ Expo ProffDok project navigation check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok project navigation check OK – kollapset meny har veiviser og trygge native hurtigvalg");
