# Planoppsett og områdetelling – innlogget kontroll 5. november

Miljømål BEGGE; utført bare i eksisterende PR311 Preview/Sandbox. Ingen ny appkode, backend, migrering, tilgang, e-post, main/demo-merge eller TEST OK i denne etappen. Planfilmens Hjelp-integrasjon er separat i PR308.

## Bekreftet grunnlag

- PR311: `fase45b-whole-app-qa-20261104`, kode `4c5c06329c9c96fc1479c98e9da8b76a7be22753`. READY `dpl_EGMXz8WQWRUMJrkDWbZcj53nDKu6`, target=null, fastalias. Publisert main-CcjDSQKZ.js har Sandbox-binding ppvircenkjizeiqdxphj, uten Production dqffxflaoyarbxyiyhop.
- Fast testadresse: https://expo-proffdok-git-fase45b-whole-app-qa-20261104-ringside.vercel.app/?progressTest=safe . Eksisterende demokonto / Expo Proffsenter, desktop Chromium. Kun egne tydelig syntetiske prøver ble opprettet og endret.
- PR308s planvisningsfilm er kontrollert innlogget på 63a9bc8d. Dokumentasjonshead 6c23091f har full CI978/run42079111640 SUCCESS, uendret app/media. Se PR308s docs/qa/PLAN_VIEW_HELP_VIDEO_20261105.md for nøyaktig avspilling/retur/hash/READY. Elleve eksisterende filmer beholdes.
- Production er ferskt kontrollert 34daef4c/dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY. Demo er abc38f7e. Gamle installasjons-/produksjonsskript er ikke kjørt.

## Ny positiv planreise

KS/HMS → Verktøy og maler → Fremdriftsplaner → Ny fremdriftsplan. Opprettet kun **DEMO – planoppsett og redigering 05.11**, referanse **QA-PLAN-0511**, adresse **Syntetisk eksempel – ingen faktisk byggeplass**.

Valgte 312 Rørnett sanitær, navn «Grovmontering sanitær – eksempel», fag «Rørlegger», fritekstlaget «Eksempellag VVS», to personer og 5.–6.11.2026 kl. 08–16. Første lagring fikk faktisk serverbekreftelse og «Lagret». Gjenåpnet oppgaven og endret status til Pågår og merknad til «Oppdatert eksempel: Grovmontering pågår. Kontroller før lukking av vegg». Tilbake til oversikten ga ulagret plan; lukking av hovedvinduet beholdt kladden og viste korrekt varsel/fokus til Åpne fremdriftsplan. Gjenåpning beholdt endringen; eksplisitt Lagre fremdriftsplan ga ny lagringsbekreftelse.

Deretter Planvalg og eksport → Hent lagret plan: fersk serverutgave viste fortsatt Pågår, to personer, de to datoene og hele merknaden. Senere bevisst navigasjon til Prissøk og tilbake til KS/HMS beholdt valgt plan, og ny åpning leste samme innhold. Avsluttet med begge dialoger lukket, fokus Åpne fremdriftsplan og ingen ulagret endring. Ingen andre planer, prosjektkobling, tilbud, personvarsling eller e-post endret.

En første verktøy-fill av datofeltet endret ikke React-tilstanden. Datoen ble deretter satt med native feltkontroll og verifisert i periodeoppsummeringen samt fersk serverlesing. Ingen datoattest bygger på den første fillen. Dette er en presis verktøybegrensning, ikke en bevist appfeil.

Åpent UX-funn: periodens Merknad er et énlinjefelt. Den lange merknaden lagres/leses komplett, men er ikke synlig i sin helhet samtidig. Vurder flerlinjefelt i egen avgrenset UI-/regresjonspakke; ingen slik endring er gjort her.

## Ny positiv områdereise og faktiske eksportbytes

Prissøk → Varetelling. Opprettet kun **DEMO – områdeflyt og pause 05.11**, lager **QA-IKKE-IMPORTER**. Opprettet **Reol B – hylle 2** én gang; området fulgte automatisk som skrivebeskyttet felt på hver ny vare.

Manuelle syntetiske varer hos QA grossist: QA0001 / Demovare – rørdel = 3 og QA0002 / Demovare – tom hylleplass = 0. Begge fikk serverbekreftelse. Stoppmerknad «Venstre halvdel telt. Fortsett ved røde rørdeler.» ble lagret ved Sett område på pause. Pauset status fjernet skriveknappene for området. Fortsett telling her med samme demoteller beholdt merknad og begge varelinjer. Ny registrering QA0001 = 2 ga korrekt sum 5, fortsatt bare to varelinjer. Historikk viste 0 → 3, 0 → 0, pause, videreføring og 3 → 5 med faktisk aktør/tidspunkt/merknad.

Oppdatert sluttmerknad til «Hele eksempelhylla kontrollert. Kun demovarer – ikke importer.», deretter Området er ferdig telt. 1 av 1 områder ferdig, riktig forklaring og eksplisitt Gjenåpne område. Ingen automatisk videre telling på ferdig område.

