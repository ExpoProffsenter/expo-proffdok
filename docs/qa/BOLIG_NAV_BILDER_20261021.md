# Navigasjon, boligbilder og UX-gjennomgang – 21. oktober 2026

Miljømål BEGGE; bare feature-Preview/Sandbox nå. Fortsetter samme branch/PR #278 fra aba6772000df4d4e8e18d88a194971095f0113e0. Main 0730eeb4 / demo 1312f406 er ikke synkronisert eller merget i denne runden.

## Brukerens tilbakemelding og endringsscope

Skjermbildet viste appens «Startside» og modulens «Til appens startside» samtidig. «Alle prosjekter» fantes allerede, men var ikke tydelig som modulens forside. Bruker fant heller ikke hvor innhold legges på rommet og etterspurte bedre pakke-/tilvalgsflyt og status mot ønskelisten. Neste beskjed ba om samme bildekvalitet for de andre boligtypene som for blokken.

BoligEntry, BoligBuildingArt, bolig-CSS, BoligRooms-tekst, BoligHelp og eksisterende bolig-QA er eneste kodeendringer. Fire nye WebP-eksempler. Ingen main/meny/auth/recovery, Supabase/schema/RLS, katalogkommandoer, priser/valg/ordre, øvrige moduler eller utsending er endret.

## Levert i denne runden

- Appens globale Startside er beholdt. Den doble appreturen inne i modulen er erstattet av én mørk «Prosjektoversikt» øverst til høyre når et prosjekt er åpent. Den går til firmaets prosjektkort og «Bygg nytt prosjekt», med samme eksisterende skjermvalg/kladdbevaring. Den gamle, ekstra «Alle prosjekter» i prosjektlinjen er fjernet. Hjelp bruker samme knappnavn.
- Forsiden og arbeidsflaten forblir montert. Samme editor/tekst/arbeidssted gjenopptas gjennom Sist åpnet. Tidligere motvern mot sene svar/focus-navigasjon er beholdt. Ingen ny prosjektlesing ved hjem/retur.
- Romteksten sier konkret at rommene ennå ikke har eget vareinnhold. Grunnpakke og tilvalg velges under Boligvalg for hele boligen. En romvelger er ikke en implementert rombasert vare-/sjekklisteflyt.
- Enebolig, tomannsbolig, flerfamiliehus og boligfelt har nye fotorealistiske eksempelbilder. De brukes i boligtypevalg, byggkort/-velger, prosjektforside og husoversikt. Eksisterende blokkfasade er beholdt. Husoversikten viser bildet proporsjonalt; kort bruker et kontrollert utsnitt uten å strekke bildet. Lazy loading, faste bildeproporsjoner og WebP begrenser overføring/layoutskift.
- Bildene er dekorative eksempler. Faktisk antall boliger, ID-er og klikkfelt kommer fortsatt fra serverstrukturen; et fotovindu brukes aldri som en bolig. Opplasting av egne bilder eller plantegninger er ikke bygget gjennom disse eksemplene.

## UX-vurdering og neste avgrensning

Grunnpakke/tilvalg har riktig grunnfunksjon: katalogoppslag med varebilder/varenummer/antall, grunnpakke uten pliktig sum, alternativ eller tillegg, eksplisitt fratrekk, lagrede versjoner og selvstendig bestillingsutvalg. Arbeidsflyten er likevel ikke ferdig: ny-knapper ligger i et sammenleggbart bibliotek, redigering er et langt skjema i siden, direkte rominnhold mangler og brukeren må selv forstå veien fra prosjektoppsett til boligvalg.

Anbefalt neste etappe:

1. Tydelige innganger for Ny grunnpakke og Nytt tilvalg; korte popuper, varebilder og en samlet forhåndsvisning av pakkeinnholdet.
2. Tilvalg som tar utgangspunkt i standardvaren og viser alternativ/tillegg, eventuell grunnsum og faktisk mellomlegg før lagring.
3. Koble og fordele innhold til valgte boliger/rom med forhåndsvisning. Eldre boligomfattende valg beholdes som egne versjoner; ingen stille flytting til rom eller overskriving av individuelle avvik/utfylte sjekklister.

Dette er neste produktarbeid, ikke ferdig funksjon i denne UI-rettelsen. Hele ønskelisten i overleveringen og BOLIG_VIDERE_PLAN_20261021.md følger videre: rominnhold/sjekklister/rommal, egne bilder/tegninger/Excel-import, redigering av eksisterende bygg og søkbart arkiv, beboervalg/aksept/frister, priser/indeks, faktisk bestilling/levering/Cordel, samlet fremdrift/opplegg/arbeidslag, beboervarsler/booking, eksterne rolleflater, privat kontrakt-PDF/analyse samt modulprising/livsløp/eksport.

## QA

