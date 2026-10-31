# Sjekklister

`StandaloneChecklists` åpnes fra Meny → Sjekklister eller Startside → Fyll ut sjekkliste, uten prosjekt-ID. Prosjektliste beholder en ekstra inngang. Ordrenummer og arbeidssted/adresse er påkrevd. Valgfritt eksternt prosjektnavn og kunde/oppdragsgiver følger også lagret kontroll, PDF og e-post. Publisert firmamal eller egen liste bruker eksisterende `ChecklistFields`/`ChecklistFieldBuilder` og de kanoniske serverhjelperne. Eksisterende prosjekt-/boligkontroller beholder egne komponenter/RPC-er.

Lokal kladd er bruker-/firmascopet. Lagre/fullfør krever command + egen readback før lokal kladd fjernes. Eksakt request-ID og payload beholdes ved ukjent utfall. En annen kontroll kan leses uten å overskrive en eksisterende lokal kladd. Forkasting av kladd krever eksplisitt bekreftelse og er sperret under uavklart lagring. Fullførte kontroller og lagrede definisjoner er låst. Endring av sporingsopplysningene opphever feltbekreftelser, også på serveren. Tidligere ufullstendige testkontroller bevares uten automatisk metadata/backfill. Fersk firmatilgang og eier kontrolleres før lesing, lagring, PDF og e-post.

E-post er en eksplisitt brukerhandling til én selvvalgt mottaker. Backend lager PDF fra lagret revisjon og fryser første vedleggsbyte. Ved ukjent status beholdes samme mottaker, revisjon og request-ID. UI lover ikke innbokslevering. Sammefirmas fokusoppfrisking skal bevare usendt arbeid; reelt firmabytte skjuler tidligere innhold.

Nye tester: standalone-checklists-db-check.mjs, standalone-checklist-email-check.mjs og standalone-checklists-browser-check.mjs. Browserprøven bruker faktisk React/HTTP/PostgreSQL og PDF; bare innlogging/transportbinding og ekstern e-postleverandør er isolert.

## Signering av utførelse og firmamal

Vanlige prosjekt-/eksterne utførelseskontroller bruker `ChecklistSignatures` og `ChecklistSignaturePad` (samme tegneinteraksjon og utseende som Overtagelse). Prosjekteringskontrollen er eksplisitt unntatt; ingen Bolig-/UE-/vernerunde-/risiko- eller Overtagelse-endring. Signaturer ligger på kontrollnivå, uten endringer i låste fag-/produkt-/garantidefinisjoner. Fullførte eldre dokumenter vises ærlig uten oppdiktet signatur.

Tegnet egen signatur kreves ved fullføring. Ekstern signatur er valgfri, men ved bruk kreves navn/rolle/firma. Endrede svar/definisjon/sporingsopplysninger nullstiller tegninger; endret eksternt navn/rolle nullstiller ekstern tegning. Canvas har fast backingflate, pointer-capture, og lokal sikring av påbegynte pennestrøk; rotasjon endrer bare visningsstørrelsen. Signaturer følger lokal kladd og serverens lagrede kontroll, egen readback, PDF og e-postsnapshot.

Nye UI-kommandoer er `project_checklist_signed_command` og `standalone_checklist_signed_command`, alltid med strengt krav. Original request/payload og transportvariant beholdes ved uavklart retry; eldre ventende forespørsler kan avklares uten å endre fingerprint. Privat `execution_signature_rollout.enforced=false` holder eldre Demo i drift under Preview. Etter separat TEST OK og verifisert publisering av begge UI-er skal rollout aktiveres, slik at også eldre kommandoer krever signatur på nye fullføringer. Gamle kvitteringer og fullført historikk blir stående.

`ChecklistFirmTemplate` kopierer bare `checklistContent(definition)` gjennom eksisterende mal-RPC/egne readback og rettigheter. Utkast og publisering er separate valg. Klientens frosne maljobb har egen nøkkel per bruker/firma/kontroll; uavklart maljobb endrer aldri kontrollsvar eller signaturer. Ingen personlig malsentral eller automatisk firmapublisering.
