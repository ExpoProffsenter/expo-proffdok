# Prosjektinvolverte følger prosjektets skrivevern

Miljømål BEGGE. Arbeidsbranch PR311 og samlet testkandidat PR309. Ingen produksjonssetting eller TEST OK.

## Årsak og retting

Kontaktpanelet injiseres som en egen React-root. Det ble flyttet mellom prosjektoversikt og Deltakere og tilganger, men fikk ikke main-visningens prosjektlås/support-skrivevern/lesetilgang. Dermed viste et låst prosjekt fortsatt redigerbare kontaktfelt, Fjern, Legg til og e-posthandlinger.

Main leverer nå eksplisitt prosjekt-ID og skrivevern på eksisterende prosjektskall. Panelet verifiserer samme ID mot aktiv URL før det monteres. Manglende skrivevern gir aldri redigering. En begrenset attributt-observasjon oppdaterer samme React-root ved låsing/opplåsing, uten ny innlasting eller utsletting av kladd. Midlertidig uavklart eier-ID skjuler og fryser samme prosjekts root; når identiteten er avklart, gjenfestes samme kontaktfelt og usendte melding. Et faktisk prosjektbytte rydder den gamle rooten som før.

Alle kontaktfelt, fjern/legg til, begge lagreknapper og en eventuell åpen e-postkladd deaktiveres i skrivebeskyttet visning. Endrings-, lagrings- og send-behandlere kontrollerer fersk eierkontekst, også før observerens neste frame. Ingen kode, transport eller tilgangslenke opprettes av kontaktredigering.

## Faktisk testgrunnlag

Ny negativ prøve mot gammel kode feilet på låst prosjekt med åpne kontakt- og e-postutkast. Rettet kode består lokalt 43 React/JSDOM-kontroller med faktisk main-kontekst og kontaktpanel. Testen omfatter alle tre skrivevernkilder, samme inputidentitet, usendt emne, ingen automatisk lagring, umiddelbar sperre før observer, midlertidig identitetsavklaring, manglende tillatelsesmarkør, eksisterende fokus/retur/fanebytte, separate lagreknapper og prosjekt-/portalisolasjon. Ingen asynkrone fokus-/DOM-feil.

Den eksisterende native Chromium-prøven er utvidet additivt med låsing/opplåsing og bevart usendt melding i 320/390/768/1363 px. Alle opprinnelige typografi-, fokus-, mobil-, kladd-, lagrings- og ingen-utsending-krav beholdes. Lokalt bygges denne faktiske fixturen uten browser; CI må kjøre native browser på eksakt kandidat. Lokal Sandbox-appbuild, critical og scope/dokumentasjon kontrolleres før publisering. Eksakte CI-/READY-/innloggede bevis registreres i PR309/311.

## Avgrensning og tilbakeføring

Dette er visnings- og kladdbeskyttelse. Ingen SQL/RLS, migrations, backendroller, portaltilgang, auth-klient eller e-posttransport endres. Allerede startede serverforespørsler kan ikke tilbakekalles av et UI-skrivevern. Full backendattest eller fysisk mobil/Safari er ikke hevdet. Ingen reell utsending eller produksjonsdataendring er gjort.

Tilbakeføring: revert denne avgrensede commit på arbeidsbranchen. Bevar samlet Bolig-kandidat ved å integrere core-rettingen i PR309. Produksjon/main og demo forblir uendret til eventuell uttrykkelig godkjenning.
