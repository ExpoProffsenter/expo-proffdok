# Boligoppfølging på Min side

`BoligMyTasks` leser egne åpne oppgaver fra eksisterende `bolig_my_project_tasks`. Første visning er åpnet med høyst fire rader. Brukeren kan folde listen sammen med overskriften. Det bevisste valget beholdes gjennom samme scopes foreground-oppdateringer. **Vis flere boligoppgaver** bruker lastede rader; **Hent flere boligoppgaver** bruker eksisterende servercursor. Ingen oppgaver eller statuser lagres av denne listen.

Fremdrift, RUH/avvik, vernerunde og risikovurdering åpner sine eksisterende arbeidsflater. Valgt oppgave må fortsatt finnes i et ferskt resultat med riktig bruker/firma og native KS-kontekst. Feilet tillatt lesing tilbyr retry. Tom bekreftet liste og manglende tilgang viser ikke et tomt oppgavekort. Eksisterende reader eier focus/visibility, firma- og revokeringsgrenser.

`BoligPresenceCard` beskriver **Registrert på prosjektet** eller **Ikke registrert på prosjektet**. Dette er byggeplassens tilstedeværelse. **Registrer inn/ut** bruker den eksisterende request-ID, revisjon, kvittering og usikkert-svar-retry. Ordlyden endrer ingen appøkt eller bemanningsregistrering.

## Resultat i sjekklister

BoligQuality og BoligPartnerQuality bruker BoligChecklistStatusChoices. Valgene viser 20px statusbokser i minst 44px trykkflater med 16px tekst. OK og Ikke aktuelt er grønne; Avvik er oransje. Trykk på valgt resultat igjen for å tømme det. Lukket avvik vises bare der det opprinnelige serverlagrede svaret tillot lukking, og Ikke aktuelt skjules når punktet forbyr det.

Komponenten sender bare den opprinnelige statusverdien til editorens eksisterende patch. Native fieldset eier sperring ved lesetilgang, fullføring og pågående kommando. Kladd, etterfølgende feltbekreftelser, avvikskrav, lagring, kvittering og eksakt retry har samme eier. Ingen signaturkrav fra ordinære utførelsessjekklister innføres i Bolig/UE av denne presentasjonsendringen.
