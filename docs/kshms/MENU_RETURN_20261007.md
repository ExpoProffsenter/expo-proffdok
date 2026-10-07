# Hovedmeny etter generell ordre – 7. oktober 2026

Miljømål BEGGE, først eksisterende Sandbox Preview:
https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Kenneths to bilder viser den gamle knapperekken i Preview og kompakt Meny i Production. Production er kontrollert READY på main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Preview-parent er `792e6d28a69ed09c1cf1538ee9484ac794bf8ce3`. Dette er en påvist overgangsfeil, ikke en påstand om at hele repoet er rullet tilbake.

## Påvist årsak og retting

`simpleOrderWorkspaceUx` lagret de opprinnelige DOM-etikettene og skrev dem ubetinget tilbake når ordren ble forlatt. React gjenbruker kildeknappene og bruker samme sales-prop i både prosjekt og global meny. Gammel Prosjektoversikt/Salgsgrunnlag kunne derfor overskrive Startside/Befaring/Tilbud. Den eksisterende desktop-adapteren sluttet da å gjenkjenne globalmenyen og fjernet den kompakte Meny-knappen.

Før retting gjenskaper den faktiske React-/adapterprøven Kenneths nøyaktige etiketter: `Prosjektoversikt | Salgsgrunnlag | Firmaprofil | Min profil / e-postvalg | Firma | Prosjektliste | KS/HMS | Hjelp | Systemadmin`, uten desktop-menylinjen.

Gjeldende React-etikett legges nå på kilden med `data-expo-nav-label`, og ordrevisningen gjenoppretter fra denne. Gamle minneattributter ryddes. Kontroll uten React-kilde gjenopprettes bare dersom teksten fortsatt er adapterens egen ordreetikett. De eksisterende knappene, hendelsene og adapterne beholdes.

Scope: fire menynavn-attributter i main.jsx; gjenoppretting/lagring/lesing av navnegrunnlag i simpleOrderWorkspaceUx.js; permanent critical-simple-order-workspace-check; ny målrettet React-returprøve; Hjelp og statusdokumentasjon. Ingen SQL, RLS, auth, e-post eller øvrig modulfunksjonalitet endres.

## Kontroller ved kodecheckpoint

- Permanent runtime-kontroll PASS: Reacts nye Startside-/salgsnavn vinner over gamle attributter; adapterens egne etiketter gjenopprettes korrekt i ordinært prosjekt; også select-option og uendret sales-prop kontrolleres.
- `project-menu-return-react-check.mjs` PASS med den faktiske nav-rendereren fra main.jsx og de fire eksisterende adapterne: generell ordre → native Startside-knapp → kompakt hovedmeny; ordre → våtrom → riktig Prosjektmeny/Fag; native KS/HMS-klikk; firma uten KS/HMS; mobilbredde/sidevalgets etiketter.
- Eksisterende `project-checklist-workspace-react-check.mjs` PASS: sammenfoldet liste, popup, lagring/gjenåpning, immutable fullføringer, svarmist/gjenforsøk, samtidige lagringer, bevart kladd og avviksoppfølging.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS med hele critical-kjeden. Ingen databaseprøver gjentas for en endring uten databaseeffekt.

Dette er faktisk React/DOM med syntetisk prosjektoppslag og sjekkliste-RPC. Ingen ansatt-, ordre- eller sjekklisterad er endret av prøvene. Innlogget skjermkontroll av publisert kode følger etter kodecheckpoint; den skal ikke graderes bestått på forhånd. Fysisk mobil, kamera, PDF/UE og to faktiske samtidige brukerøkter har ikke fått ny PASS.

## Kort brukerprøve

1. Oppdater samme Preview. På Startsiden skal du se Meny, og KS/HMS skal finnes inne i menyen ved din tilgang.
2. Åpne generell ordre → Sjekklister, åpne en liste og lukk popupen. Trykk ← Startside.
3. Meny skal fortsatt vises. Åpne Befaring/Tilbud eller KS/HMS fra Meny. Den gamle knapperekken skal ikke komme tilbake.

Ny bruker-TEST OK og Production-godkjenning er ikke gitt. Ingen main-merge, Production-endring eller demo-synk er utført.
