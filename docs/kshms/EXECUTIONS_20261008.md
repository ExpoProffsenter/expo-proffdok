# Vernerunder og 5×5-risiko – avgrenset leveranse

Kenneths rapport-TEST OK 8. oktober 2026 kl. 14:48 følges av tidligere avtalt utførelsesarbeid. Miljømål BEGGE, først samme feature/Sandbox Preview. Main 155f6c4ac01f126c1db0c65da385cfd9305587d5 beholdes.

## Scope før implementering

Nye filer: src/modules/kshms/kshmsExecutions.mjs, KshmsExecutions.jsx og kshmsExecutions.css; avgrenset RPC/tabell-migrasjon for private gjennomføringer, nye critical/React/rollback-databaseprøver og dette notatet. KshmsModule.jsx får to interne faner med bevart montert arbeidsflate. package.json får den nye kritiske kontrollen. README, arkitektur, Hjelp og fortsettelsesnotater beskriver den ferdige leveransen. Eksisterende prosjekt-/SJA-/RUH-lagring, rapport, global meny, innlogging, autosave, offentlig portal og eksisterende avviks-/varslingsfunksjoner endres ikke. Kontrollavvik opprettes via den eksisterende avvikskommandoen, med separat stabil kildekobling.

Vernerunder kan startes med egne punkter eller en publisert firmamal, med eller uten prosjekt. OK/avvik/ikke aktuelt, kommentarer og nødvendige bilder sikres i privat gjennomføring. Lagre viderefører utkast; fullføring krever dokumenterte svar og utførerens egen bekreftelse. En ny gjennomføring beholder den gamle. Fullføring lukker ingen avvik.

Risiko har tomme, jobbspesifikke fare-/konsekvens-/tiltaksfelt, begrunnelse, medvirkning, sannsynlighet/konsekvens før og etter planlagte tiltak, ansvarlig, frist og dokumentert oppfølging. 5×5 er valgt produktmodell, ikke et universelt lovkrav. Grenser og aksept dokumenteres av firmaet for den konkrete vurderingen; lav score skal ikke fremstilles som automatisk klarsignal. Fullførte vurderinger bevares og ny vurdering opprettes separat.

Utkast avgrenses på bruker/firma/type/ID, med revisjonskontroll, idempotent retry, kontrollert readback og vern mot sene svar. Sluttkontroll og samme Preview-publisering gjenstår. Ingen ny innlogget nettleser-/mobil-PASS hevdes ved oppstart.
