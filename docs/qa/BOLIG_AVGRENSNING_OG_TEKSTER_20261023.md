# Bolig: prosjektkobling og vern av eksisterende app

Miljømål **BEGGE**, utførelse bare i feature-Preview/Sandbox. Kenneth har uttrykkelig presisert **ingen produksjonsmerge ennå**. PR278 skal fortsatt være OPEN DRAFT. Ingen Production-migrasjon, deploy/promotion eller main→demo-synk i denne pakken.

Baseline feature447710da1117d9492a49ee6cfec2e693b6f2e351. Faktisk origin/main er36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed etter ny fetch. CI668/40029375087 på forrige featurekode er observert SUCCESS. Ny CI/READY må avleses på ny SHA etter publisering.

## Leilighetsinformasjon

Brukerreisen er leilighet i aktivt boligprosjekt → kontaktinformasjon → eksplisitt lagring gjennom eksisterende bolig_workspace → samme bolig med serverkvittering.

- «Lagre i firmaet» er erstattet med «Lagre endringer». Serverkvitteringen er «Endringene er lagret.»
- Tilkobling av et eget ordinært ProffDok-prosjekt er valgfritt og sammenfoldet. Forklaringen sier at boligen allerede hører til dette boligprosjektet. Ingen hovedprosjekttilknytning mangler.
- Eksisterende ekstra tilknytning vises i sammendraget som «Eget prosjekt er koblet til». En ID som ikke finnes i den tilgjengelige prosjektlisten beholdes i valget. Autorisasjon, payload, revision, lokal kladd og serverlagring er uendret.
- Åpning/lukking og henting av prosjektvalg lagrer aldri kontakt automatisk. Varsel om at ny kontakt stopper gamle portal-/avtalelenker er beholdt.

## Kontroll av hele PR-en mot main

`bolig-core-boundary-check.mjs` sammenligner faktisk checkout med main. Uventede filer utenfor Bolig og de eksplisitt gjennomgåtte integrasjonene feiler. Ingen eksisterende migrasjon eller critical-check kan endres. Den generelle Demo-scope-guarden er beholdt uendret og erstattes ikke av denne kontrollen. Kontrollene gjelder PR-er med Bolig-funksjonsendringer og hopper over andre framtidige modul-PR-er. En tillatt fil er fortsatt gjenstand for kodegjennomgang; dette er ikke en garanti for enhver mulig kjøring.

| Integrasjon | Kontrollert avgrensning |
| --- | --- |
| main.jsx og prosjektfaner | Tilgangsgatet Bolig-fane, lazy modul og eksisterende prosjektåpner. Ingen endring i ordinære lagre-/autosave-/recovery-handlere. |
| WorkspaceViewMode og CSS | Tidligere uttrykkelig bestilt felles fullskjermknapp. Dette er en tilsiktet presentasjonsendring utenfor Bolig, ikke en påstand om null endrede UI-elementer. Samme editor-DOM og kladd, ingen lagre-/navigasjonskall. |
| Systemadmin/Firma | Bolig-lisens/-medlemspanel lagt til. Eksisterende administrasjonsfunksjoner er beholdt. |
| KshmsProgressBoard | To valgfrie Bolig-adaptere. Standard er fortsatt dato+klokkeslett, bemanning, egen drawer og eksport. Direkte Chromium-sammenligning av faktisk main-kilde og branchens komponent. |
| supplier-order-email | Kun export av eksisterende logohelper. Hele den eksisterende filen må ellers være byte-identisk med main. Vanlig e-post og avsender sammenlignes for24 firmaprofil-/logo-varianter. |
| vite.config / bolig-kunde.html | Én ekstra inngang for Bolig-mottaker. Eksisterende app og sales-preview beholdt. |
| supabase/config.toml | Bare nye Bolig-funksjoner. Eksisterende funksjonsoppsett uendret. Ingen ny backend-endring i denne pakken. |
| SQL og private filer | Alle56 featuremigrasjoner er nye Bolig-migrasjoner; ingen gammel migrasjon endret. Egne private tabeller og bucketavgrensede policies. Eksisterende offentlig prosjektdata leses for kobling, ikke overtatt av Bolig. |
| CI / fixture / dokumentasjon | Eksisterende critical-assertions beholdt. Nye Bolig-scenarioer og direkte main-sammenligning lagt til. Header-fixture bruker faktisk avtalt felles knapp. |

