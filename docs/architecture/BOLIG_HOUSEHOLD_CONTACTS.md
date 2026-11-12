# Beboere og delt portal

Miljømål BEGGE. Ny migrasjon: 20261112222106_bolig_household_contacts.sql. Ingen eldre installasjonsskript skal kjøres.

En bolig beholder én primær kontakt og får et validert JSON-felt med maksimalt ni ekstra kontakter (stabil UUID, navn, e-post, mobil). Dette er kontaktdata, ikke egne brukerkontoer. Den eksisterende portalens bolig-ID, valg, avtaler og bestillinger deles. Ingen separat tilgang eller signaturidentitet per eier innføres.

Endret liste over ekstra eiere tilbakekaller eksisterende portaltoken og dokumenttoken. A→B→A gjenoppliver ikke token. Hovedkontaktens eksisterende tilbakekallingsregler beholdes. Ren endring av hovedkontaktens mobil beholder portal. Uendret liste skal bevare lenker.

Workspace-wrapperen beholder gjeldende gateway/firmatilgang og revisjonskontroll. resident_import krever manager, aktivt firma og prosjekt, forventet revisjon, før-verdier, unike aktive boliger og gjennomgått liste. Maks 500 boliger lagres atomisk. Eksakt retry bruker eksisterende preparation_receipts med separat intent og kontrollerer identisk payload. Gamle unit-kall uten additional_contacts bevarer eksisterende eiere. Ingen tabelltilgang gis til klienten.

Regnearket leses i nettleseren med størrelsesgrenser. Formler og eksterne ark avvises. Kladd lagres med eksisterende bruker-/firma-/prosjektavgrensning. Før lagring vises eksisterende kontakter og eksplisitt erstatning kreves. Serveren håndhever de samme data- og tilgangsgrensene.

Flere bygg ved beboervarsel er klientvalg som lagrer eksplisitte bolig-ID-er i eksisterende utkast. Serverens publisering og transportregler er uendret. Flere eiere endrer ikke e-postmottakere eller aktiverer rutine-e-post.

Tilbakeføring: rull tilbake appkode; behold tilleggskolonnen og registrerte kontakter. Ikke dropp kolonnen eller slett eiere. En eventuell database-reversering krever egen kontroll av gatewaykjeden, inkludert supportleveransen.
