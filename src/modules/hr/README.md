# HR: private medarbeidersamtaler

HrConversations bruker eksisterende rolle- og revisjonskontroller gjennom hrConversationSession. Personlige kladder beholdes bare i avgrenset sideminne per bruker/firma/medarbeider; de skrives ikke til localStorage/sessionStorage. Lagre på serveren før full oppdatering eller lukking av siden.

## Tekst uten skjult avkorting

Forberedelse, møtereferat og egne kommentarer har eksisterende servergrense på 4000 tegn per felt; tiltak har 600. ConversationText beholder hele innlimingen og viser teller samt en tilgjengelig feil ved overskridelse. hrConversationText teller Unicode-kodepunkter som PostgreSQL. Hele lagringsforsøket valideres før første mutasjon, også når endret tid/sted og kommentarer lagres sammen med møtereferat. Bare felter brukeren har skriverett til valideres. Historiske utgaver og den andre partens tekst endres ikke.

Dette øker ikke servergrensene. Høyere grenser og samlet tiltak-/oppfølgingsflyt krever egen kontrakt og regresjonstester. Bekreftelse, deling, historikk, PDF, varsler og e-postpolicy beholdes.
