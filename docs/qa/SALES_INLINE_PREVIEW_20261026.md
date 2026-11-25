# Kundepreview bruker samme innlogging som appen

Miljømål **BEGGE**. Baseline: faktisk publisert main
3ba4d2283a80c151b5a45db1631a99421360e1ef (PR287). Samme arbeidsbranch og
faste Sandbox-Preview gjenbrukes. Ny TEST OK før merge/Production; deretter
kontrollert main → demo med bevart overlay. Ingen databaseendring.

## Feilrapport og avgrenset diagnose

Andreas' skjermbilde 26.10 viser «Du må være innlogget» ved
«Forhåndsvis som kunde», mens hovedappen er åpen på tilbudssaken.
Denne meldingen oppstår når previewens session-lesing mangler bruker/token,
før firmaoppslag eller selve tilbudshentingen. Skjermbildet alene dokumenterer
ikke hvorfor hans konkrete nettleser mangler denne sessionen.

Forrige rettelse (PR285) la til retry, senere innlogging og foreground-kontroll.
Den beholdt egen fane på PC og iframe på mobil. Begge starter et nytt dokument
og en egen Supabase-klient, som må finne lagret innlogging. En gyldig app-session
i minnet trenger ikke finnes i persistent lagring. Faktisk installert SDK med
syntetisk in-memory session gjenskaper at appklienten er innlogget mens en separat
klient er anonym. Dette er en bekreftet feilbane, ikke en attest på Andreas'
lagringsinnstillinger. Ingen passord, tokens eller kundedata er lest ut.

## Rettelse

- SalesDetailView åpner en native dialog via portal i samme dokument på alle
  skjermstørrelser. Eksisterende saksinstans beholdes.
- SalesDraftCustomerPreview får eksplisitt saks-ID og gjenbruker eksisterende
  registrert appklient. Tilbud og firmaprofil hentes fortsatt fra serveren med
  uendrede scope-/RLS-kontroller. Ingen kopiering av session fra opener, URL,
  nettleserlagring eller annen adresse.
- Tilbake/Escape lukker bare dialogen, gjenoppretter fokus og beholder underliggende
  arbeid. Saksskifte fjerner forrige preview. Native dialog gir fokusfelle.
- Kundepresentasjonen er fortsatt skrivebeskyttet, uten aksept eller avvisning.
  Lokale opsjonsforsøk lagres ikke. Ulagrede tilbudslinjer vises ikke som lagret kladd.
- Den gamle separate sales-preview-adressen beholder sikker innloggingskontroll
  og URL-fallback. Appknappen er ikke lenger avhengig av den.
- Se kundens tilbud (publisert versjon), editor/autosave, publisering, sending,
  priser, PDF, global auth/bootstrap, firmaroller og andre moduler er uendret.

## Testkontrakt

Eksisterende critical-session-, kundevisnings- og mobiltester beholdes.
To gamle kildeasserts om egen fane endres eksplisitt til den nye dialogkontrakten;
standalone-routing, skrivebeskyttelse og auth-/hydreringstestene beholdes.

Ny nettleserprøve bruker faktisk knapp, dialog, kundekomponent, klientregister og
Supabase SDK. Bare servertransport og urelaterte detail-paneler erstattes med
syntetiske grenser. Normal og quota-blokkert lagring ved 390/1366 px, app-session
mot separat klient, servergrunnlag, fokus, Tilbake/Escape, ulagret underliggende
input, fanebytte med opsjonsvalg, tilgangstap, saksskifte og utlogging.
Alle nettverksgrenser fanger utilsiktede live-kall; ingen reell innlogging eller e-post.

Ny prøve kobles til eksisterende sales-draft-preview-browser-check og dermed
eksisterende PR Core Safety-jobb. Faktiske resultater føres her og i PR før levering.

## Brukerprøve

1. Åpne en eksisterende tilbudssak og trykk **Forhåndsvis som kunde**.
2. Kundens visning skal åpnes inne i appen, med **Tilbake til tilbudet** øverst.
   Ingen ny fane eller ekstra innlogging skal være nødvendig.
3. Prøv en opsjon, bytt nettleserfane/app og kom tilbake. Prøvevalget skal stå.
4. Lukk med Tilbake/Escape. Samme sak og eventuelt ulagret arbeid skal stå igjen.

Andreas' faktiske nettleserøkt, fysisk iOS/Safari/Android og innlogget
Production-prøve er ikke attestert av utviklertestene. Ikke send eller publiser
et kundetilbud bare for denne prøven.

## Faktisk lokal QA

- Full critical/Sandbox-build PASS, inkludert eksisterende auth-, Sales-,
  hydrering-/recovery-, kundeaksept-, pris-, PDF-, HR/KS/HMS- og miljøbinding-checker.
- Critical-session-scenarioene PASS med faktisk SDK og registrert appklient;
  separat in-memory klient er anonym, samme registrerte klient kan hente preview.
- Ny faktisk knapp/dialog/SDK/Chromium-prøve: **80 assertions PASS** på
  390/1366 px med normal og quota-blokkert lagring. Ingen reelle nettverkskall.
- Eksisterende kundepreview/jsPDF-prøve: **30 assertions PASS**, inkludert
  standalone sen innlogging/retry, bruker/firma/bytte, utlogging, pris/mva.,
  skrivebeskyttelse og de tidligere rettede PDF-mellomtitlene.
- Eksisterende faktiske tilbudseditorer: **196 Chromium assertions PASS**,
  fire bredder, callbacks/media og global CSS bevart.
- Mobil- og PC-bilder av den nye dialogen er generert og visuelt kontrollert.
- Lokal Chromium ble hentet fra en separat, versjonspinnet testavhengighet etter
  at Playwrights CDN ga ugyldige arkiver. Ingen produksjonsavhengighet/lockfil endret.
  CI beholder sin eksisterende Playwright/Chromium-konfigurasjon.

Kandidat-SHA, PR/CI og faktisk Preview-status føres i PR. Production er fortsatt
på 3ba4d228 til denne rettelsen har fått egen TEST OK og vanlig releasekontroll.
