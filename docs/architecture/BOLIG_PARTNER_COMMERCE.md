# Prosjektbundet kommersiell samarbeidstilgang

Miljømål BEGGE. Ny privat RLS-tabell binder eksisterende navngitt partneradgang til auth-bruker, prosjekt og tre rettigheter. Kun prosjektleder administrerer gjennom offentlig security-invoker-wrapper og privat kontrollert funksjon. Ingen direkte tabelltilgang for klientroller. Ingen nye firmamedlemskap eller endring av aktivt firma.

Hver lesing/skriving kontrollerer navngitt e-post, godkjent aktiv profil, internt firmamedlemskap, modulaktivering, aktivt prosjekt, partnerutløp/tilbakekalling og uttrykkelig rettighet. Kun katalog/romprojeksjonene får prosjektbundet lesekontekst. Boligvalg og individuelle vare-/arbeidslinjer bruker eksisterende revisjon, validering og historikk. Avtaler og ordre sperrer samarbeidsskriving. Beboeraksept, utsending, ordrefunksjoner og HR åpnes ikke.

Min side legger til én isolert lazy-komponent. Etter fjerning av nøyaktig to integrasjonslinjer skal filen være byteidentisk med basen. Oppfrisking skal beholde samme editor; tilbakekalt tilgang skal fjerne den. Personrettighetsutkast sikres lokalt og usikkert lagringssvar gjenbruker samme request-id.

Installasjon: kontroller miljø og eksisterende funksjonsankre/migrasjon først. Installer ny migrasjon bare én gang. Ingen dataimport eller rettighetstildeling inngår. Tilbakeføring: tilbakekall personrettighetene og rull frontend tilbake; bevar audit/valg og migrasjonen. Ikke slett historikk. Produksjon krever grønn QA, Preview og TEST OK.


### Butikktillegg til eksisterende beboerportal
Migrasjon `20261113235139_bolig_shop_proposals.sql` følger partner_commerce. Ny `publish_shop`-rettighet er avslått som standard og tildeles separat på eksisterende prosjektadgang. RPC `bolig_shop_proposal` kontrollerer person, firma, prosjekt, bolig og rettighet før hver handling og før kvitteringsretry. Ingen medlemskap, arbeidsfirma eller generelle roller endres.

Den ansatte kan legge til manuelle varer uten katalogtilgang hos prosjektfirmaet, med varenummer, antall, enhetspris inkl. mva., valgfritt bilde og monteringspris for hele linjen. Katalogsøk bruker den ansattes eksisterende katalogrettigheter, mens prosjektadgangen kontrolleres separat. Server beregner beløpet og lagrer bare felter beregnet på beboeren. Lastede bilder komprimeres til JPEG (maks600px/120KB) og lagres i den private avtaleversjonen. Ingen offentlig bildebeholder eller ny lagringstilgang på tvers av firmaer. Hele forslag begrenses til1,5MB.

Et publisert forslag er et selvstendig butikktillegg (`commercial_documents`, source=shop, kind=change). Det endrer ikke boligvalg eller eksisterende ordre. En felles basis hindrer overskriving mellom ansatte; en tidligere ubesvart butikkversjon supersedes atomisk. Aksepterte versjoner beholdes, og videre tillegg får ny avtalegruppe. Den eksisterende portalens polling viser oppdateringen innen20sekunder. Kontaktbytte/tilbakekalling og ordinære akseptkontroller beholdes. Bestillingsfrist gjelder publisering; svarfrist er begrenset av aktiv portal og30dager.

Første leveranse er additive varer og montering. Erstatning/kreditering av eksisterende vare bruker fortsatt ordinær endringsavtale. Prosjektleder bekrefter faktisk leverandøroppfølging av akseptert tillegg i eksisterende apply-flyt; server oppretter da én separat ordered-bestilling med egne vare-/arbeidslinjer, mottak og FDV. Kvitteringsretry gir ikke dobbeltbestilling. Ingen automatisk utsending.

Tilbakeføring: slå av publish_shop og tilbakefør frontend. Bevar migrasjonen, avtalehistorikk, kvitteringer og allerede registrerte ordre. Produksjon krever separat kontroll og TEST OK.
