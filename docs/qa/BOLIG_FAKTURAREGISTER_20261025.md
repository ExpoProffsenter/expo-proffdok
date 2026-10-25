# Redigerbart fakturaregister – 25. oktober 2026

Miljømål BEGGE. Kun feature/Preview og Sandbox ppvircenkjizeiqdxphj.
Ingen produksjonsmerge/-migrasjon. Kenneth har avklart at dette skal være et enkelt
register for fakturaer og indeksberegning, uten ERP-løp med utkast, forhåndsvisning,
godkjenning og en ekstra registrering av fakturert.

## Gjeldende flyt

Kontrakter → Kontraktsøkonomi → Fakturert og a konto:

- Et åpent skjema viser fakturadato, betalingsplan/dokumentert utført, periodens
  beløp, aktuell indeks og egne beløp/nummerfelt for a konto og indeksregulering.
- Én Lagre-knapp nederst lagrer begge beløpene samtidig og oppdaterer begge
  hittil-summene. Fakturanumrene er valgfrie og kan fylles inn senere.
- Lagrede fakturaer har Rediger. Nummerføring, beløp, dato og merknad kan endres.
  Endring erstatter tidligere beløp; den lager ingen ekstra faktura i summene.
- Ny a konto starter en tom faktura. Tidligere fakturaer/egne beløp og kreditnotaer
  finnes som fakturatype. Fakturaer og kreditnotaer beholder sin opprinnelige type.
- Ingen faktura lages, sendes eller bokføres utenfor registeret. Mva, betaling og
  ERP-integrasjon inngår ikke. En lagret rad samler a konto og indeks med to
  valgfrie fakturanumre, ikke to separat godkjente regnskapsposter.
- Kontraktssum/vilkår er fortsatt én felles kilde. Nye fakturaer følger indeksvalgene
  der; ingen indeksvalg/ingen faktor gir indeks av som standard. En redigert eldre
  faktura beholder sitt lagrede avtalegrunnlag og sine indeksvilkår.
- Hele-kontrakten-beregning og gamle godkjente indeksrapporter er beholdt separat
  fra fakturaregisteret. De påvirker ikke fakturasummene og har sitt tidligere
  beregnings-/historikkløp. Selve fakturaskjemaet har ingen forhåndsvisningsknapp.

## Fakturadato og SSB

Offentlig SSB-data hentes for valgt serie med alle publiserte måneder. Ingen
kontraktsbeløp, fakturanummer eller identiteter sendes til SSB. JSON-stat2-feltet
updated og siste måned/verdi kontrolleres. Når siste tabelloppdatering var senest
på fakturadatoen, brukes siste tilgjengelige indeks før fakturamåneden. Det antas
ikke en fast publiseringsdag den 12. eller 15. Ulike serier kan ha ulike datoer.
Publisert måned, verdi og dato vises på norsk. Et offentlig seriecache varer fem
minutter; det inneholder ingen private data.

For en eldre fakturadato før siste tabelloppdatering beviser ikke dette API-et
hvilke måneder som var tilgjengelige den gangen. Appen viser derfor en tydelig
kontroll: velg og bekreft måneden som faktisk var publisert da. Den foreslåtte
måneden er ikke bekreftet automatisk. Lagre er sperret inntil bekreftelsen er gitt.
Publiseringsdato lagres som null og origin=manual ved denne kontrollen; ingen dato
fabrikkeres. Dette er heller ikke et arkiv over historiske revisjonsutgaver av
selve indekstallet. Tidligere faktura/egne beløp kan brukes for dokumenterte beløp
fra økonomisystemet. En fremtidig fakturadato kan bare bruke tall som allerede
finnes; løsningen forutsier ikke framtidige publiseringer eller indekstall.

Reell offentlig POST er kontrollert separat for alle tre valgene:
Boligblokk i alt: september 2026, 155,0, oppdatert 13.10.2026;
rør i boligblokk: september 2026, 178,1, oppdatert 13.10.2026;
rør i kontor/forretning: september 2026, 359,8, oppdatert 14.10.2026.
SSBs publiseringsarkiv/kalender er undersøkt, men er ikke brukt som et oppdiktet
fullstendig historisk publiseringsarkiv i appen.

## Ny datakontrakt og sikring

Additiv migrasjon 20261025001234_bolig_editable_invoice_register er installert bare
i Sandbox. Eksisterende fakturaer skrives ikke om ved installasjon. Ny save-handling
i samme offentlige RPC lagrer/oppretter eller oppdaterer én fakturarad i eksisterende
private register. Den gamle funksjonen og dens legacy-handlinger er beholdt.

