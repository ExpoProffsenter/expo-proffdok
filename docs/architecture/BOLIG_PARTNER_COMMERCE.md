# Prosjektbundet kommersiell samarbeidstilgang

Miljømål BEGGE. Ny privat RLS-tabell binder eksisterende navngitt partneradgang til auth-bruker, prosjekt og tre rettigheter. Kun prosjektleder administrerer gjennom offentlig security-invoker-wrapper og privat kontrollert funksjon. Ingen direkte tabelltilgang for klientroller. Ingen nye firmamedlemskap eller endring av aktivt firma.

Hver lesing/skriving kontrollerer navngitt e-post, godkjent aktiv profil, internt firmamedlemskap, modulaktivering, aktivt prosjekt, partnerutløp/tilbakekalling og uttrykkelig rettighet. Kun katalog/romprojeksjonene får prosjektbundet lesekontekst. Boligvalg og individuelle vare-/arbeidslinjer bruker eksisterende revisjon, validering og historikk. Avtaler og ordre sperrer samarbeidsskriving. Beboeraksept, utsending, ordrefunksjoner og HR åpnes ikke.

Min side legger til én isolert lazy-komponent. Etter fjerning av nøyaktig to integrasjonslinjer skal filen være byteidentisk med basen. Oppfrisking skal beholde samme editor; tilbakekalt tilgang skal fjerne den. Personrettighetsutkast sikres lokalt og usikkert lagringssvar gjenbruker samme request-id.

Installasjon: kontroller miljø og eksisterende funksjonsankre/migrasjon først. Installer ny migrasjon bare én gang. Ingen dataimport eller rettighetstildeling inngår. Tilbakeføring: tilbakekall personrettighetene og rull frontend tilbake; bevar audit/valg og migrasjonen. Ikke slett historikk. Produksjon krever grønn QA, Preview og TEST OK.
