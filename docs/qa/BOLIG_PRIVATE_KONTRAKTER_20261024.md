# Boligprosjekter – privat kontraktsområde

24. oktober 2026. Kenneth: «kjør, bruk gjerne vedlagte faktiske kontrakt som eksempel».
Miljømål BEGGE, foreløpig samme feature/Preview og Sandbox. Ingen produksjonsmerge/-migrasjon.

## Levert omfang

Prosjektets **Kontrakter** har private originaler, opplasting av PDF/JPG/PNG inntil 20 MB, dokumenttype (Hovedkontrakt, Vedlegg, Tillegg), nye versjoner med valgfri merknad, historikk, forhåndsvisning og nedlasting. Originalbytes bevares. Hovedkontrakt er en dokumenttype, ikke en automatisk avtalegodkjenning eller dokumentrangering. Tittel og type tilhører stabil dokument-ID; ny fil blir en ny versjon. Ingen sletting/overskriving av lagrede versjoner.

Prosjektoppretteren med aktiv Bolig-prosjektledertilgang starter det private området. Deretter kan kontraktsadministrator uttrykkelig gi navngitte aktive interne Bolig-brukere **Lese kontrakter** eller **Laste opp og administrere**. Vanlig Bolig-prosjektleder, firmaadmin eller systemadmin får ikke innsyn i andres kontraktsområde gjennom rollen alene. Prosjektoppretteren kan ikke fjernes via kontraktslisten. Bortfalt intern profil, firmalisens, Bolig-/Prosjekter-rettighet eller aktivt arbeidsfirma sperrer servertilgangen. Arkivert prosjekt beholder lesbar historikk og sperrer nye versjoner/tilgangsendringer.

Kontraktsmetadata, filbaner, originaler, versjoner og tilgangsliste bruker samme private rettighet. Uten innsyn returnerer oversikten bare kontekst, root-ID og `allowed:false`, uten dokumentantall/titler/filnavn. UE-/leverandør-/beboer-RPC-er og vanlige rapport-/FDV-/sluttpakker er uendret og har ingen referanse til kontrakttabellene/bucketen.

Første etappe har ikke OCR, søk i selve teksten, analyse, indeksregulering, rangering av kontraktsdokumenter, automatisk aksept eller oppgaver. Søket filtrerer bare synlige dokumenttitler, filnavn og dokumenttype. Skannede PDF-er kan vises uten OCR. Nedlasting er alltid tilgjengelig som alternativ hvis den aktuelle nettleseren ikke viser innebygd PDF.

## Lagring og tilgang

- Additiv migrasjon `20261024181231_bolig_private_contracts.sql`, kontrollert installert i Sandbox `ppvircenkjizeiqdxphj`.
- Fire private RLS-tabeller uten direkte browser-/anon-/service_role-tabellgrants: contract_access, contract_documents, contract_files og contract_events. Ingen eksisterende tabell eller authorizer er endret.
- Egen privat bucket `bolig-contracts`. Ny restriktiv Storage-policy sperrer denne bucketen også hvis en eldre permissiv policy er vid. Predikatet er TRUE for alle eksisterende bucketer, som beholder sine opprinnelige regler. Ingen kontraktspolicy gir direkte SELECT, INSERT, UPDATE eller DELETE.
- `bolig_contracts` er en authenticated invoker-wrapper til den private serverkontrollen. Tilgang sjekkes etter prosjektlås, inkludert ved ventende skriving og eksakt retry. Versjon og tilgang bruker CAS. Hver bekreftet opplasting/grant har audit-rad. Opplasterens navn er fryst på versjonen.
- Egen Edge Function `bolig-contract-files`, versjon 1, ACTIVE, `verify_jwt=true`. Auth.getUser før body/RPC/Storage. Alle Storage-stier kommer fra den private SQL-gatewayen. Service key er bare i Edge-miljøet, aldri klient eller QA-artefakter.
- Streaming body-grense, MIME/signatur/suffiks/små filnavn, serverberegnet SHA-256, `upsert=false`, hashkontroll av duplikat, ny rettighetskontroll før kvittering/bytes. Både byteantall og hash verifiseres før utlevering. En feil eller tapt kvittering blir ikke fremstilt som lagret.
- Ingen public/signed URL. Nedlasting går gjennom fersk brukerautorisasjon før og etter Storage-lesing. Svar har private/no-store. Lokal blob-URL tilbakekalles ved lukking, bakgrunn, reell blur, tilgangs-/firmabytte og ny kontroll. Fokus inne i PDF-rammen behandles ikke som reelt appbytte.
- Opplastingskladd, valgt fil og retry-ID ligger bare i avgrenset RAM. Ingen fil, tittel, merknad eller rettighet lagres i localStorage/sessionStorage/IndexedDB. Kladd overlever normal remontering i samme økt; ny sideinnlasting krever ny fil. Bruker-/firmabytte og tilbakekalt innsyn rydder den. «Forkast opplastingskladd» sletter ingen lagret original.
- En uferdig/opplastet fil blir ikke listet som dokument før native `finish` har bekreftet objektet. Klienten kan prøve samme forsøk igjen etter tapt svar. Ved kollegakonflikt må siste grunnlag hentes bevisst før nytt forsøk. Uferdige forsøk er utilgjengelige; automatisk opprydding av uferdige objekter er ikke bygget i første etappe.

