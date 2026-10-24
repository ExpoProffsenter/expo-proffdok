# Bolig – direkte oppfølging av aktivitet fra åpne forhold

Miljømål BEGGE. Kenneth: «flott, hva er neste kjør». Fortsett neste kartlagte forenkling uten ny godkjenningsflate. Start HEAD 4c1782ee81ea509055d2f4c7982aa25cca9e1db2, tree d6b249fed22edee4cb85f7e56112fabb1818a036, PR278 OPEN DRAFT. **CI647 / 39987303000 SUCCESS** kontrollert på start-SHA. Preview READY, fast adresse beholdes. Ingen Bolig TEST OK eller autorisasjon til produksjonsmerge.

## Scope og kontrakt før kode

BoligCaseFollowup.jsx får Åpne aktivitet for sin faktiske aktive koblede aktivitet. BoligProgress.jsx gjenbrukes i avgrenset aktivitetsvisning med samme editor/lagring/arkivering, varsler, kilde-/revisjonsvern og persisted retry. Hjelp, README, arkitektur/handoff og eksisterende followup/progress-browser-check er innenfor scope. Ingen SQL, kø, e-postmotor, meny, andre moduler eller automatisk endring av saken/vurderingsansvarlig.

Eksisterende usendt aktivitetskladd skal aldri erstattes stille. Samme ID gjenopptar samme utkast; annen ID krever at brukeren eksplisitt velger om eksisterende utkast skal fortsettes eller forkastes før den valgte aktiviteten åpnes. Nye vinduer bevarer kladd/fokus og lukker tilbake til samme sak. Utdatert/arkivert/tilbakekalt aktivitet kan ikke redigeres via snarveien.

Tester før kode lest: bolig-followup-browser-check, bolig-progress-browser-check, handover_followup-migrasjonens kontrakt og eksisterende progress-adapter. Ingen eksisterende scenario-/sikkerhetsassert skal svekkes. Full CI på start-SHA er grønn.

Aktivitetsdialogens eksisterende JSX er flyttet til den rent presentasjonelle BoligProgressTaskEditor.jsx for å gjenbruke nøyaktig samme felt/lagringshandler. Ingen ny server-skrivevei. Ved lesing av eksisterende lagring ble en konkret revisjonsfeil funnet: task.revision ble kopiert i payload selv om RPC krever progress_states.revision. Alle åpninger bruker nå planrevisjonen; fokus-/dvaleforfriskning skal ikke omdefinere kladdens gjennomgåtte basis automatisk. Gjeldende serverstatus vises før eksplisitt gjenbruk av utkast på nytt grunnlag.

## Resultat og QA

- Oppfølging i fremdriftsplanen viser Åpne aktivitet på faktisk aktiv koblet aktivitet. Editor gjenbruker planens nåværende varefrie aktivitetsfelter, status, ansvar, frist, faktisk utførelse og arkivering; lagring/lukking returnerer samme sak. Samme aktivitet oppdateres, ingen ny aktivitet ved redigering.
- Valg av eksisterende aktivitet viser hvem som får fristvarsler. Kildesaken, koblingen og overtakelsesvurderingens ansvar endres ikke automatisk. Eksisterende utsendingsstatus og transportpause beholdes.
- Annen usendt aktivitetskladd krever eksplisitt fortsett/forkast-valg. Samme aktivitetskladd bevares over lukking, fokus og dvale. Lagring binder planrevisjonen fra gjennomgangen, ikke aktivitetens egen revisjon. Endret plan viser siste datoer/ansvar/status/notat/rom/utførelse/avhengighet før eksplisitt nytt grunnlag.
- Mistet svar etter lagring og arkivering bruker samme vedvarende forsøk. En allerede gjennomført arkivering kan fortsatt få kvitteringen gjenopptatt, mens nye redigeringer av arkivert/utdatert snarveimål sperres. Endret firma/rolle/tilgang skjuler gammel redigering.

**PASS:** followup/papir/direkte aktivitet **43 Chromium asserts** (alle 16 tidligere beholdt), vanlig fremdrift **35** (tidligere 34 beholdt, streng planrevisjon), plan/Gantt **30**, koordinering/dialog **48**, overtakelse/guide **34**. Ekte komponenter, syntetisk/mocktransport, 320/390/1366 px og visuell kontroll av direkte editor på desktop/mobil. Ingen påstand om full innlogget browser→Sandbox-prøve.

**PASS:** PostgreSQL **1154**, faktisk foundation React, full critical build, diff, scope og release-docs. Ingen ny SQL eller Supabase-endring nødvendig. E-post er ikke sendt; kø-/transportinnstillinger er urørt. Start-SHA sin samlede CI647 SUCCESS; ny commit/CI/READY kontrolleres etter push og føres i PR278.

## Kenneths brukerprøve

Samme faste Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Pilotprosjekt → bolig → Ferdigstilling → Se åpne forhold → Oppfølging i fremdriftsplanen. Koble en eksisterende aktivitet eller lag oppfølging én gang.
2. Åpne aktivitet → endre Ansvarlig og Planlagt slutt → Lagre endringer. Tilbake i samme sak skal oppdatert ansvar/frister vises. Saken beholdes åpen.
3. Gjør en usendt endring og velg Lukk og behold utkast. Åpne aktivitet igjen: samme utkast. Ingen ekstra godkjenningsrunde ved vanlig uendret grunnlag.
4. Fysisk Safari og Kenneths innloggede pilotprøve gjenstår. Egen Bolig TEST OK før Production/main→demo.

Neste prioritet etter denne forenklingen er samlet innlogget pilotgjennomgang av bygg → rom/pakker → valg → avtale → bestilling/mottak → fremdrift/varsler → åpne forhold/overtakelse/sluttpakke. De større senere ønskene er fortsatt separate: leverandør/UE-tilgang, egne fasader/plantegninger, booking, privat kontrakt/indeksanalyse og Excel-import sist.
