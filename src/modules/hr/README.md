# HR: private medarbeidersamtaler

HrConversations bruker eksisterende rolle- og revisjonskontroller gjennom hrConversationSession. Personlige kladder beholdes bare i avgrenset sideminne per bruker/firma/medarbeider; de skrives ikke til localStorage/sessionStorage. Lagre på serveren før full oppdatering eller lukking av siden.

## Tekst uten skjult avkorting

Denne kandidaten bruker 10000 tegn per felt i forberedelse, møtereferat og egne kommentarer; tiltak har 2000. Utvidelsen er installert i Sandbox, mens Production krever separat autorisert migrering før klienten tas i bruk. ConversationText beholder hele innlimingen og viser teller samt en tilgjengelig feil ved overskridelse. hrConversationText teller Unicode-kodepunkter som PostgreSQL. Hele lagringsforsøket valideres før første mutasjon, også når endret tid/sted og kommentarer lagres sammen med møtereferat. Bare felter brukeren har skriverett til valideres. Historiske utgaver og den andre partens tekst endres ikke.

Når brukeren retter en avvist tekstlengde, følger den lokale lengdefeilen gjeldende kladd og forsvinner når teksten er innenfor grensen. Lagringsfeil og revisjonskonflikter beholdes. Redigering lagrer ikke automatisk. Bekreftelse, deling, historikk, PDF, varsler og e-postpolicy beholdes.

## Samlet samtale og tiltak

Private samtaler viser tre arbeidssteg: Forberedelse → Samtale og tiltak → Referat. Serverens stadier og internt referat-ID3 beholdes. Et tidligere UI-valg for Tiltak (ID2) normaliseres til samlet steg1, også ved gjenåpning, initialStep og fersk autorisering. Samme draft-eier og handlers brukes. Neste fra møte går direkte til Referat; Forrige og Tilbake til samtale og tiltak går tilbake til samme usendte data uten skriving.

Medarbeiderens delte forberedelse kan leses i en lukket detaljvisning, så møtereferat og tiltak kommer tidligere på siden. Lagrede spørsmål/tekster endres ikke. Ansvar/frister registreres i tiltakene; gjentakelse i møtenotatet er unødvendig. Neste oppfølging er fortsatt påkrevd av eksisterende serverkontrakt når tiltak finnes. Endringen gir ingen nye rettigheter og endrer ikke varslingsmotor, kalender, PDF eller partenes egne bekreftelser. Den separate lokale Sandbox-prøvesamtalen har fortsatt sin tidligere flyt.


Medarbeidersamtalens svar/kommentarer har grense10000 Unicode-kodepunkter, tiltak2000. Skjema og lokal preflight bruker delte konstanter i hrConversationText; hele innliminger beholdes også over grensen. Serverens separate validate_extended_conversation_answers brukes bare av hr_conversation_command. Den tidligere validate_conversation_answers og sykefraværsflyten beholdes uendret.24spørsmål med10000firebyte-tegn passer i svargrensen1100000bytes; kommandoen har1800000bytes. Eier/frister/maks12tiltak, nødvendige svar, roller, CAS/PT409, historikk, bekreftelser og varsling er uendret. Migrasjonen kontrollerer forventet funksjonskropp før erstatning. Serverutvidelsen må installeres og kontrolleres før klienten tas i bruk. Etter lagring av lengre tekster skal ikke servergrensene senkes igjen; feil rettes fremover uten å korte eller slette historikk.
