# Gjeldende leveransestatus – 13.11.2026

Miljømål BEGGE. PR329 «Flytt bolig» er merget etter Kenneths TEST OK, innlogget sandboxprøve og grønn CI43481234531 (alle ti jobber). Funksjonscommit på main: `f60495f9fad7ca83ec375ff798a44a552d17ad5c`. Se [PR329](https://github.com/ExpoProffsenter/expo-proffdok/pull/329) for fersk Production-/demo-verifisering, publiserte SHA-er og tilbakeføring. Status der er publiseringsfasit; gamle ventetekster i endringsgrunnlag er historiske.

Oppsett → Bygg og boliger → Flytt bolig bytter etasje/plass mellom to eksisterende boliger i samme oppgang. Identitet, beboere og avhengige data beholdes. Hjelp er oppdatert. Flytting mellom bygg/oppganger inngår ikke. PR325, PR327 og PR328 er bevart uendret i denne leveransen. Tidligere supportarbeid er integrert i main; eldre køopplysninger nedenfor i historiske logger er ikke aktuell status.

Bare den nye migrasjonen bolig_unit_placement er installert: produksjon `20261113181747`, sandbox `20261113175945`. Ikke installer disse eller tidligere migrasjoner på nytt. Ingen kundedata er flyttet under publiseringen, og ingen e-post er sendt. Rutine-e-post og sandboxutsending forblir sperret; tidligere avtalt manuell beboerlenkeutsending i produksjon er uendret.

Orvei/Aamodthagen: beboerliste og fremdriftsplan er mottatt. Første navn skal brukes som hovedkontakt. Riktig bygg/adresse skal fastslås fra kildene; ikke gjett etasje fra leilighetsnummer. Denne leveransen importerer ikke beboere eller endrer prosjektoppsettet. Bred app-QA, resterende videoer og naturlig A–Å-løp er ikke erklært ferdige gjennom PR329.

Ingen brancher er slettet og ingen ny overvåking er opprettet. Videre Orvei-arbeid og videorevisjon følger egne QA-grunnlag. Se [plassbyttearkitektur](docs/architecture/BOLIG_UNIT_PLACEMENT.md), [Orvei QA](docs/qa/BOLIG_ORVEI_20261112.md) og [videoopptaksmanus](docs/qa/BOLIG_BATCH_VIDEO_20261113.md).
