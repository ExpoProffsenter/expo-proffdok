# Sjekklister

`StandaloneChecklists` åpnes fra Meny → Sjekklister eller Startside → Fyll ut sjekkliste, uten prosjekt-ID. Prosjektliste beholder en ekstra inngang. Ordrenummer og arbeidssted/adresse er påkrevd. Valgfritt eksternt prosjektnavn og kunde/oppdragsgiver følger også lagret kontroll, PDF og e-post. Publisert firmamal eller egen liste bruker eksisterende `ChecklistFields`/`ChecklistFieldBuilder` og de kanoniske serverhjelperne. Eksisterende prosjekt-/boligkontroller beholder egne komponenter/RPC-er.

Lokal kladd er bruker-/firmascopet. Lagre/fullfør krever command + egen readback før lokal kladd fjernes. Eksakt request-ID og payload beholdes ved ukjent utfall. En annen kontroll kan leses uten å overskrive en eksisterende lokal kladd. Forkasting av kladd krever eksplisitt bekreftelse og er sperret under uavklart lagring. Fullførte kontroller og lagrede definisjoner er låst. Endring av sporingsopplysningene opphever feltbekreftelser, også på serveren. Tidligere ufullstendige testkontroller bevares uten automatisk metadata/backfill. Fersk firmatilgang og eier kontrolleres før lesing, lagring, PDF og e-post.

E-post er en eksplisitt brukerhandling til én selvvalgt mottaker. Backend lager PDF fra lagret revisjon og fryser første vedleggsbyte. Ved ukjent status beholdes samme mottaker, revisjon og request-ID. UI lover ikke innbokslevering. Sammefirmas fokusoppfrisking skal bevare usendt arbeid; reelt firmabytte skjuler tidligere innhold.

Nye tester: standalone-checklists-db-check.mjs, standalone-checklist-email-check.mjs og standalone-checklists-browser-check.mjs. Browserprøven bruker faktisk React/HTTP/PostgreSQL og PDF; bare innlogging/transportbinding og ekstern e-postleverandør er isolert.
