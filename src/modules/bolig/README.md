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


### Navngitt pakke- og tilvalgssamarbeid
Systemadmin åpner prosjekt → Butikktilgang og finner en godkjent ansatt med eksakt e-post. Prosjektleder kan se og tilbakekalle. Ukjent konto må først opprettes/godkjennes i et av de tre interne firmaene. Min side → Mine boligprosjekter viser alle tildelte prosjekter. Ingen medlemskap eller arbeidsfirma flyttes. Krever migrasjon `20261114003459_bolig_shop_staff_admin.sql` etter butikkmigrasjonene. Se `docs/architecture/BOLIG_PARTNER_COMMERCE.md`. Eldre personrettigheter under UE og leverandører kan fortsatt tilbakekalles, men nye tildelinger gjøres under Butikktilgang.


### Butikktillegg til eksisterende beboerportal
Migrasjon `20261113235139_bolig_shop_proposals.sql` følger partner_commerce. `publish_shop` inngår i den nye systemadminstyrte Butikktilgang. Eldre partnerrettigheter bevares. RPC `bolig_shop_proposal` kontrollerer person, firma, prosjekt, bolig og rettighet før hver handling og før kvitteringsretry. Ingen medlemskap, arbeidsfirma eller generelle roller endres.

Den ansatte kan legge til manuelle varer uten katalogtilgang hos prosjektfirmaet, med varenummer, antall, enhetspris inkl. mva., valgfritt bilde og monteringspris for hele linjen. Katalogsøk bruker den ansattes eksisterende katalogrettigheter, mens prosjektadgangen kontrolleres separat. Server beregner beløpet og lagrer bare felter beregnet på beboeren. Lastede bilder komprimeres til JPEG (maks600px/120KB) og lagres i den private avtaleversjonen. Ingen offentlig bildebeholder eller ny lagringstilgang på tvers av firmaer. Hele forslag begrenses til1,5MB.

Et publisert forslag er et selvstendig butikktillegg (`commercial_documents`, source=shop, kind=change). Det endrer ikke boligvalg eller eksisterende ordre. En felles basis hindrer overskriving mellom ansatte; en tidligere ubesvart butikkversjon supersedes atomisk. Aksepterte versjoner beholdes, og videre tillegg får ny avtalegruppe. Den eksisterende portalens polling viser oppdateringen innen20sekunder. Kontaktbytte/tilbakekalling og ordinære akseptkontroller beholdes. Bestillingsfrist gjelder publisering; svarfrist er begrenset av aktiv portal og30dager.

Første leveranse er additive varer og montering. Erstatning/kreditering av eksisterende vare bruker fortsatt ordinær endringsavtale. Prosjektleder bekrefter faktisk leverandøroppfølging av akseptert tillegg i eksisterende apply-flyt; server oppretter da én separat ordered-bestilling med egne vare-/arbeidslinjer, mottak og FDV. Kvitteringsretry gir ikke dobbeltbestilling. Ingen automatisk utsending.

Tilbakeføring: slå av publish_shop og tilbakefør frontend. Bevar migrasjonen, avtalehistorikk, kvitteringer og allerede registrerte ordre. Produksjon krever separat kontroll og TEST OK.

Installer også `20261114001335_bolig_shop_order_identity.sql` etter butikkmigrasjonen; den bevarer bolignummer og bolig-ID i nye tilleggsordrer/eksport.
Fristkontrollen fullføres av `20261114001703_bolig_shop_project_deadline.sql`, som gjenbruker beboerportalens dato/klokkeslettregel fra PR332.

### Kombinerbare beboertilvalg
Ved klargjøring av invitasjonen kan prosjektleder velge «Kombiner tilvalg» og angi den inkluderte grunnpakken. Beboeren ser grunnpakken én gang og kan kombinere de delte tilvalgspakkene. Legg nødvendig arbeid/montering i samme tilvalgspakke. Samme underliggende vare/arbeid telles én gang; to erstatninger av samme grunnvare avvises. Grunnpakker/rom må være samme fryste utgave og uten manuell romfordeling/overstyrte varelinjer. Slike spesialoppsett bruker fortsatt ferdige pakkealternativer eller butikktillegg. Eksisterende portaler endres ikke før prosjektleder uttrykkelig deler ny kombinering.
Migrasjon `20261114153617_bolig_portal_combined_choices.sql` følger butikk-/portal-migrasjonene. E-post og firmatilgang er uendret. Butikkansatte finner prosjektene på Min side uten invitasjonsmail.

