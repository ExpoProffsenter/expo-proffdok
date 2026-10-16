## Befaring: eksplisitt valg for tidligere tom lokal tekst – Preview

Innlogget etterkontroll viste at den gamle feilen også kan ha etterlatt en lokal kladd med bilder, men uten tekst, mens serveren fortsatt har tekst. Slike lokale medier regnes med rette som meningsfullt arbeid. Notatet viser derfor et synlig valg: Bruk teksten fra saken eller Behold tom lokal tekst. Tekstfelter og Lagre er sperret til valget er tatt, og submit har samme sperre. Servervalget kopierer bare de fire tekstfeltene; lokale bilder/Badskisse og alle lagrings-/recovery-regler beholdes. Ingen ny browserlagring, automatisk serveroverskriving eller generell konflikthåndtering innføres. Bevisst tømming etter normal åpning fungerer som før.

128 faktiske editor-Chromium-kontroller og elleve actual-Core/helper-scenarier PASS, inkl. begge valg, sperret lagring før valg og bevarte bilder/skisse. Første søke-/initialstate-head b3cfeeee har Core Safety #497 SUCCESS og Preview dpl_E4VJKMMdVkZn9g9Ha7TU3UAKfCUy READY. Denne oppfølgingens endelige SHA/CI/innloggede kontroll føres i PR #260. Ingen TEST OK/merge/Production.

## Etterkontroll: direkte remount i befaringsnotat

Editorlayout-head a0d705f720a75b5315fa7e6c8993422d6ae98a85 har Core Safety #496 SUCCESS og Preview dpl_BkbQ6Ppdn6bpQv7arqT3KEb2BU8f READY. Faktisk innlogget full reload i DEMO-02-BEFARING viste tomme tekstfelt og bevarte bilder. Ingen lagring ble utført. Lesende Sandbox-kontroll bekreftet at serveren fortsatt har 67/55/31/65 tegn i de fire tekstfeltene og to bilder. Bevisst Startside ble respektert.

Rotårsak i uendret main: Core kan remounte direkte i inspection-note med en tom inspectionForm-initializer. Vanlig openInspectionNote fyller skjemaet, men ble ikke kjørt før dette arbeidsbildet og den lokale kladdeffekten startet. Test med faktisk initializer fra origin/main feiler med tomme felt. Rettelsen er én import og en lazy useState-initializer i SalesModuleCore, pluss ren helper. Ingen endring i recovery-timere, wrapper, server-first-gate, serverlagring eller andre moduler. Dette er et dokumentert unntak til den opprinnelige rene presentasjonsscopingen nedenfor.

`sales-inspection-initializer-check.mjs`: sju PASS, faktiske Core-initializer med serverfelter/bilder, meningsfull offline-kladd inkl. bevisst tomme delfelt, strukturelt tom kladd, riktig bruker/firma/sak, ny sak og vanlig detail-mount. Kjøres additivt fra uendret øvrig serverhydrering-check i hver critical/build. Ingen eksisterende krav er fjernet/svekket. Eksisterende lokale kladder overskrives ikke stille for å reparere mulig tidligere tom tekst; slik kladd må vurderes som brukerarbeid.

Ny brukerprøve inkluderer full reload og vanlig fanebytte i en eksisterende befaring. Ny TEST OK kreves. Endelig innlogget etterkontroll og gjeldende SHA/CI føres i PR #260.

# Befaringsnotat og Våtromstilbud – UX 16.10.2026

Miljømål: BEGGE. Preview først, ny relevant TEST OK før merge/Production, deretter main → demo og preflight.
Baseline: main b0791af2b401efcdb856357874e0dc26ae8a4871, Production dpl_BGe7BsLpPDPTosChd6AyH5v3AVA9 READY. Fast Preview 7c70e522 / dpl_DGppRGLiQhoXTmC2p9DrBp26xHQS READY før endring. Ingen umerget tidligere appkode mistet.

## Problem og scope

Innlogget førkontroll av DEMO-02-BEFARING viste fire fullbreddetekstfelt og global sticky-header inne i notatet. Første felt var 180 px, neste 180 px, Målinger 156 px, med observasjoner først etter 855 px skisseområde. Modulintro tok ytterligere 99 px. Ingen skjemadata ble endret i førkontrollen.

Bare SalesInspectionNote.jsx, SalesOfferBuilderCore.jsx og isolert Sales-CSS får presentasjonsendringer. Ingen main.jsx, generell tilbudseditor, controller, recovery, hydration, lokal-/serverlagring, tilgang, bilder/skissemotor, prisberegning, malhandling, e-post, data eller DB-endring i denne delleveransen.

Fire notatfelt står to og to på PC og i én kolonne ved 760 px og smalere. Observasjoner flyttes foran Badskisse. Samme felt, verdi, rows og onChange. Tilbakefelt er en vanlig div, uten global header-sticky. Den doble modulintroen skjules bare for disse editorene. Våtromstilbud har samme kort for fire forbehold-/leveransefelt, kompakt topp og sideordnet malvelger/handling på PC. Alle vilkår og oppsummering beholdes. Ingen sammenfoldbare tekstlinjer er innført.

## Utvikler-QA

- `sales-editor-ux-browser-check.mjs`: 100 faktiske Chromium-kontroller PASS, 1363/768/390/320 px, mobile/touch ved smale bredder. Faktiske editorer med global/mobil/lokal CSS, syntetiske data/callbacks uten live transport. Tekst, foto, lagret skisse, PC-kolonner/mobilstabling, romslige felt, scrolling uten sideveis overflow, statisk tilbakefelt, malhandling, feltoppdatering, lagring, bevarte advarsler for ulagret arbeid og Avbryt.
- Full critical + Sandbox build PASS. Eksisterende Sales recovery, tab-/entry-resume, server-first, Badskisse og pris-/tilgangsvern beholdt og grønne.
- Visuelt kontrollert skjermbilder PC/mobil. Fysisk iPhone/Android/Windows-utklipp er ikke prøvd.
- CI, Preview-SHA og faktisk innlogget etterkontroll føres i release-PR.

## Brukerprøve i fast Preview

1. Befaring/Tilbud → eksisterende befaring → Se/endre befaringsnotat. Kontroller de fire tekstfeltene, eksisterende bilder og Badskisse. PC: to kolonner; mobil: én.
2. Scroll ned og opp. Tilbakefeltet skal ikke dekke notat eller skisse. Feltene kan fortsatt gjøres høyere.
3. På en egen testsak: endre tekst, bytt nettleserfane og tilbake, velg Lagre befaringsnotat. Samme tekst og bilder skal følge saken.
4. Eksisterende Våtromstilbud → Rediger tilbud. Kontroller linjer, opsjoner og summer, malvelger, fire leveransekort og lagringsstatus. Lagre bare en tilsiktet endring i en testsak.

TEST OK gjenstår. Production og permanent demo er uendret.
