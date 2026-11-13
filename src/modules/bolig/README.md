# Boligoppfølging på Min side

`BoligMyTasks` leser egne åpne oppgaver fra eksisterende `bolig_my_project_tasks`. Første visning er åpnet med høyst fire rader. Brukeren kan folde listen sammen med overskriften. Det bevisste valget beholdes gjennom samme scopes foreground-oppdateringer. **Vis flere boligoppgaver** bruker lastede rader; **Hent flere boligoppgaver** bruker eksisterende servercursor. Ingen oppgaver eller statuser lagres av denne listen. Oppgavens bygg, oppgangsadresse (eventuelt byggadresse), bolignummer og rom vises sammen med prosjektet, slik at like bolignumre kan skilles. Lokasjonen følger samme autoriserte RPC-rad, også for valgt oppgave utenfor første side; klienten gjør ingen ekstra tilgangslesning.

Fremdrift, RUH/avvik, vernerunde og risikovurdering åpner sine eksisterende arbeidsflater. Valgt oppgave må fortsatt finnes i et ferskt resultat med riktig bruker/firma og native KS-kontekst. Feilet tillatt lesing tilbyr retry. Tom bekreftet liste og manglende tilgang viser ikke et tomt oppgavekort. Eksisterende reader eier focus/visibility, firma- og revokeringsgrenser. Etter lukking returnerer fokus til samme oppgaveknapp først når ferskt resultat er lastet. Hvis oppgaven er borte, brukes listeoverskriften. Bevisst fokus et annet sted og endret firmascope overstyres ikke.

`BoligPresenceCard` beskriver **Registrert på prosjektet** eller **Ikke registrert på prosjektet**. Dette er byggeplassens tilstedeværelse. **Registrer inn/ut** bruker den eksisterende request-ID, revisjon, kvittering og usikkert-svar-retry. Ordlyden endrer ingen appøkt eller bemanningsregistrering.

## Resultat i sjekklister

BoligQuality og BoligPartnerQuality bruker BoligChecklistStatusChoices. Valgene viser 20px statusbokser i minst 44px trykkflater med 16px tekst. OK og Ikke aktuelt er grønne; Avvik er oransje. Trykk på valgt resultat igjen for å tømme det. Lukket avvik vises bare der det opprinnelige serverlagrede svaret tillot lukking, og Ikke aktuelt skjules når punktet forbyr det.

Komponenten sender bare den opprinnelige statusverdien til editorens eksisterende patch. Native fieldset eier sperring ved lesetilgang, fullføring og pågående kommando. Kladd, etterfølgende feltbekreftelser, avvikskrav, lagring, kvittering og eksakt retry har samme eier. Ingen signaturkrav fra ordinære utførelsessjekklister innføres i Bolig/UE av denne presentasjonsendringen.

## Katalog, oppgaver og retur

Katalogsøk viser «Kontrollerer katalogtilgangen» mens eksisterende lesekontroller venter. Bekreftet avslag, kontrollfeil og endret firma/tilgang har egne tekster. Ingen katalog eller søkeresultat vises før riktig bruker/firma er bekreftet; et gammelt svar kan ikke gjenåpne oppslaget etter tilbakekalling. Manuelle varelinjer er tilgjengelige som før. Ingen nye katalogrettigheter eller RPC-er innføres.

I prosjektlederens UE-/leverandørdetalj har store lister **Søk i oppgaver**, **Status for oppgaver** og **Vis flere oppgaver**. Første side viser20oppgaver. Søk går gjennom hele den allerede autoriserte listen, inkludert skjulte sider. Det endrer ingen datoer, svar, bestillinger eller status. Oppgavens historikk beholdes. Partnerportalens eksisterende tidslinje, filtre og paging beholdes uendret.

Arbeidssted for KS/HMS og timer viser bolignummer med tilhørende bygg/adresse; verdien er fortsatt samme bolig-ID. Endringsordretekst følger eksisterende status: klargjør og del før svar, vent ved publisert grunnlag, og leverandøroppfølging/nedlasting etter aksept.

BoligEditorDialog gjenoppretter fokus til den faktiske, fortsatt synlige åpningsknappen når panelet fjernes. Bevisst navigasjon, nytt panel eller utilgjengelig gammel åpner overstyrer retur. Tilgangsrevalidering beholder samme monterte kladd og native suspensjon; den mekanismen endres ikke.

