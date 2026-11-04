# Boligoppfølging på Min side

`BoligMyTasks` leser egne åpne oppgaver fra eksisterende `bolig_my_project_tasks`. Første visning er åpnet med høyst fire rader. Brukeren kan folde listen sammen med overskriften. Det bevisste valget beholdes gjennom samme scopes foreground-oppdateringer. **Vis flere boligoppgaver** bruker lastede rader; **Hent flere boligoppgaver** bruker eksisterende servercursor. Ingen oppgaver eller statuser lagres av denne listen.

Fremdrift, RUH/avvik, vernerunde og risikovurdering åpner sine eksisterende arbeidsflater. Valgt oppgave må fortsatt finnes i et ferskt resultat med riktig bruker/firma og native KS-kontekst. Feilet tillatt lesing tilbyr retry. Tom bekreftet liste og manglende tilgang viser ikke et tomt oppgavekort. Eksisterende reader eier focus/visibility, firma- og revokeringsgrenser.

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