Kode i Sales (bortsett fra README), Timer, HR, tilgangskjerne, bootstrap, global style.css, Badskisse, ordinær sjekkliste og ordinær ProjectProgressPlanner er identisk med main. Navigasjons-/administrasjonsintegrasjonene over beskrives eksplisitt; det hevdes ikke at ingen fellesfil er endret.

## To avgrensninger funnet og rettet

1. Den tomme logo-fallbacken fra UE-mailpakken endret også ordinær leverandørmail. Fallbacken er flyttet til `brandedInvitationMail` og vanlig leverandørmail er tilbake til main sin oppførsel. UE-/beboerinvitasjoner har samme bilde som før rettingen. Eksisterende deployet Bolig-Edge har tilsvarende rendret resultat; ingen ny transport, providerinnstilling eller utsending nødvendig.
2. Tidslinjeadapterens eksportbetingelse gjaldt også standardvisningen uten onExport. Den gjelder nå bare Boligs dato-visning. Standardvisningen beholder main sin eksportmeny. Dette scenarioet beholdes permanent i sammenligningstesten, selv om dagens ordinære kallere alle sender onExport.

## Lokal verifisering

- Foundation faktisk React PASS: alle tidligere scenarioer pluss foldet prosjektkobling uten automatisk lagring/endret kladd, fersk visning av eksisterende kobling utenfor hentet liste og normal ordinær prosjektåpning. Serverkonflikt, reader/revokering, dvale og selskapsskifte beholdt.
- Ny core-boundary PASS:51 assertions, inkludert48 direkte e-post-/avsendersammenligninger med faktisk main.
- Ny shared-board Chromium PASS:13 sammenligninger. Tolv faktiske før/etter-reiser ved390/1366px: manager/reader/saving/loading/dirty/manglende eksportcallback. Dag/uke/måned, bemanning, drawer, usendt navn og klokkeslett etter visibility/focus, angre, lagre, tastaturflytting, eksport, lukking og gjenåpning. Visning, kontrollverdier/-sperrer, plandata og callbacks sammenlignes. Én assertion beskytter fravær av nettleserunntak.
- Ordinær mobilheader Chromium PASS:91 assertions ved320/390/1363px, eksisterende lagre-/kopier-/PDF-/navigasjonscallbacks, sjekklistekladd og fullskjermretur etter rulling.
- Ordinær Sales editor Chromium PASS:196 kontroller ved1363/768/390/320px, faktiske tilbuds-/befaringseditorer, kladd/media og callbacks.
- KS/HMS+HR+Min side navigation React PASS: forsinket tilgang, dvale/offline, uttrykkelig navigasjon/lukking og scoped gjenoppretting.
- Bolig masseplan/tidslinje Chromium30, UE86, UE-mailhandler56 og beboermailhandler60 PASS. Ingen ekte mail.
- Full critical Sandbox-build og scope/docs/diff PASS. Eksisterende store-chunk-advarsel ved build er fortsatt bare en advarsel.

Første nye testkjøringer avdekket fixtureoppsett (CSS-filnavn, UTF8 og for bred label-selector) og den faktiske no-export-forskjellen. Oppsett er rettet uten å fjerne krav. Et lokalt Sales-forsøk manglet CHROMIUM_PATH; ny kjøring med eksisterende Chromium gav196 PASS uten appendring. En kontaktkoblingstest ble flyttet til en eksplisitt fersk testvisning: eksisterende usendt kladd skal ikke forkastes av en serverrefresh. Ingen produksjonsdata er brukt eller skrevet i disse automatiserte prøvene.

## Brukerprøve og neste arbeid

I samme faste Preview: åpne en bolig → **Leilighetsinformasjon**. Se **Lagre endringer** og den foldede valgfrie koblingen. Åpne koblingen: forklaringen skal omtale et ekstra prosjekt for leiligheten. Lukk den og kontroller at kontaktfeltene fortsatt står der. Normal lagring skal vise **Endringene er lagret.**

Kenneth har selv meldt at e-postforhåndsvisningene ser bra ut. Ingen Bolig TEST OK eller mergebestilling er gitt. Innlogget etterprøve av ny publisert tekst/fast alias, eksakt ny CI/READY og fysisk Safari/mobil må skilles fra de lokale Chromium-prøvene. Egen fasade/plantegning er fortsatt neste funksjonskandidat; bemanning er senere-ønsket. Denne pakken prioriterer den rapporterte teksten og produksjonsavgrensningen samlet, uten ny bilde-/databasemodell på veien.
