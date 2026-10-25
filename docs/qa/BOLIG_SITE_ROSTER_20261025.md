# Oversiktsliste ved tilsyn – arbeidskontrakt og QA

Miljømål **BEGGE**. Først samme feature-branch og faste Preview som PR286:
`fase45b-bolig-portal-polish-20261025`. Ny PR for denne leveransen.
Baseline: faktisk publisert main `fb486c586eef2b643c49f5a74c91b598c914fe8c`.
PR286 er allerede fullført i Production og demo; dens eldre ventende filnotater
er historikk. Ingen produksjonsinstallasjon eller merge av oversiktslisten før
ny TEST OK og en egen, kontrollert migrasjonsplan.

## Produktkontrakt

- Inngang i valgt prosjekt → Oppsett → Faktisk bemanning → Oversiktsliste ved tilsyn.
- Prosjektleder fører byggeplass/byggherre, virksomheter og alle som skal arbeide
  på plassen. Eksisterende navngitte deltakere og manuelle innregistreringer kan
  hentes inn eksplisitt. Ingen gjetting av personidentitet ut fra navn.
- Virksomhetsopplysninger registreres én gang og gjenbrukes på personer.
  Innleide får både arbeidsgiver og innleievirksomhet. Enmannsbedrifter kan også
  registreres, og personer trenger ingen appbruker eller personlig UE-lenke.
- Navn, fødselsdato, HMS-kort eller dokumentasjonsreferanse til pågående søknad,
  virksomhetsidentitet, arbeidsperiode og nødvendige byggeplassopplysninger.
  Ufullstendig grunnlag kan lagres, med konkrete mangler og utkastmerking.
  Utfylte felt er ikke automatisk kontroll av registre eller kortets gyldighet.
- Daglig kontroll er en navngitt, tidsfestet handling for dagens norske dato.
  Den kan ikke tilbakedateres. Endringer etter kontroll krever ny gjennomgang.
  Hver lagring arkiverer en serverbygd versjon; tidligere versjoner omskrives ikke.
- Historiske lister bygger på faktisk lagrede versjoner, med tydelig tidspunkt.
  Manglende historikk fremstilles aldri som en kontrollert historisk liste.
- PDF og CSV leser bekreftet servergrunnlag. Eksport viser dato, versjon,
  kontrollstatus, byggeplass, byggherre og alle nødvendige person-/virksomhetsfelt.
  Utkast merkes. Ingen usendt skjemakladd går i eksport.
- Arbeidets faktiske sluttdato gir synlig minste oppbevaringstid på seks måneder.
  Ingen automatisk sletting eller generell endring av prosjektets arkivering.

## Kilder og ansvar

