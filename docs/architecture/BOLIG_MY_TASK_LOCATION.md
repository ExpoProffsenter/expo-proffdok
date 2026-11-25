# Lokasjon for egne boligoppgaver

`bolig_my_project_tasks` beholder eksisterende endepunkt, argumenter, tilgangskontroller, oppgavesortering, cursor og 100-raders servergrense. Den private lesefunksjonens `prepared`-uttrekk legger til `block_name` og `address` på allerede autoriserte oppgaver. Oppgangens adresse brukes først, med byggadressen som reserve. Oppgang og bygg må tilhøre oppgavens rotprosjekt.

Begge feltene følger også `selected`, slik at en oppgave utenfor første side får samme identitet. Prosjektoppgaver uten bolig har null lokasjon. Ingen nye oppgaver, rettigheter, tabeller, eksterne kall eller skrivehandlinger innføres. Eksisterende `SECURITY DEFINER`, tom `search_path` og ACL beholdes; migreringen gir ingen nye EXECUTE-rettigheter.

`BoligMyTasks` viser prosjekt, bygg, adresse, bolignummer og rom. Tomme felt utelates, slik at gammel backend fortsatt kan brukes av klienten. Åpning bruker samme task-ID/unit-ID som før. Visningen lagrer ikke noe.

Migreringen `20261104233315_bolig_my_task_location.sql` er opprettet med Supabase CLI. Før erstatning kontrolleres eksisterende `prosrc` mot den ferskt leste baselinehashen `28ae5446fd6364d6896790484cb2e819` eller samme allerede oppdaterte funksjon `4938e4fcbd6fb8c27528f1f429c53ecd`. Ukjent senere endring stopper installasjonen.

Produksjonssetting krever egen kontroll av faktisk miljø, migreringshistorikk og funksjonsdefinisjon. Oppdateringen er additiv og kompatibel med gammel klient. Tilbakeføring av klienten krever ingen datanullstilling; feltene kan bli stående. Hvis SQL skal tilbakeføres, kontrolleres først at ingen senere funksjonsendring overskrives, og bare den tidligere funksjonsdefinisjonen fra `20261024115852_bolig_project_integration.sql` gjenopprettes. Ikke kjør hele den gamle migreringen om igjen.
