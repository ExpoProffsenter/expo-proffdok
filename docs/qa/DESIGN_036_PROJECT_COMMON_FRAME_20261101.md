# Prosjekt – felles ramme, radklikk og retur

Dato 1. november 2026. PR295 / design01-app-ramme-20261028. Forelder e168d7fbbe3b2d21c3446a14ed9c0f38d8d14120. Miljømål BEGGE; bare arbeidsbranch/Preview er autorisert. Kenneths skjermbilder av Prosjekt og Tilbud er vurderingsgrunnlaget. Ingen samlet TEST OK.

## Endring

Den samme mørke hovedmenyen og hvite toppstripen brukes nå også i ordinære prosjekter. Prosjektmenyen er et eget nivå nedenfor, ikke en erstatning for hovedmenyen. Alle områder beholdes på desktop; mobil har egen gruppe med globale områder i prosjektmenyen. Klikk på prosjektnavn eller ledig radflate går til originalt prosjekt, mens Vis detaljer alene utvider detaljer. Knapper, lenker, skjema og tekstmarkering utløser ikke radåpning. Tastaturbruk beholder den opprinnelige Åpne-knappen. Tilbake står over prosjektnavnet og bruker eksisterende retur til prosjektlisten.

Tilgangsfiltrering, prosjekt-/global-faner og supportavgrensning er uendret. En global overgang bruker opprinnelig prosjektavslutning med kontroll av ulagret arbeid. Forsinket overgang avvises ved endret bruker, firma, prosjekt, fane eller bortfalt destinasjon. Lagring, garanti, overtagelse, signering, rapportmotor, database, e-post og installerte AI-bilder er ikke endret.

## Faktisk test

Isolert Vercel Sandbox med faktisk React/CSS og Chromium156: ny hovedrammeprøve99 krav PASS på seks størrelser fra320×480 til1920×1080. Den kjører faktisk hovedfilens navigasjonsrenderer og avslutningsfunksjon, inkludert avbryt, foreldet firma/bruker/prosjekt, bortfalt destinasjon, supportretur og Prissøk. Eksisterende prosjektmeny196, sjekklistepanel53, veiledning288+84, mobilheader91, liste280, meny-/kladdretur, arbeidsprofilkontroller og Prissøk70+94 består. Full critical/Vite build PASS.

Første to nye testforsøk stoppet i nye testfixture (manglende URL og JSX-importsti), ikke i appens transport. Fixture ble rettet uten å fjerne krav. Et syntetisk skjermbilde viste at gammel prosjekt-CSS fortsatt skjulte Alle områder. CSS-avgrensningen er rettet og faktisk synlighet/åpning testet på alle tre desktopstørrelser. Skjermbildene er av testkomponenter med syntetisk innhold, ikke av en innlogget kundesak.

Skynett: ny ekstern Chromium kan navigere til faktisk fast Preview, HTTP200, og vise Innlogging. Ingen adminpolicy er endret, ingen ny tredjepartsplugin er installert og gamle tokens/passord er ikke hentet. Den tidligere innloggede økten er ikke tilgjengelig. Derfor er full levende HOVED/RESERVE-/rolle-/Safari-gjennomgang fortsatt ikke attestert. Syntetiske tester er ikke en påstand om komplett live UX-godkjenning.

## Overlevering

Endringens presise scope og verifikasjon ligger i `docs/changes/project-common-frame-20261101.json`. Les fersk PR295-kommentar for eksakt kandidat, CI og READY. Publisering skal være til fast design-Preview, ikke Production eller permanent demo. Ved tilbakeføring kan denne avgrensede appcommitten reverseres; ingen database-/mediarollback kreves.