[Arbeidstilsynets veiledning](https://www.arbeidstilsynet.no/hms/hms-i-bygg-og-anlegg/byggherreforskriften/elektroniske-oversiktslister/)
og [byggherreforskriften §15](https://www.arbeidstilsynet.no/regelverk/forskrifter/byggherreforskriften/)
er kontrollert 25.10.2026. Byggherren har ansvaret; føringen kan delegeres ved
skriftlig avtale. Oversiktslisten er noe annet enn inn-/utlogging. Den skal
oppdateres og kontrolleres daglig, være elektronisk tilgjengelig ved tilsyn og
beholdes seks måneder etter avsluttet bygge-/anleggsarbeid. Arkiver etter endring.
Referanse til søknad er støtte for fremleggelse av dokumentasjon, ingen godkjenning
fra HMS-kortregisteret. Virksomheten må faktisk føre og kontrollere riktige data.

## Avgrenset kode og sikkerhet

Innenfor: nye Bolig-rosterkomponenter, klient, presentasjon/eksport, én additiv
migrasjon med nye private tabeller/funksjoner, inngang i BoligAttendance,
tilhørende DB-/nettleser-/PDF-tester, CI-tillegg, Hjelp og dokumentasjon.

Eksisterende inn-/utlogging, Min side, UE-/beboer-/leverandørportaler, Sales,
roller, priser, kundeaksept, HR, global navigasjon, gamle migrasjoner og delte
funksjoner skal være uendret. Ingen nytt lisensvalg eller reell utsending.

Persondata lagres bare i nye private tabeller/versjoner, med RLS og tilbakekalte
direkte tabellrettigheter. Ny RPC krever fersk manager-tilgang i aktivt firma og
at prosjektet tilhører firmaet. Ingen anon-/UE-/beboertilgang. Eksporter er
eksplisitte prosjektlederhandlinger; ingen e-post, offentlig lenke eller FDV-kopi.
Fødselsdato og kortdata skal ikke i localStorage/sessionStorage eller logger.
Ulagrede personfelter beholdes i minnet ved fanebytte, mens fersk tilgang kontrolleres.

Konflikter bruker PT409. Serverlåsing, revisjon og nøyaktig replay hindrer tapte
oppdateringer/duplikater. Lagring skal ha bekreftet request-ID før kvittering.
Ingen eksisterende oppgave-/varslingsmotor utvides; daglig kontrollstatus finnes
i denne arbeidsflaten uten automatisk e-post eller oppdiktede frister.

## Kontrollgrunnlag

Faktiske testresultater, installasjons-SHA, migrasjonshash, Preview og PR fylles
inn før gjennomgang. Ingen utført-testpåstand før prøven faktisk består.

## Verifisert før Preview

- Full PostgreSQL/PGlite-suite: 1727 assertions PASS på endelig lokal kilde.
  Nye scenarier beskytter revisjon/replay, fullstendighet, innleie/HMS-søknad,
  uforanderlige versjoner, deltakerimport og tilgang/privat tabell-ACL.
- Ny nettleserflyt: 23 assertions PASS, med mobilbredder 320/390/768 og desktop
  1366, fanebytte/dvale med kladd, usikkert lagringssvar/replay, konflikt og
  tilbakekalt tilgang. Endelig antall og CI føres i PR.
- Eksport: 24 assertions PASS. Faktisk 12-siders PDF med 45 fiktive personer,
  norske/polske/kyrilliske navn, innleie, søknadsreferanser og sideskift. Første og
  siste side rendret og sett over; CSV beskytter formelceller. Font med lisens
  følger appen. PDF stopper med CSV-alternativ hvis et tegn ikke finnes i fonten.
- Eksisterende attendance-browser 19 PASS; self-attendance-browser 19 PASS.
- `npm run build` PASS, med alle eksisterende build/critical-checker.

Sandbox-migrasjon `bolig_site_roster` installert som `20261025203932`.
Lokal kilde: `20261025202418_bolig_site_roster.sql`, SHA256
`f0bb515a0a5854a379c35a7c596eeda631e87d3935ad854cb57fd3eaad109db0`.
Ingen endring i Production. Mapper lokal/installerte ID-er eksplisitt; ikke replay
hele den eldre Bolig-installasjonen.

Faktisk Sandbox-prøve under `authenticated`: prosjekt, byggeplass, virksomhet,
person, daglig kontroll og historisk versjon PASS. Kun syntetiske rader, hele
transaksjonen rullet tilbake. Ingen e-post. Gjenta med
`scripts/bolig-site-roster-sandbox-smoke.sql` mot Sandbox.

Før/etter-fingerprints for de fire etablerte attendance-RPC/funksjonene er like.
Alle fire nye tabeller har RLS og ingen direkte anon/authenticated-SELECT.
Ny offentlig wrapper er security invoker, kun authenticated EXECUTE; privat
security definer har eksplisitt manager/firma/lisens/prosjekt-gate og tom search_path.
Security-advisor har ingen nye WARN/ERROR. Fire INFO om RLS uten policy er
forventet: alle direkte tabellgrants er tilbakekalt, tilgang skjer bare via RPC.
Gamle urelaterte funn er uendret. Se
`docs/qa/evidence/bolig-site-roster-sandbox-20261025.json`.

## Brukerprøve på fast Preview

1. Boligprosjekter → valgt prosjekt → Oppsett → Faktisk bemanning → Oversiktsliste ved tilsyn.
2. Rediger byggeplass. Lagre. Åpne Virksomheter, legg til virksomhet og lagre.
3. Åpne Personer. Legg til person eller hent fra deltakere. Fyll ut resten og lagre.
4. Se mangler under Oversikt. Bekreft daglig kontroll, og last ned PDF/CSV.
5. Åpne Historikk og se en eldre versjon. Den skal være låst for redigering.
6. Skriv i en personkladd, bytt nettleserfane og kom tilbake. Kladden skal være beholdt.

Innlogget brukerprøve med eget firma og reell mobil Safari/iOS/Android gjenstår.
Automatisert Chromium gir ikke dekning av alle nettlesere eller faktisk registerkontroll.
Ny TEST OK gjelder denne leveransen, ikke den allerede publiserte PR286.

## Sluttkontroll av skjema og historisk CI-repetisjon

En ny nettlesertest viste at byggeplass-editoren kunne havne under hele
oversikten. Editor erstatter nå oversiktsinnhold under redigering og rulles
inn i synsfeltet. Regresjonen feilet før rettelsen og består etterpå.

CI719 stoppet på den historiske PR278-installasjonsøvelsen: den sammenlignet
den låste pakken på 72 migrasjoner med dagens kilde som også har ny roster-migrasjon.
Workflow kjører nå de uendrede øvelsene i en midlertidig detached worktree på
den allerede registrerte PR278-kandidaten f39d374c. Alle gamle assertions og
releasehashene er beholdt. Dagens fulle foundation-suite tester fortsatt alle
migrasjoner inkludert roster. Ingen produksjonsinstallasjon gjentas.

Historisk PR278-prøve i den registrerte worktreen: manifest 312 PASS,
installasjon/rollback 108 PASS. Ingen eksisterende testfiler endret.

Passiv minuttoppdatering utsettes mens en kladd/lagring er aktiv, slik at
markør og tastaturfokus ikke forsvinner midt i skriving. Focus/visibility og
tilgangshendelser kontrollerer fortsatt umiddelbart. Egen runtime-regresjon inngår.
