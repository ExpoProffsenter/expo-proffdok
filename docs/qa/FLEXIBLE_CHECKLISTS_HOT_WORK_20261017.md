# Fleksible underpunkter og varme arbeider – Preview 17.10.2026

Miljømål: **BEGGE**. Baseline main `7190ccb0f3176d7d690bb3408ae3b8ed1f9135b4` (PR #269 ferdig). Ny brukerbestilling: generelle redigerbare underpunkter på alle sjekklister, «Varme arbeider» for alle fag og kobling fra eksisterende rutine. Ny TEST OK kreves for denne leveransen.

## Scope og bakoverkompatibilitet

Sjekklistesentral, generisk `checklistFields`/`ChecklistFields`, prosjektets `checklistTools`/`ProjectChecklistWorkspace`/`checklistRuns`/visning/gjenopptakelse, KS/HMS-kontrollers normalisering/utfylling, eksisterende katalogkopiering, PDF-/rapportmapping, varme arbeider-forslag og rutinen `hot-work`. Additiv SQL-validering i eksisterende private hjelpere og to kommandoer. Ingen nye tabeller eller offentlige RPC-er, RLS, menynavigasjon, main.jsx, Sales, garantiinnhold, Support-/Resend- eller e-postendring.

Underpunkter har UUID, tekst, svartype, krav og eventuell betingelse fra et tidligere valg i samme punkt. Skjult felt beholder kladdverdien ved av/på, men er ikke et manglende svar eller et synlig PDF-felt. Gamle punkter uten felt beholder JSON-kontrakten. Publiserte utgaver og fullførte kontroller forblir faste. Garantipunkter kan fortsatt ikke kopieres/redigeres.

Bekreftelser bruker hendelses-ID fra avkryssing og serverens bruker/identitet/tid/SHA256 av svar og definisjoner til og med aktuell del. Klienten rydder bekreftelser ved tidligere endringer. Serveren avviser gammel hendelses-ID på nytt grunnlag. Videre etterkontroll endrer ikke før-start-bevis. Ny kontroll arver ingen bekreftelser.

## Varme arbeider og rutinen

Rutinen finnes fra før: «Varme arbeider og brannberedskap». Oppdateringen er kildeforslag v2, med konkret sti til «Bruk mal: Varme arbeider», før-start-lagring og etterkontroll i samme sjekkliste. Firmaets tidligere godkjente rutine overskrives ikke; bruk eksisterende kildeoppdatering for å sammenligne og godkjenne den nye teksten. Det opprettes ingen duplikatrutine. Den nye malen ligger i sentralen for alle firmaer med tilgang og blir en firmaversjon ved tilpasning/publisering. Felles maler vises også ved valg av ett bestemt fag i prosjektet.

Tre deler: jobb/deltakere, sikkerhet og egne bekreftelser FØR start, avslutning og etterkontroll. Betingede felt for alarm, tak og eksplosjonsfare. Minste planlagte ettervakt 60 minutter. Virksomheten kontrollerer faktiske tidspunkter, varighet, sertifikater og lokale vilkår; appen er ingen automatisk arbeidstillatelse eller kontroll av reell kompetanse. Eksterne uten innlogging signerer eget vedlegg. Kilde: [Brannvernforeningen, sikkerhetsforskrift 1.1.2024](https://www.brannvernforeningen.no/sikkerhetsforskrift-for-utforelse-av-varme-arbeider-1.1.2024.pdf?pid=Native-ContentFile-File), kontrollert 17.10.2026. Selvstendig formulering, ingen kopiert Dextro-mal eller andres svar/signaturer. Varslede endringer fra 2027 innføres ikke på forskudd.

## Verifikasjon

- Full critical/build med eksplisitt Sandbox-binding PASS. Ny funksjon inngår i critical-kjeden; CI har egen PostgreSQL-/Chromium-jobb.
- Eksisterende virkelige React-scenarier for sentral/publisering/import, popup, gjenopptakelse, prosjektarbeidsflate/prosjektering og KS/HMS-kontroller PASS. Omfatter feil/retry, kollegakonflikt, scope, lås, gammel historikk og fanebytte.
- PostgreSQL/PGlite bruker de virkelige migrasjonene og eksisterende sentral-/prosjekt-/underskjema-/kontrolltester, pluss nye underpunkter. Lokal plattformadapter er uttrykkelig syntetisk.
- Faktisk Sandbox: migrasjon `flexible_checklist_fields_hot_work` installert. 27 sentral-, 35 prosjekt-, 17 underskjema-, 54 gjennomførings- og 26 nye feltkontroller PASS (159), alle syntetiske skriverier rollback. Privat signeringshjelper lukket. Eksisterende kommandokropper i Sandbox var eksakt lik kildebaselinen før migrasjon.
- Sikkerhetsrådgiver kontrollert etter migrasjon: ingen funn på nye hjelpere; ingen nye offentlige endepunkter/tabeller. Eksisterende private RLS/info og token-/autorisert RPC-varsler beholdes.
- Lokal Chromium bruker faktiske komponenter og appens runtime-stiler med syntetisk RPC. Tester malbygging/publisering, felles import ved Elektriker-filter, obligatoriske/betingede felt, lokal kladd, gjenåpning, fokus og fire bredder (1363/768/390/320). Breddevern kontrollerer også feltbokser, slik at overflow:hidden ikke kan skjule klipping. Ny native details-del fikk minmax(0,1fr) og border-box for å kunne krympe på mobil.
- PDF-mapping for mal, prosjektkontroll, KS/HMS-kontroll og ordinær rapport oppdatert. Nygenerert tom mal og syntetisk utfylt kontroll rendret og visuelt inspisert (to sider hver).
- Ingen faktisk e-post sendt. Production er ikke migrert/publisert. Innlogget brukerprøve i den faste Preview gjenstår; lokal komponenttest er ikke en slik prøve.

To gamle katalogvern er presist oppdatert fordi brukeren har bestilt endring i `hot-work`: opprinnelig v1 er fryst i testfixture og erstattes bare under gammel 73-raders hashberegning. Dermed sjekkes alle andre rutiner eksakt som før, og ny v2/henvisning sjekkes separat. Kontrollert kildedato får kun unntaket 17.10.2026 for varme arbeider. Ingen scenario er fjernet.

## Kenneths test på fast Preview

https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/

1. KS/HMS → Forvaltning → Sjekklistesentral → **Bruk mal: Varme arbeider**. Se felles fag og de tre delene. Åpne **Underpunkter og svarfelt** for å endre et valgfritt felt eller legge til et nytt. **Lagre og publiser**.
2. Åpne et lagret generelt prosjekt/ordre eller våtrom → **Sjekklister** → **+ Legg til sjekkliste**. Velg gjerne Elektriker: «Varme arbeider» skal fortsatt vises. **Hent sjekkliste** → **Åpne sjekkliste**.
3. Skriv litt i første del. Lukk/åpne, bytt app/fane og kom tilbake. Kladden skal beholdes. I del 2: Ja på alarm viser ekstra felt; Nei skjuler det. **Sjekkliste fullført** med manglende svar skal stoppe med forklaring.
4. Fyll og lagre del 1–2 før start (kun testdata). Kontroller egen bruker/tid på bekreftelsen etter lagring. Del 3 kan gjøres senere. **Lagre** lar en kollega fortsette; **Sjekkliste fullført** avslutter dokumentasjonen. Kontroller egen PDF og **Start ny kontroll**, som skal ha tomme bekreftelser.
5. Håndbok: sammenlign varme arbeider-rutinens nye kildeforslag. Den skal vise til denne sjekklisten. Firmaets gamle godkjente tekst endres først ved ny firmagodkjenning.

Ny TEST OK → merge → Production-migrasjon/verifikasjon → kontrollert main → demo og 19+5 preflight.