Felles klargjøring (bygg, nummerering, rom/pakker) åpner til høyre. Det lange innholdet rulles separat fra handlingsfeltet nederst. Forhåndsvisning, Bekreft og lagre, lukk, sperrer og kvittering bruker samme native kode som før. På svært korte skjermer kan handlingsfeltet også rulles; ikonlukking beholdes i toppfeltet. Ingen rom eller pakke fordeles før den eksisterende eksplisitte bekreftelsen.

Under pågående lagring viser klargjøring, masseplan, datoflytting og enkeltaktivitet en ventebeskjed. Instruksjonen om usikkert resultat og eksakt retry gjelder etter at den eksisterende kommandoen har forlatt opptatt tilstand. UI-teksten endrer ingen request-ID, sperre, kvittering eller gjenoppretting.

Systemadmin kan også aktivere Boligprosjekter på det valgte firmakortet under Brukere og roller. Panelet låses da til valgt firma. Eksisterende separat firmatilgangsflate beholder firmavelgeren. Firmaadmin tildeler fortsatt brukerroller; ingen rolle gis automatisk.


## Beboerimport og felles eierportal

Boliger kan ha vanlige nummer som 24 og 38. `additional_contacts` lagrer inntil ni ekstra eiere ved siden av hovedkontakten. Alle bruker samme eksisterende beboerportal og kommersielle tilstand; bare hovedkontakten brukes i eksisterende e-postfunksjoner. Endret eierliste tilbakekaller den delte portallenken og åpne dokumentlenker.

Importer beboere fra Excel åpnes i samme høyrepanel som felles klargjøring, med separat rulling og fast handlingsfelt. XLSX/CSV leses lokalt. Brukeren kontrollerer kolonner, boligkobling, hovedkontakt og eventuell overskriving før én atomisk lagring. Importen oppretter ingen boliger eller utsendinger. Samme bolignummer på ulike adresser skilles. Uklare koblinger må velges manuelt. Usikkert svar beholder nøyaktig samme forespørsel for retry.

Se `docs/architecture/BOLIG_HOUSEHOLD_CONTACTS.md` og `docs/qa/BOLIG_ORVEI_20261112.md` før installasjon.

### Beboerlenker og bestillingsfrister samlet
Oppsett → Bygg og boliger → Beboerlenker og frister samlet åpner etablert høyrepanel. Filtrer bygg/blokk eller eksisterende stammegruppe; velg boliger eksplisitt og kontroller hele listen. Klargjør lenker før separat bekreftet utsending til alle registrerte eiere med e-post. Aktive lenker erstattes bare etter egen bekreftelse. Uavklarte handlinger beholdes for eksakt retry. E-post kan fortsatt være pauset.

Sett bestillingsfrist viser gammel/ny dato per valgt bolig. Nye tilvalg stoppes utløpsdagen ved midnatt norsk tid; prosjektleder kan sette ny dato for valgte boliger. Dette er ikke svarfrist på en utsendt avtale. Oppsett krever household_contacts og deretter resident_batch_deadlines-migrasjonen, samt oppdatert resident-link-email Edge-template. Se [arkitektur](../../../docs/architecture/BOLIG_HOUSEHOLD_CONTACTS.md) og [QA](../../../docs/qa/BOLIG_ORVEI_20261112.md).

## Flytt bolig

Oppsett → Bygg og boliger → Flytt bolig bruker eksisterende `bolig_prepare` med `kind: placement`. Første versjon bytter etasje/plass mellom to aktive boliger i samme oppgang. Forhåndsvisningen viser begge før/etter; eksisterende kladd, scopekontroll, basis/revisjon og eksakt kvitteringsretry beholdes. Ingen nye boliger opprettes. ID, nummer, kontaktfelt, rom, valg, frister, portaler og fremdrift beholdes. Egne fasadebildefelt og historiske dokument-/bestillingssnapshots endres ikke. Offisielt bolignummer må kontrolleres separat.

Krever den nye migrasjonen `20261113175328_bolig_unit_placement.sql` før UI tas i bruk. Ingen eldre installasjoner skal kjøres om igjen. Se [plassbytte](../../../docs/architecture/BOLIG_UNIT_PLACEMENT.md) for avgrensning og kontroll.

### Felles bestillingsklokkeslett

Migrasjonen `20261113191737_bolig_project_deadline_time.sql` gir ett klokkeslett for hele prosjektet under «Beboerlenker og frister samlet». Nye/udaterte prosjekter bruker 12:00; tidligere daterte prosjekter bevarer dagsslutt frem til manager endrer tiden. Fristdatoen er fortsatt per bolig. Se `docs/architecture/BOLIG_PROJECT_DEADLINE_TIME.md`.