- Samme root-lås tas før fersk privat tilgang kontrolleres. Reader, andre firma,
  tilbakekalt tilgang og arkivert prosjekt kan ikke lagre.
- Både samlet revisjon og fakturaens egen revisjon kreves ved endring. Et gammelt
  skjema kan ikke overskrive en nyere utgave etter en bakgrunnslesing.
- Ny request-ID identifiserer en lagring. Et tapt svar prøves med nøyaktig samme
  payload og returnerer samme kvittering, også etter senere endringer.
- En ny privat RLS-tabell bevarer før-/etterverdier og aktør for hver eksplisitt
  lagring. Rå tabelltilgang er sperret. Ingen revisjonsvalg eksponeres i brukerflyten.
- Begge fakturanumrene kontrolleres mot hverandre og andre fakturaer. Tomme nummer
  er tillatt. En scoped trigger håndhever dette også for eldre klienter.
- Penger beregnes med numeric på serveren og avrundes per linje. Visningen bruker
  tilsvarende heltallsavrunding, inkludert negative halve øre.
- Hovedstol begrenses mot avtalen. Kreditnotaer begrenses mot opprinnelig faktura;
  en allerede kreditert faktura kan ikke reduseres under krediterte beløp.
- Deterministiske valideringsfeil frigir skjemaet, mens et ubekreftet transportsvar
  beholder samme lagringsforsøk. Ulagret arbeid beholdes i RAM ved fokus/dvale og
  bevisst lukking. Lagre er den varige lagringen; det innføres ingen separat kladd.

Dette erstatter bevisst den tidligere produktregelen om at alle fakturaposter var
uredigerbare og at indeks alltid måtte registreres i en egen senere handling.
De gamle tester for legacy-RPC og historiske indeksrapporter beholdes. Nettleser-
scenarioene følger ny ett-trinns lagring og redigering; tilgang, originaler/OCR,
SSB-transport, fokussikring og dobbeltellingsvern er fortsatt kontrollert.

## Kontroll og grenser

SQL/JS-suite: 159 kontroller. Nettleser: 165 samlede kontraktskontroller med ekte
React, SQL og lokale HTTP-handlere; Auth/Storage/SSB/modelltransport er syntetiske.
Tester dekker tomt og senere nummer, ny og endret faktura, gammel faktura,
samtidig a konto/indeks, separate summer, feilretting, tapt svar, foreldet revisjon,
valideringsfeil, manuell historisk indeks, dato 28., privat tilgang og dvale.

Native Sandbox-smoke PASS for ny lagring og redigering, blanke/senere numre,
korrigerte summer, retry, legacy-historikk, kreditering og ACL. Alle testendringer
rulles tilbake; etterkontroll viser 0 QA-FINANCE-ROLLBACK-røtter. Advisors har samme
WARN/ERROR-kategorier og antall før/etter. Før ny migrasjon var den eksisterende
private funksjonen identisk med repoets baseline (MD5
b5c45fb284488f0586ff4cb954b52abf); den er fortsatt uendret.

Full critical Sandbox-build PASS. Core-boundary: 51 kontroller PASS mot main
36462e2b (425 paths); diff --check PASS. Nyeste CI og Preview kontrolleres på
sluttcommit.
Mobil-/desktop-skjermbilder er inspisert; fysisk Windows/Safari og Kenneths
innloggede prøve gjenstår. Ingen samlet TEST OK. PR #278 skal forbli OPEN DRAFT.

## Kenneths prøve

1. Åpne Kontrakter → Kontraktsøkonomi → Fakturert og a konto. Legg inn dato og
   månedens beløp. Se indeksmåned og indeksbeløp direkte i skjemaet.
2. La fakturanumrene stå tomme og trykk Lagre. Begge hittil-summene skal øke.
3. Åpne Rediger på fakturaen. Fyll inn a konto- og indeksnummer, og lagre igjen.
   Summene skal være uendret.
4. Endre beløpet og lagre. Summene skal korrigeres, ikke øke med en kopi av det
   tidligere beløpet. Kontroller at samme data finnes etter omlasting.
5. Ved eldre fakturadato: kontroller og bekreft riktig indeksmåned når appen ber om
   det. Prøv Utklippsverktøy og et faktisk fanebytte med usendt arbeid.