Security advisors er kontrollert før/etter. Ingen nye varseltyper. De bevisst lukkede RLS-tabellene og den authenticated private gatewayen følger prosjektets eksisterende private RPC-mønster; ingen urelatert policyopprydding er utført.

## QA

| Kontroll | Resultat |
|---|---|
| Full Sandbox-build med eksisterende critical checks | PASS |
| Bolig PostgreSQL | 1632 assertions PASS, 57 nye kontraktsassertions |
| Faktisk React → lokal HTTP → faktisk filhandler → faktiske SQL ACL-/versjonsfunksjoner | 37 Chromium assertions PASS ved 320/390/768/1366 px; Auth og Storage er syntetiske |
| Samme browser-flyt med vedlagt faktisk skannet PDF | PASS; bytes identiske ved nedlasting, lokal bruk uten publisering av innhold |
| Filhandler | 25 assertions PASS; kjørt både med syntetisk fil og vedlagt original lokalt |
| Native Sandbox som authenticated | PASS: privat ACL, prepare/finish/kvittert retry/historikk, direkte tabell-/Storage-/anon-sperre og tilbakekalling; rollback |
| Native Edge HTTP | OPTIONS 204; POST uten JWT 401; POST med ugyldig JWT 401 |
| Eksisterende Bolig-workspace, faktisk React | PASS |
| Eksisterende KS/HMS-/timeintegrasjon i Chromium | 25 assertions PASS |
| Scope mot main og uendrede critical checks | PASS |

Native Sandbox-prøven bruker eksisterende syntetiske demoidentiteter og bare midlertidig Storage-metadata; ingen faktiske Storage-bytes opprettes der. Alle testskrivinger rulles tilbake. Dette er ikke en innlogget ende-til-ende-prøve av virkelig Storage i delt Preview.

Det virkelige vedlegget er sju skannede sider uten søkbar tekst. Alle sider er rendret lokalt uten feil. Originalen er uendret; den, skjermbilder av innholdet og kontraktsteksten er ikke lagt i repo, delte demo-/pilotdata eller produksjon. Testene logger ikke innhold eller originalfilens metadata.

Kenneth har bekreftet at virkelig filopplasting i Preview fungerer, men meldte blafring ved filvalg. Rettingen er avgrenset til `BoligContracts.jsx`, kontraktens browser-regresjonstest og dette QA-notatet. Et faktisk filechooser-klikk med simulert OS-blur/focus gjenskapte feilen før retting. Nå beholdes samme åpne upload-dialog gjennom filvalg og avbryt, også med forsinket tilgangssvar. Cancel-hendelsen stoppes på filfeltet og lukker ikke den overordnede dialogen. Tittel og tidligere valgt fil beholdes.

Bare brukerens opplastingskladd holdes synlig under filvelgerens fokusrunde. Dokumentlisten skjules og lagring/valg av lagret dokument sperres til fersk ACL er bekreftet. Ekte bakgrunn, firma-/tilgangshendelser og tilbakekalling skjuler fortsatt privat innhold. Nye tester dekker også bakgrunn midt i filvalg og tilbakekalt profil mens filvelgeren er åpen; ingen bytes skrives etter tilbakekalling. Ingen felles dialog, integrasjon, backend eller migrasjon er endret i rettingen.

Samlet CI og fast Preview verifiseres på nøyaktig publisert HEAD. Innlogget brukerprøve av rettingen i den aktuelle nettleseren og fysisk mobil/Safari gjenstår. Positiv opplastingsfeedback er ikke samlet Bolig TEST OK eller produksjonsgodkjenning. Ingen produksjonsmerge.

## Kort brukerprøve

Fast adresse: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Boligprosjekter → åpne ønsket prosjekt → **Kontrakter**. Prosjektoppretter med prosjektledertilgang skal se **Last opp dokument** og **Tilgang**. Andre uten eksplisitt grant ser bare at området er privat.
2. **Last opp dokument** → velg PDF, tittel og dokumenttype → **Last opp og lagre**. Se bekreftet versjon 1. **Vis dokument** og **Last ned** skal gi originalen.
   Prøv også å åpne filvelgeren og avbryte etter et filvalg: samme opplastingsvindu, tittel og tidligere valgte fil skal beholdes uten blafring.
3. **Ny versjon** → velg revidert fil → **Lagre ny versjon**. **Versjoner (2)** skal vise begge originalene. Prøv fanebytte med usendt tittel/fil og med åpen forhåndsvisning.
4. **Tilgang** → gi en navngitt person lesetilgang. Personen skal kunne lese, men ikke laste opp/delegere. Tilbakekall med **Ingen tilgang** og kontroller at lesing stanser ved ny kontroll. Ikke bruk ekte personers kontraktsinnsyn som test uten tilsiktet utpeking.
