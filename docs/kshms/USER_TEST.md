# Brukertest av KS/HMS-håndboken

Oppdatert 2026-10-06. Dette gjelder håndboken som er klar for testing nå. Resten av KS/HMS-modulen følger leveranseplanen.

Bruk alltid [samme Preview-adresse](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe) i samme nettleser. Nye oppdateringer kommer på denne adressen. Oppdater siden etter at en ny versjon er klar. Du skal normalt fortsatt være innlogget. En annen adresse, en annen nettleser, privat vindu eller en avsluttet økt kan kreve ny innlogging. Preview bruker Sandbox.

## Dette vil vi at du tester nå

| Steg | Dette gjør du | Dette skal skje |
|---|---|---|
| 1. Fast adresse og forklaringer | Oppdater siden på den faste adressen. Åpne KS/HMS og se gjennom de fire fanene. | Du er fortsatt innlogget hvis økten er aktiv. Hver fane forklarer hva du gjør der og hva du skal gjøre videre. Si fra hvis en tekst eller et ord er uklart. |
| 2. Oppstart og tilgang | Velg fag. Skriv kort i de tre feltene. Se at du selv finnes i listen over KS/HMS-ansvarlige. Velg riktig ansvarlig og trykk **Lagre oppstart** hvis oppsettet skal endres. | Feltene har eksempler. Egen firmaadmin vises som «deg». Lagret oppstart bekreftes, med beskjed om å gå til Håndbok. |
| 3. Velg flere rutiner | I **Håndbok**, huk av to eller tre rutiner som ikke allerede er lagt til. Bytt mellom **Anbefalte** og **Alle forslag**. Trykk **Legg inn**. | Kortene viser **Valgt**, og alle valgene står under **Disse rutinene legges inn**. Valgene beholdes ved filterskifte. Etter innlegging viser hver rutine **Lagt til** og **Rediger her**. Ingen rutine publiseres ennå. Har du allerede lagt inn alle forslagene, bruker du en eksisterende rutine i neste steg. |
| 4. Endre og bytt fane | Trykk **Rediger her**. Endre litt tekst. Bytt nettleserfane og gå tilbake. Bytt også til en annen appfane og tilbake. Trykk deretter **Lagre utkast**. | Den samme rutinen og teksten står fortsatt åpen. Etter lagring finnes teksten når du åpner **Rediger her** igjen. |
| 5. Godkjenn og åpne neste | Som firmaadmin eller KS/HMS-ansvarlig: trykk **Åpne godkjenning** på en testklar rutine. Les teksten og skriv i **Hva er vurdert eller endret?**. Trykk **Godkjenn og publiser**. Åpne deretter godkjenning på neste rutine. | Siden flytter deg til riktig rutine. Tomt felt gir en tydelig beskjed og grå publiseringsknapp. Når vurderingen er skrevet, blir knappen aktiv. Etter godkjenning ser du riktig navn og publisert versjon i oversikten. Neste rutine åpnes synlig med tomt vurderingsfelt; forrige vurdering kopieres ikke. Ansatte får publiserte rutiner i **Les og bekreft**. Dette er Sandbox. |
| 6. Les, bekreft og følg opp | Med en bruker som har fått rutinen: åpne KS/HMS. **Les og bekreft** skal åpnes direkte, med antall rutiner som gjenstår. Les og bekreft denne utgaven. Ansatt skal ikke få redigerings-, godkjennings- eller tilgangsverktøy. Se deretter **Oppfølging og revisjon** som firmaadmin/ansvarlig. | Bekreftelsen viser tidspunkt og riktig utgave. Den forsvinner fra listen over manglende bekreftelser. Veiledningen forklarer hvordan håndboken skal kontrolleres. En faktisk revisjon signeres bare når kontrollen er gjort. |

På mobil: Se at tekst og knapper er leselige uten å dra siden sidelengs. Gjenta steg 4 dersom du bruker mobilen til rutinearbeid.

Du trenger ikke teste alt på nytt ved hver tekstendring. Hver leveranse skal få en avgrenset liste for det som er nytt og de eksisterende flytene som kan påvirkes. Denne listen dekker de aktuelle UX-rettelsene og den første innloggede håndbokflyten.

## Kort kontroll av siste rettelse: godkjenning

1. Trykk **Åpne godkjenning**. Siden skal vise riktig rutine automatisk; rutinen publiseres ikke ved dette klikket.
2. La vurderingsfeltet stå tomt. **Godkjenn og publiser** skal være grå, og teksten skal forklare hva som mangler. Skriv hva du faktisk har kontrollert; knappen skal bli aktiv.
3. Godkjenn én testklar rutine. Oversikten skal vise navn og publisert versjon. Åpne deretter en annen rutine; riktig tittel og et tomt vurderingsfelt skal vises.
4. Skriv litt vurderingstekst, gå til rutinekortet og åpne godkjenning på samme rutine igjen. Siden skal vise godkjenningen og beholde teksten. Bytt også nettleserfane og tilbake; teksten skal være bevart.

Som KS/HMS-ansvarlig: prøv også godkjenning av en testklar rutine. Du skal kunne godkjenne, men ikke få listen for å endre ansattes tilgang, velge ny revisjonsansvarlig eller arkivere rutiner.

## Ved en feil

Oppgi fane, knapp, hva du gjorde og hva som skjedde. For ny innlogging: si om du brukte den samme adressen i samme nettleser. En fungerende syntetisk komponenttest er ikke bevis på din faktiske innloggede økt. `TEST OK` gjelder først når den avtalte brukerprøven er gjort; Production-godkjenning er en egen beslutning.
