# Boligprosjekter – endringsordre og beboeraksept

Miljømål **BEGGE**, først samme feature-Preview/Sandbox og draft PR #278.
Brukerens «kjør» 22. oktober følger anbefalingen om gjennomgang av ferdigstilling,
deretter endringsordre og beboeraksept. Ingen Production-merge er godkjent.

## Scope og eksisterende gjennomgang

Egne Bolig-komponenter, ny separat HTML-entry/kundeside i Vite, additiv
Bolig-migrasjon, egne tester og hjelp/arkitektur. Eksisterende Sales, bootstrap,
main, tilgangs-/innloggingskjerne, e-post, ordinære prosjekter og øvrige moduler
endres ikke. Den separate lokale CI-miljørettelsen er ikke tatt inn her.

Gjeldende Preview er gjennomgått innlogget: DEMO – Enkel flyt og sluttpakke →
Demobygget → H0101 → Ferdigstilling. Viser Klar med restpunkter, 5/5,
én mindre merknad, én valgfri påminnelse, ansvarlig, godkjenningsnavn/tidspunkt
og seks historikkoppføringer. Ingen kontroll eller overtagelse er registrert
under denne read-only prøven.

## Produktkontrakt

- Internt: boligens nye handlingskort åpner avtalehistorikk. Første utgave av
  beboeraksept fryser lagret boligvalg og serverens total. Klientpriser ignoreres.
- Endringsordre bruker én eksisterende, aktiv bestilling. Før/etter har selvstendige
  varelinjenøkler og rommerking. Varelinjer valideres på serveren; prisvirkningen
  angis separat og eksplisitt inkl. mva. Mottatte varer kan ikke fjernes eller
  reduseres under mottatt mengde. En uavklart bestillingssending stopper opprettelse.
- Kladd → internt godkjent → publisert lenke er separate handlinger. Uendrede
  request-ID-er og payload-hash gir sikker replay uten doble dokumenter.
- Ny utgave deler avtalerekke med tidligere utgaver. En gyldig eldre utgave kan
  velges. Aksept låser nøyaktig utgaven som ble vist, og sperrer uavklarte
  søskenutgaver. En unik databaseindeks hindrer to aksepter i samme rekke.
- Kundesiden har gjennomgang → navn/svar/bekreftelse → kontroll → registrering.
  Først bekreftet serversvar viser kvittering. Mistet svar prøves med samme
  request-ID. Reload viser lagret kvittering. Avslag er en egen eksplisitt handling.
- Lenken har 256-bit tilfeldig token i URL-fragmentet. Kun hash lagres på serveren,
  også replay-tabellen beholder bare payload-hash. Ingen token sendes i querystring
  eller referrer. Ingen analytikk eller eksterne skript lastes på kundesiden.
- Anonyme kall får bare én avtale med godkjent vare-/pris-/identitetsprojeksjon.
  Ingen interne kontaktfelt, marginer, grunnsum/fratrekksgrunnlag, håndteringsnotater,
  order-ID-er, private filer eller data fra andre boliger. Separate private skjemaer
  bevarer eksisterende deny-all for bolig_private; alle tabeller har RLS uten
  direkte klient- eller service_role-grants. Nye definer-funksjoner har tom search_path.
- Alle interne kall kontrollerer bruker/firma/modultilgang og rolle på nytt.
  Kundelenker stopper ved tilbakekalling, utløp, firmaavaktivering og arkivert
  prosjekt/bygg/oppgang/bolig. Akseptert kvittering kan leses etter svarfristen.
- Lokal kladd og uavklarte forsøk er avgrenset per bruker/firma/root/bolig.
  Fanebytte/lukking bevarer kladd; fremmed firmasvar skjuler innhold.
- Akseptert endringsordre krever dokumentert leverandør-/bestillingsoppfølging
  før ferdigstilling. Aksept/oppfølging inngår i sluttkontrollens basis, også på
  overliggende bygg/prosjekt. Tidligere grønn godkjenning blir ikke stille gjenbrukt.

## Avgrensning

Dette er aksept av et forberedt grunnlag. Full beboerportal, selvbetjente tilvalg,
chat, dokumentarkiv og automatisk invitasjonsmail er fortsatt egne steg. Ingen
reell beboer eller leverandør er kontaktet av QA. En delt lenke identifiserer
avtalen, mens navnet er oppgitt av den som svarer; løsningen påstår ikke sterk
identitetsverifisering eller en elektronisk signaturtjeneste.

