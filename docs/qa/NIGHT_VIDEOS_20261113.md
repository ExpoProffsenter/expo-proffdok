# Videokontroll 13.11.2026

Automatisk kontroll av alle 15 aktive katalogposter: full ffmpeg-dekoding, ffprobe-varighet, SHA256, byteantall, VTT-eksistens og stigende kapitler. Alle består. Kontrollpunkt2: alle15filmer også åpnet fra innlogget Hjelp, spilt av og hoppet til siste kapittel. Ingen påstand om full visuell innholdsrevisjon.

| Film | Sekunder | Kapitler | Filkontroll | UI/visuell revisjon |
|---|---:|---:|---|---|
| Finn bolig og bruk veiledningen | 75 | 9 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Finn egne planer, les oppgaven og gå tilbake | 95 | 10 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Les Kundens tilbud og gå tilbake | 75 | 8 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Opprett og fullfør en prøvesamtale | 171 | 18 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Finn hjelp, åpne tema og gå tilbake | 95 | 12 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Planlegg flere boliger | 204 | 10 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Last ned statusrapport fra prosjekt | 99 | 7 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Medarbeidersamtale – samtale, tiltak og referat | 106 | 9 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Samlet PDF fra KS/HMS | 122 | 10 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Egne timer – felt og avbrutt utkast | 102 | 9 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Fremdriftsplan – visning, bemanning og PDF | 120 | 11 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Fremdriftsplan – opprett og rediger | 124 | 10 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Varetelling – område, pause og kontroll | 150 | 11 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Bemanningsplan – les tall og eksporter | 102 | 8 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |
| Boligprosjekter A–Å | 580 | 57 | PASS | Avspilling/kapittelhopp PASS; full innholdsrevisjon gjenstår |

Historisk kontrollpunkt1: A–Å v12 er580sekunder/57kapitler. Ny revisjonsplan lest: bare3av57scener hadde eksplisitt pekermål i opprinnelig kildeaudit. Ingen ny film er produsert i denne kjøringen. Nytt faktisk skjermbilde av bolig38-avtaleutkast finnes som QA-bevis; skal ikke alene presenteres som ferdig film. Neste kjøring henter redigerbare kilder, gjennomfører ferske opptak av det syntetiske beboerløpet og lager sammenhengende revidert film med lik peker. Gamle kapitler/gjennomføring må ikke fremstilles som nytt opptak.

## Kontrollpunkt 2 – ferdig delproduksjon

[Bestillingsfrist og avtalesvar – videoutkast](video-drafts/frist-20261113/bestillingsfrist-og-avtalesvar-utkast.mp4),36sekunder/3scener. Ferske sandboxbilder13.11, norsk tekst, samme peker,1920×1080,24fps,H.264,ingen lyd. Full dekoding og tre ferdigkodede sceneprøver visuelt kontrollert. Ingen apppublisering eller påstand om ferdig A–Å. Original V12-kildepakken kunne ikke materialiseres (HTTP401); originalmalens renderer er ikke brukt/attestert identisk. Kildene og renderer følger utkastet.

Alle15aktive Hjelp-innganger ble kontrollert med Systemadministrator. Native avspilling, sistekapittel, readyState4, paused=false og ingen mediafeil: `evidence/night-help-playback-20261113.json`. Avspilling var kort, ikke hele filmen sett. Kontaktark viser spiller-/kapitteltilstand; A–Ås57kapitler krever scrolling og siste scene var utenfor utsnittet i UI-kontaktarket. Ingen påstand om at alle frames er visuelt kontrollert.

## Kontrollpunkt5 – ny konkret delproduksjon
KS/HMS kladd og gjennomgang: `video-drafts/kshms-kladd-20261113/`,36sekunder/3scener/H264/1080p24/uten lyd. Kilder fra faktisk kontrollpunkt4, tydelig merket. Samme pekerform, genererte scenenumre. Full dekoding og tre renderte scener visuelt PASS. Ikke publisert i Hjelp og ikke ferdig full veiledning. Sammen med tidligere fristutkast er72sekunder nytt delmateriale produsert. Full A–Å og sceneaudit av alle15eksisterende filmer gjenstår.
