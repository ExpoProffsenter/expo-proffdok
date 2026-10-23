# Beboervarsler – samlet opprettelse, publisering og PDF

Miljømål **BEGGE**. Først feature-Preview og Sandbox. Ingen Bolig TEST OK, produksjonsmigrasjon eller merge. E-post er AV; ingen ekte meldinger sendt.

## Resultat

Kenneth ba om å fjerne en separat godkjenningsrunde og gjøre opprettelsen tydelig. «Nytt beboervarsel» står nå øverst i «Fremdrift og varsler». Samme vindu brukes fra en aktivitet eller et lagret varsel. Velg prosjekt, bygg, oppgang eller individuelle boliger. Skriv overskrift, tekst og datoer og se forhåndsvisningen med bedriftens logo og grønn utforming fra beboerkanalene. Prosjektkontakt gjenbrukes lokalt, og telefon/e-post kan hentes fra firmaprofilen.

Sluttvalg i samme vindu:
- **Lagre utkast**: lagring uten publisering.
- **Last ned PDF / oppslag**: ferdig papirutgave med logo og prosjektkontakt. Beboerens e-post er ikke et krav. Ingen digital publisering.
- **Publiser til beboerne**: én atomisk handling binder gjeldende innhold/mottakere og publiserer i portalen med dagens dato, eller planlegger valgt fremtidig dato. E-post bestilles gjennom eksisterende motor når transport er aktivert. Ingen ekstra godkjenningssted. Testmiljøets transport/automatiske fremtidspublisering forblir AV.

Hver bolig har en egen scoped varselrad, mens prosjektoversikten samler samme utgave til ett kort. Generelle varsler gir ingen kunstig Gantt-aktivitet. Tidligere aktivitetsvarsler og deres sikkerhetskontrakt beholdes. Aktivitetsbaserte utkast kontrollerer også aktivitetens revisjon. Innholdsendring får ny utgave, eksakte nettverksforsøk gjenspilles uten duplikat. Et nytt utkast eller papir tilbakekaller aldri en tidligere digital utgave; først ny digital publisering erstatter den. Kontaktbytte stopper gamle digitale utgaver, også A→B→A. Server reautoriserer rolle/firma/prosjekt og mottakergrunnlag.

PDF laster aktuell firmaprofil/logo og leser hele varselutvalget på nytt etter lazy lasting. En utilgjengelig registrert logo stopper eksport fremfor å gi en lydløst logo-løs fil. Generelle PDF-er er ferdige ut fra papirhandlingen, ikke digital godkjenning. Offentlige oppslag har ingen automatisk mottakerliste med navn/e-post. Ved individuelt utvalgte boliger viser PDF adresser og bolignummer.

## Implementering og verifikasjon

Branch `fase45b-boligprosjekter-foundation-20261020`, PR #278. Arbeidsmappe `/workspace/scratch/68f35cdb8be0/expo-bolig-foundation`. Forrige publiserte SHA `0b4795a9169a85fa10ff20488c8209f142861437`.

Migrasjon **20261023155220_bolig_resident_notice_composer.sql** er installert bare i Sandbox `ppvircenkjizeiqdxphj`. Lokalfilen følger serverens faktiske versjon. Samme varseltabeller og portal/worker brukes; ingen nye offentlige definer-grants. Sandbox Edge worker `bolig-progress-notifications` versjon **3**, ACTIVE, samme private token-autentisering og verify_jwt=false som før.