- Faktisk Cordel-fil: **44 bytes**, SHA256 `aeb9a24937a51489f0bfee6f843b71fb81e5e7c0d6bbd1dc4ac8c0e0439f2000`. Rader QA0002;0;QA grossist og QA0001;5;QA grossist, CRLF, ingen overskrift/område/pris/historikk. Eksakt byte-/kolonne-/verdiassertion PASS.
- Faktisk kontroll-CSV: **376 bytes**, SHA256 `bb020912a62e4d18e2eeae9463bb1d9ba65695257b262cdd98aea37bac40aa72`. UTF-8/BOM; begge rader har Reol B – hylle 2, riktig lager og 5/0. Faktisk CSV-parsing/verdiassertion PASS. Innledende inspeksjon brukte CP1252 også på kontroll-CSV; korrekt UTF-8-sig-dekoding ble deretter kontrollert uten fil- eller appendring.
- Avslutt telling → Bekreft avslutning, så Hent telling på nytt: fortsatt Avsluttet, 2 linjer, 1 av 1 område ferdig, beholdt sluttmerknad og 5/0. Ingen knapper for Endre antall/Fjern/Registrer antall/Gjenåpne område. Begge eksportknappene var fortsatt tilgjengelige. Ingen Cordel-import, e-post eller annen utsending.

Dette er ny innlogget énaktørprøve. Tidligere native toaktør-/fencing-/tiidentitetsbevis og faktisk serversamtidighet i STOCKTAKE_AREAS_20261105.md beholdes; denne filmen er ikke en ny fysisk 10-personersprøve eller opptak av overtakelse mellom to personer. De tre tidligere avsluttede tellingene ble ikke endret.

## Filmer og neste steg

To nye avgrensede kapitler er produsert og kontrollert i uendret PROFFDOK-VIDEO-1.0 fra egne faktiske skjermbilder. Begge har H264/1920×1080/24fps og ingen lyd. Full dekoding og metadata PASS; alle 21 kodede representantscener og synlige klikkmål er kontrollert. Ingen skjermtekst er rekonstruert. Kildene har uendret renderer/skrifter, originalbilder, tidslinje, kapitler/VTT, kildehash, kontrollbilder og validation.json. Syntetiske eksportfiler følger områdetellingens kilder merket IKKE-IMPORTER. Fire filer er bekreftet lagret med lokal identitet.

| Film | Faktisk fil | Kilder |
| --- | --- | --- |
| [Fremdriftsplan – opprett og rediger](https://chatgpt.com/library?file_id=libfile_d9bcc873dbcc81918673a4cdecb9fc36&account_id=personal) | 124s / 10 kapitler / 2976 frames / 4796548 bytes; SHA256 c9f70307ca3de45c050fa25de43839a7db8eced667f51f70376028ce7a0c418c | [Redigerbar ZIP](https://chatgpt.com/library?file_id=libfile_caddf5e698e0819184afa7f71a3f4b1c&account_id=personal), 4081056 bytes, SHA256 48013981b1c1abd9ceb76337be984099355f5d1c253ab3b2b125ae7d9c8680f1 |
| [Varetelling – område, pause og kontroll](https://chatgpt.com/library?file_id=libfile_36409e3571fc81918ddd774dee2df387&account_id=personal) | 150s / 11 kapitler / 3600 frames / 7337752 bytes; SHA256 4967be56f080cfa9cb8475dd6028fbce6a87768e06c313c195e9554a0bd018ef | [Redigerbar ZIP](https://chatgpt.com/library?file_id=libfile_8eba65db850c8191a1a431c5caab54bf&account_id=personal), 5311584 bytes, SHA256 c41b870487bf97fa3f85e25dcdab02898b01062d04c5b614982d53f53dabd9b5 |

ZIP CRC-kontroll PASS for begge. Rendererhash bf9308a219fd6fbb03bcf4c5ef521abaa346a46e5f4f24bd04678b24b2e348b1 er identisk den godkjente kildepakken. Første scene viser feltene før innfylling; ingen animert klikk på deaktivert opprett-knapp. Bilder tatt før compositor var oppdatert ble erstattet ved siste plantekst-/serverkontroll. Klikk uten synlig mål er utelatt fremfor å peke utenfor arbeidsflaten.

Filmene er separate leveranser, ikke nye guideposter i Hjelp. Integrasjon hører til PR308 med bevart grunnlag med elleve filmer, eksisterende relevante tilganger og egen eksakt kandidatkontroll. Den gamle 198s-varetellingsfilmen forblir arkivert.

Full KSHMS-006 (arkivering, flere perioder, drag/resize, bemannings-PDF/CSV/ICS), hele appens rolle-/portal-/økonomi-/Bolig A–Å-reiser og fysisk mobil/Safari er fortsatt åpne. Grønn tidligere CI brukes bare for uendret kode; denne etappen gir ny manuell deldekning. Ingen produksjonsgodkjenning utledes.

Tilbakeføring: ingen app-/databaseskjemaendring i denne etappen. Behold de egne syntetiske testpostene og sporbar historikk; ikke slett/nullstill dem for å rydde. Dokumentasjonen kan rettes separat. Før eventuell autorisert release må PR311s eksisterende app-/databaseavhengigheter og main→demo-plan kontrolleres som beskrevet i PR-en.
