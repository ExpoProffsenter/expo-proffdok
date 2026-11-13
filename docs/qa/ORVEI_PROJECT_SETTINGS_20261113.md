# Aamodthagen: frister og fremdriftsvisning

## Gjeldende status 13.11.2026
PR332, arbeidsbranch `fix/orvei-deadline-layout-20261113`, fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Miljømål BEGGE. Appkandidat `a3d853564df478429d3e1831ba0479e34bcecba5`: PR Core Safety [43502942740](https://github.com/ExpoProffsenter/expo-proffdok/actions/runs/43502942740) SUCCESS. Ingen produksjonssetting, produksjonsimport eller utsending. Permanent demo er ikke synkronisert med disse kodeendringene.

Fast Preview: https://expo-proffdok-git-fix-orvei-deadline-layout-20261113-ringside.vercel.app/?progressTest=safe
Backend er sandbox `ppvircenkjizeiqdxphj`.

## Levert
- Hele planen er standard i Gantt. Alle daterte aktiviteter vises, også utenfor tidligere ukevalg. Manuelt valgt dag/uke/måned støttes; flytting krever en slik detaljvisning.
- Full aktivitetstekst, bolig, adresse, dato og ansvarlig ved hover/tastaturfokus. Escape lukker forklaringen, klikk åpner detaljer.
- Åpning og lukking uten endring gir ikke falskt utkastvarsel. Endrede/ukjente/offline-utkast beholdes.
- Byggnavn brytes ikke midt i gateadressen. Aktivitetsdialogen viser bolig/adresse og dato.
- Felles prosjektklokkeslett i «Beboerlenker og frister samlet». Standard 12:00 for nye/udaterte prosjekter. Eksisterende daterte prosjekter bevarer dagsslutt til uttrykkelig endring.
- Hjelp oppdatert. Videoopptak er ikke regenerert.

## Sandboxdata og migrasjon
Komplett prosjekt `df971415-1232-4199-8bd8-ce1e2246deaa` heter Aamodthagen boligsameie. Referansen ORVEI-SANDBOX · Etasjer foreløpige beholdes. 29 bygg, 126 boliger og 1260 daterte aktiviteter. Planperiode 2.12.2026–5.11.2027. Bekreftet befaring seksjon 113–116: tirsdag 8. juni 2027. Opprinnelig import og fiktive pakker er beskrevet i PR331.

Repo-migrasjon `20261113191737_bolig_project_deadline_time.sql` er installert bare i sandbox, registrert som `20261113203013_bolig_project_deadline_time`. Ikke kjør samme SQL på nytt under repo-tidsstempelet. Før installasjon ble kolonne, historikk og funksjonsankere kontrollert.

Alle 126 boliger manglet tidligere choice_deadline selv om planen hadde aktiviteten «Bestillingsfrist kl. 12.00». Den 13.11 ble de 29 datogruppene overført via eksisterende bolig_resident_batch/deadlines, med ferskt grunnlag per gruppe og atomisk kontroll. Alle 126 er lest tilbake mot plan: 29 datoer fra 18.12.2026 til 17.9.2027, prosjektklokke 12:00. Ingen aktivitetsdatoer, portallenker eller mottakere er endret. Ingen e-post sendt.

## Verifisering
- Full GitHub PR Core Safety SUCCESS for a3d853: build, bolig-db, bolig-browser, app-browser, HR, firma og prosjektkontroller.
- Lokal PostgreSQL: 1857 assertions PASS; React batch 18 scenarioer PASS; Gantt, tooltip og dirty-draft-regresjoner PASS.
- Faktisk innlogget native Chromium-preview: Aamodthagen åpnet med hele perioden og 1260 aktiviteter; stolper synlige. Tooltip for bolig 67 / Granåsvegen 2 viste full tekst/dato/ansvarlig. Aktivitetsdetaljer åpnet/lukket og neste aktivitet åpnet uten falsk utkastadvarsel. Ingen aktivitet lagret under kontrollen.
- Hosted sandbox: prosjektklokke lagret/testet via RPC i transaksjon som ble rullet tilbake. Norsk vintertid gir 11:00 UTC og sommertid 10:00 UTC ved frist 12:00.
- Sikkerhetsadvisors etter klokkemigrasjon: 475 eksisterende funn, ingen nye eller fjernede (sammenlignet navn/nivå/metadata).
- Lokal Chromium-oppstart er blokkert av kjøremiljøets socket-begrensning; CI og native nettleser ga nettleserbevis.

## Avgrensning og neste steg
Navngitt samarbeid er separat PR333, se `docs/qa/BOLIG_PARTNER_COMMERCE_20261113.md` på den branchen. Ingen firmamedlemskap eller personrettigheter ble endret av PR332. Produksjon viser fortsatt tidligere kode.

Før produksjon: Kenneth TEST OK for PR332. Kontroller fersk main, migrasjonshistorikk og kandidat; installer kun manglende produksjonsmigrasjon, merge/publiser riktig commit, verifiser frister og eksisterende portal. Deretter kontrollert main → demo med overlay bevart. Aamodthagen-produksjonsimport og fiktive pakker er ikke automatisk del av denne publiseringen.

Tilbakeføring: behold forrige Vercel-produksjonsdeploy og commit. Klokkekolonnen er additiv; ikke slett tabeller/data eller kjør blind down-migrasjon. Sandboxfristene kan bare reverseres etter ny kontroll mot logg og eventuelle senere endringer.