Bestått:
- **1154 PostgreSQL-asserts**, alle tidligere 1125 beholdt. Nye reiser inkluderer gruppe/papir, ingen e-postkrav for papir, komplett rollback, idempotent svar, scoped historikk/portal, varslingskø, kontaktbytte, eldre aktivitetsvarsel, kildekonflikt og fremtidspublisering.
- **34 Chromium-asserts** for fremdrift/ny composer: bygge-/oppgangsutvalg, papir med manglende beboer-e-post, felles prosjektkontakt, kladd ved lukking/fokus, eksakt retry etter tapt publiseringssvar, eksplisitt sluttvalg og 1366/390/320 px.
- Eksisterende **30** masseplan/tidslinje, **34** overtakelse/A–Å og **16** restpunkt/eldre papir-UI PASS. Faktisk foundation React PASS.
- **28** PDF-asserts med faktiske byte/tekst, gruppe, logo, ferdig papir uten godkjenning, personvern, paginering og hel-utvalg-fersklesing. Ferdig A4 med Ringside-logo rendret med MuPDF og visuelt kontrollert. E-postens eksisterende 22 + dialogdekning, samt nye brand/URL/escape-kontroller PASS; ingen ekte utsending.
- Full critical build PASS. Sikkerhetsrådgiver har samme seks kategorier og nøyaktig samme antall før/etter, inkl. 152 private RLS deny-all-tabeller.
- Faktisk Sandbox-RPC-smoke PASS: papir for flere boliger, uten kunstig aktivitet, idempotent retry, boligisolasjon og ett-trinns portalpublisering. Alle syntetiske smoke-data rullet tilbake. Etterpå: 0 restprosjekter, 0 pending/sending, e-post AV, én eksisterende 40-boligers pilot.

Fysisk Safari og Kenneths innloggede brukerprøve gjenstår. Ingen påstand om mottatt e-post. Publisert SHA/Preview/CI føres i handoff etter push.

## Kort brukerprøve

Samme faste Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne pilotprosjektet → **Fremdrift og varsler → Nytt beboervarsel**.
2. Velg **Et helt bygg** eller **En hel oppgang**, kontroller antall/utvalg, skriv overskrift og melding. Se logo/forhåndsvisning.
3. Fyll prosjektkontakt, velg **Last ned PDF / oppslag**. PDF skal være ferdig med logo og riktige datoer. Manglende beboer-e-post hindrer ikke dette.
4. **Lagre utkast** skal ikke publisere. Lukking og ny åpning skal beholde kladden. Prosjektkontakt skal gjenbrukes fra tidligere.
5. I en syntetisk bolig med navn/e-post kan **Publiser til beboerne** prøves. Det skal ikke komme en ny godkjenningsrunde. E-post er AV i Sandbox; kontroller portalstatus, ikke innboksen.

## Andre forenklinger kartlagt – ikke implementert i denne pakken

Kenneth spurte under arbeidet om flere steder med dobbeltarbeid. Det er ikke autorisasjon til å fjerne forskjellen mellom varebestilling, faktisk utførelse og overtakelse.

| Sted | Funn / neste forslag |
| --- | --- |
| Boligavtale og endringsordre | `BoligCommerce` har Lagre og gjennomgå → Godkjenn grunnlaget → Lag beboerlenke. Kandidat: én gjennomgang med Lagre utkast / Opprett beboerlenke. Gjeldende snapshot/revisjon og beboerens egen aksept må beholdes. |
| Bestilling | Gjenbruk vareutvalget direkte frem til sendevinduet; unngå samme kontroll to ganger. Leverandør, adresse og prosjektkontakt bør arves, bare avvik fylles inn. Ikke kall et lagret grunnlag «bestilt». |
| Restpunkt og aktivitet | Vurderingens ansvarlige og aktivitetens ansvarlige er nå separate verdier. Foreslå samlet registrering og tydelig visning av hvem som faktisk får varsler; ikke synkroniser/lukk kilden lydløst. |
| Ekstern protokoll | Bekreft og send finnes allerede. Gjør den samlede inngangen lett å finne, uten at e-post blir påkrevd for å dokumentere retting. |
| Sluttpakke | Bruk samme åpne-forhold-oversikt til vurdering og PDF/ZIP. Behold intern sluttkontroll og faktisk overtakelse som forskjellige dokumenterte handlinger. |

Prioriter boligavtaler/endringsordre som neste konkrete forenkling. Ikke påstå at denne er implementert. Ingen subagenter brukt.