Aksept endrer ikke det opprinnelige boligvalget, bestillingen, leveringsmengder,
innkjøpsmail eller eksisterende Cordel-fil. Endringsordren er den nye avtalen med
beboeren; leverandørendringen må bestilles/krediteres separat og dokumenteres.
Full automatisk delta-bestilling og ny effektiv mottaks-/FDV-modell følger senere.
Samlet sluttdokumentasjon har fortsatt sin eksisterende dokumentkontrakt;
avtalekvitteringen kan skrives ut separat fra kundesiden.

## Verifikasjon

- PostgreSQL/PGlite: **759 assertions PASS**, alle tidligere 681 beholdt.
  Nye scenarioer dekker reelle RPC-er, eksakt akseptert versjon, eldre utgave,
  prisforfalskning, feil firma/bolig/rolle/anon, privat tabellinnsyn, direkte intern
  funksjonssperre, token-projeksjon/hash, sekvens/replay, beslutningslås,
  tilbakekalling/utløp/arkivering/firmaavaktivering, mottatte mengder, originalordre
  og ferdigstillingsbasis før/etter leverandøroppfølging.
- Chromium: **30 assertions PASS** med faktisk React-handler og RPC-/fetch-adapter.
  Separate interne og offentlige stylesheets, 390/1280 px, ingen overflow eller
  overskriftsoverlapp. Før/etter, intern godkjenning, lenke, leverandøroppfølging,
  kladd/fokus/lukking, leser/fremmed firma og mistet akseptsvar er kontrollert.
- Eksisterende ferdigstilling **29 PASS**, boligtilpasning/kort **22 PASS**,
  PDF/ZIP **36 PASS** og foundation React med tilgang/recovery PASS.
- Faktiske Sandbox-RPC-er, inkludert anon-aksept, eksakt replay og intern readback,
  er bestått i transaksjon med ROLLBACK. Ingen e-post eller reell avtale.
- Security/performance-advisors: kun to nye tilsiktede deny-all/RLS INFO og nye
  foreløpig ubrukte indekser. Ingen nye uindekserte FK-er, anon definer i public,
  eller sikkerhetsvarsler.
- Endelig Preview, CI og innlogget skynettprøve dokumenteres i PR-beskrivelsen.
- Full critical build er bestått etter at ny separat HTML-entry er lagt til.
  Endelig Sandbox-build, eksisterende berørte reiser og scope kontrolleres før push.

## Publiseringsstatus før godkjenning

Ny kode er committet lokalt på samme boligbranch. Push til eksisterende GitHub-branch
ble avvist av automatisk godkjenningskontroll: den krevde uttrykkelig tillatelse til
å publisere kodepakken til GitHub. Ingen alternativ publiseringsvei er forsøkt.
Eksisterende Preview og PR-head er derfor fortsatt den tidligere utgaven.

Migrasjonen er installert bare i Sandbox. Faktiske gateways/anon, replay og intern
readback består i ROLLBACK-prøven. Et eget syntetisk prosjekt er klargjort:
**DEMO – Endringsordre og beboeraksept**, H0101 med to varer og testpris 1250 kr.
Ingen kontakter, e-post eller reell leverandør er knyttet til dette.

En lokal Chromium-prøve av faktisk Sandbox-bundet dist forsøkte ekte REST, men
nettverksforbindelsen til Sandbox returnerte `net::ERR_EMPTY_RESPONSE` før HTTP-svar.
Ingen aksept ble registrert. Dette er ikke en bekreftet appfeil eller en bestått
skynettprøve. Endelig browser → REST → database → reload må gjennomføres på den
faste Preview-adressen etter autorisert push. Nettverksfeil får nå norsk melding.

## Kort brukertest etter Preview-oppdatering

1. Åpne en bolig → Endringer og beboeraksept → Klargjør beboeraksept.
2. Beskriv grunnlaget → Lagre og gjennomgå → kontroller → Godkjenn grunnlaget.
3. Lag beboerlenke. Åpne den i en egen fane og kontroller varer, pris og utgave.
4. Bruk bare et syntetisk QA-grunnlag til utvikleraksept; aldri en reell kundeavtale.
5. For endring: Ny endringsordre → velg bestilling → tilpass varer/pris →
   gjennomgå Før/Etter. Etter QA-aksept skal Ferdigstilling kreve leverandøroppfølging.
6. Dokumenter avklaring/bestillingsreferanse → Lagre oppfølging. Opprinnelig ordre
   og mottak skal beholdes; sluttkontrollen krever ny eksplisitt gjennomgang.