- Foundation faktisk React PASS. Bevarer alle tidligere assertions. Selector følger det bestilte navnet Prosjektoversikt. Nye assertions beskytter én entydig modulretur og fravær av den doble appreturen. Eksisterende hjem/retur med samme usendte editor, focus/visibility, firma-/rolletap, forsinkede tilgangssvar, konflikter og fullskjerm er beholdt.
- Builder faktisk Chromium: 101 assertions PASS, alle tidligere 99 beholdt. Nye kontroller krever fem lastede, forskjellige typebilder og proporsjonal bildevisning. Native image decode avventes før visuell QA. 320/390/1024/1366 px, 400/480/500 boliger, veiviserkladd og sidebytte er fortsatt dekket.
- Rom faktisk Chromium: 51 assertions PASS. Eksisterende katalog- og overview-React PASS. Full critical build PASS lokalt; normal chunkstørrelsesadvarsel er ikke en ny runtimefeil.
- Visuell QA av faktisk typevalg med nye bilder. Ingen ny innlogget skynettprøve er hevdet; forrige økt viste innlogging. Endelig CI/deploy på eksakt head dokumenteres i PR #278. Ingen produksjonsmerge uten relevant Preview-prøve og uttrykkelig TEST OK.

Brukerprøve i samme faste Preview:
https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

Åpne et prosjekt → Prosjektoversikt. Firmaets prosjektkort og Bygg nytt prosjekt skal vises. Sist åpnet returnerer til samme arbeidsområde. Bygg nytt prosjekt viser fem typebilder. Prøv også Alle bygg/Bytt bygg og Eneboligen i DEMO – Blandede boligtyper. Rom og oversikt forklarer nå hvor dagens boligomfattende vareinnhold velges.

## Bildekilder, lagrede filer og prompter

Generert med innebygget imagegen, ikke CLI. Ingen ekte prosjekteiendom eller person er fotografert. Originale genererte PNG-er er beholdt; webfilene er proporsjonalt nedskalert til 1024 px bredde og kodet som WebP kvalitet 80.

- public/bolig/enebolig-v2.webp – /workspace/scratch/0428bc8f11ff/generated_images/exec-8485e0a7-5989-4f10-99e5-fac45c6d0d06.png
- public/bolig/tomannsbolig-v2.webp – /workspace/scratch/0428bc8f11ff/generated_images/exec-dcd7919f-ba41-42f4-8743-a9ccd63d72fa.png
- public/bolig/flerfamiliehus-v2.webp – /workspace/scratch/0428bc8f11ff/generated_images/exec-08628724-4b5e-4888-b90f-b59edc3d5d5b.png
- public/bolig/boligfelt-v2.webp – /workspace/scratch/0428bc8f11ff/generated_images/exec-91626391-7747-4fdf-b885-f27fde88db32.png

Felles prompt før motivet:
Use case: photorealistic-natural. Asset type: architectural illustration for a Norwegian professional construction app's housing type cards and building overview. Primary request:

Motivprompter:

- Enebolig: A single detached Norwegian family house, two floors, one household and one unmistakable entrance, contemporary Scandinavian architecture, warm off-white render and natural oak cladding, charcoal gabled roof, generous windows, small stone path and restrained lush landscaped garden. The whole house is visible.
- Tomannsbolig: A Norwegian semi-detached duplex: exactly two attached family homes forming a single coherent two-storey building, two clearly separate mirrored front doors, two modest terraces, contemporary Scandinavian architecture, off-white render with natural oak details and charcoal gabled roofs. Both homes are equally visible, with a restrained landscaped garden.
- Flerfamiliehus: A small Norwegian four-apartment multifamily house: compact two-storey residential building with four distinct dwellings, four generous window groups, two modest upper balconies, coherent shared entrance, contemporary Scandinavian architecture, warm off-white render, natural oak detailing and charcoal roof, restrained landscaped garden. Clearly smaller and more domestic than a large apartment block.
- Boligfelt: A tasteful Norwegian residential development with several detached and semi-detached family houses along a short landscaped pedestrian lane, a coherent contemporary Scandinavian residential neighborhood, warm off-white render, natural oak detailing, charcoal roofs, small private gardens. Gentle elevated three-quarter overview, a few complete houses clearly distinguishable, not a cityscape.

Felles prompt etter motivet:
Style: premium photorealistic architectural visualization, believable materials with fine texture and realistic reflections, calm natural early summer daylight, soft blue sky, slight warm sun, elegant quiet atmosphere, crisp architectural proportions. Landscape 3:2 composition, building centered and whole roof plus ground visible with generous breathing room. Eye-level frontal view with only a slight three-quarter angle unless an overview is requested. The architecture must be legible at small thumbnail size. This is a decorative example photo, not an exact project plan. No people, cars, labels, diagrams, text, logos, watermarks or UI. Match the photographic quality and material palette of an upscale Scandinavian apartment facade rendering.
