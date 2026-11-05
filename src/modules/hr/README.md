# HR: private medarbeidersamtaler

HrConversations bruker eksisterende rolle- og revisjonskontroller gjennom hrConversationSession. Personlige kladder beholdes bare i avgrenset sideminne per bruker/firma/medarbeider; de skrives ikke til localStorage/sessionStorage. Lagre på serveren før full oppdatering eller lukking av siden.

## Tekst uten skjult avkorting

Forberedelse, møtereferat og egne kommentarer har eksisterende servergrense på 4000 tegn per felt; tiltak har 600. ConversationText beholder hele innlimingen og viser teller samt en tilgjengelig feil ved overskridelse. hrConversationText teller Unicode-kodepunkter som PostgreSQL. Hele lagringsforsøket valideres før første mutasjon, også når endret tid/sted og kommentarer lagres sammen med møtereferat. Bare felter brukeren har skriverett til valideres. Historiske utgaver og den andre partens tekst endres ikke.

Dette øker ikke servergrensene. Høyere grenser og samlet tiltak-/oppfølgingsflyt krever egen kontrakt og regresjonstester. Bekreftelse, deling, historikk, PDF, varsler og e-postpolicy beholdes.

## Samlet samtale og tiltak

Private samtaler viser tre arbeidssteg: Forberedelse → Samtale og tiltak → Referat. Serverens stadier og internt referat-ID3 beholdes. Et tidligere UI-valg for Tiltak (ID2) normaliseres til samlet steg1, også ved gjenåpning, initialStep og fersk autorisering. Samme draft-eier og handlers brukes. Neste fra møte går direkte til Referat; Forrige og Tilbake til samtale og tiltak går tilbake til samme usendte data uten skriving.

Medarbeiderens delte forberedelse kan leses i en lukket detaljvisning, så møtereferat og tiltak kommer tidligere på siden. Lagrede spørsmål/tekster endres ikke. Ansvar/frister registreres i tiltakene; gjentakelse i møtenotatet er unødvendig. Neste oppfølging er fortsatt påkrevd av eksisterende serverkontrakt når tiltak finnes. Endringen gir ingen nye rettigheter og endrer ikke varslingsmotor, kalender, PDF eller partenes egne bekreftelser. Den separate lokale Sandbox-prøvesamtalen har fortsatt sin tidligere flyt.