Opplastede grunnpakkebilder i beboerportalen trenger `20261114161925_bolig_portal_image_access.sql` og Edge `bolig-portal-images`. Den gyldige portallenken gir bare kortvarig tilgang til publiserte bilder fra samme firma/prosjekt. Katalogendringer endrer ikke allerede publiserte/frosne pakker; klargjør og publiser riktig utgave før beboeren skal se endringen.
### Felles bestillingsklokkeslett

Migrasjonen `20261113191737_bolig_project_deadline_time.sql` gir ett klokkeslett for hele prosjektet under «Beboerlenker og frister samlet». Nye/udaterte prosjekter bruker 12:00; tidligere daterte prosjekter bevarer dagsslutt frem til manager endrer tiden. Fristdatoen er fortsatt per bolig. Se `docs/architecture/BOLIG_PROJECT_DEADLINE_TIME.md`.

Fristdialogen viser dato og direkte klokkehandling før boliglisten. Valglisten ruller separat, og detaljert kontrolliste åpnes ved behov. Visning i frister, Gantt og beboerportal bruker dd.mm.åååå; fristinntasting bruker dd.mm.åååå uavhengig av nettleserspråk, mens lagring bruker ISO-dato. Oppsettets import- og fristinnganger er samlet som tydelige handlingskort.

Fremdriftsplanen sorterer grupper etter første aktivitetsdato og aktivitetene i hver gruppe fra første til siste dato. Dag/uke/måned viser bare aktiviteter som overlapper valgt periode, inkludert arbeid som startet tidligere og fortsatt pågår. Hele planen viser alle aktiviteter i utvalget.

## Prosjektinfo og fasade
Prosjektleder kan redigere navn og referanse via Rediger prosjektinfo ved prosjektnavnet eller under Oppsett → Bygg og boliger. Skjemaet åpnes i et eget vindu med bevart lokal kladd. `project_info` i eksisterende bolig_workspace følger firma, rolle og root-revisjon. Migrasjon 20261114180324 kreves. Kladd bevares ved konflikt. Fasadebokser er lyse og delvis transparente, med uendret bolig-ID, status og klikkhandling. E-posttekster beskriver faktisk aktivering uten å kalle produksjon et testmiljø. Transportinnstillinger endres ikke.

### Brukerbestilt e-post og prosjektvise påminnelser
Migrasjon `20261114181325_bolig_project_reminders.sql` skiller transport fra prosjektets frivillige fristpåminnelser. Prosjektleder bruker Fremdrift og varsler → Automatiske fristpåminnelser. Standard er av, også for eksisterende prosjekter. `reminders` bruker eksisterende firma-/rollekontroll, planrevisjon og forsøkskvittering; av stopper ventende owner-leveranser og ny worker-validering. Beboervarsler, lenkeutsending og meldingsvarsler er uavhengige av prosjektvalget. Ingen transport aktiveres av migrasjonen.

Boligoversiktens `catalog_empty` er en prisfri prosjektstatus fra `bolig_overview`, kun etter eksisterende firmatilgang. Tomt pakke-/tilvalgsoppsett vises som «Grunnpakke og tilvalg er ikke klargjort»; bolig uten valg i et oppsatt prosjekt vises som «Boligvalg ikke startet». Lagrede valg og endrede grunnlag beholder sine statuser. Migrasjon 20261114191448 kreves for presis tomstatus.

## Butikkens boligoversikt

Min side → Mine boligprosjekter bruker eksplisitt Bytt bolig og klikkbare søkeresultater. Søket endrer aldri målboligen. En valgt bolig utenfor søket markeres. Varer og publiseringskvittering beholder eksisterende bruker/firma/prosjekt/bolig-avgrensning. Boligbytte sperres mens bildet klargjøres eller forespørselen pågår; etter usikkert svar beholdes eksakt retry på opprinnelig bolig. Forhåndsvisningen viser mottakerbolig, adresse og hovedkontakt.

Migrasjonen `20261114195127_bolig_shop_unit_overview.sql` utvider eksisterende `my_collaborations` med telefon, e-post, serverberegnet `choice_deadline_at` og åpne aktiviteter sortert etter start/slutt/ID. Bare kvalifiserte ansatte med aktiv personlig `shop_staff_access` får disse tilleggsfeltene. Eksisterende overordnet autorisasjon, firmaskille og partnerrettigheter beholdes. Ingen endring av kontaktdata, plan, fristregler, medlemskap eller e-post. Visningen bruker oppgangens registrerte adresse og hovedkontakt; den konstruerer ikke poststed eller en ny oppstartsregel. Ferdige og arkiverte aktiviteter utelates. Tomme felt beskrives som ikke registrert.
