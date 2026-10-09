# Organisasjonskart O1 – avklart scope

Miljømål BEGGE. Bare feature/Preview og Sandbox ppvircenkjizeiqdxphj; ingen Production/main/demo eller e-postsending.

Kenneth plasserer organisasjonskartet under KS/HMS. Det må fungere uten HR-avtale og støtte valgfritt antall avdelinger og underavdelinger, mellomledere, ansatte og lærlinger. Alle aktive interne brukere med KS/HMS-tilgang kan se navn og stillinger. Firmaadmin redigerer hele kartet, registrerte avdelingsledere sin gren. Kartroller gir aldri automatisk HR-innsyn. PDF lastes ned for manuell deling, uten private kontaktdata, HR-tekster eller automatisk utsending/tilbudsinnsetting.

Første scope: ny nøytral src/modules/organization-komponent, modell og PDF; avgrenset KS-navigasjon/skjerm og eksisterende KS-hjelp; én ny migrasjon for private organisasjonstabeller og ferske firma-/bruker-/KS-gatede RPC-er. Ingen endring av HR-registerets brukerflate, innholdsporter, fil-/slettelager, eksisterende HR-funksjonskropper, globale menyer/main.jsx eller øvrige appmoduler. Status/PLAN/QA/USER_TEST oppdateres.

Nærmeste leder deles med HR bare for allerede HR-registrerte medarbeidere. Firmaadmin må uttrykkelig bekrefte faktisk HR-tilgangsendring; avdelingsleder kan ikke tildele seg HR-rettigheter. Eksisterende HR-lederbytte skal oppdatere kartets revisjon, og fratredelse fjerner kartplassering og delegering. KS-only medarbeidere hentes fra aktive interne firmamedlemmer, uten krav om HR-register. Ingen sensitiv samtale/fraværstekst eller juridisk frist implementeres.

Sikkerhetsprøver før publisering: KS-only firma, firma-/aktørbytte, modulavslag/revoke/fratredelse, vanlig medarbeider/KS-ansvarlig/systemadmin uten implicit redigering, egen gren kontra andre grener, tom sletting, avdelings-/lederløkker og dybde, stale revisjon og to skrivere, eksplisitt HR-lederbekreftelse/tilbakekalling, private tabeller/ACL/RLS, sent svar og fersk eksportkontroll. Faktisk React-flyt og visuelt kontrollert PDF med lange navn, underavdelinger og lærlinger. Skynett-test omtales bare når faktisk utført.

Permanent navigasjonstest endres legitimt fra 11 til 12 KS-valg ved tillegg av organization; alle tidligere ID-er/grupper og personlig håndbok beholdes. Hjelp får ett nytt underkapittel i eksisterende KS/HMS-punkt, håndbok fortsatt først. Ingen sikkerhetsvern fjernes.

Remote før endring: feature fba8d412ca7e2cde7844a32e50c1496eaa4f37ef / tree d298f19bec0a8d10cb9fc5d60cf0eb045b935485; main 155f6c4ac01f126c1db0c65da385cfd9305587d5. Draft PR #216. Lokal historikk avviker, tree er identisk. Publisering bruker faktisk remote parent og forventet-head lease.

Tillegg før testjustering: critical-hr-purge-check teller eksisterende KS-hjelpekapitler. O1 øker dette eksplisitte tallet fra 11 til 12. Vernet for én KS-/HR-familie og full bevaring av hvert gammelt kapitels innhold beholdes; ekstra assert bekrefter det nye organisasjonskapitlet.

Berørt H3-prøve fant at den nye HR-triggerens løkkekontroll også endret HR-only firmaer uten organisasjonskart. Konkret scopefeil: ny korrigerende migrasjon begrenser valideringen til firmaer som faktisk har bygget et kart. Eksisterende HR-funksjoner/prøver beholdes. Ingen aktiv Sandbox-fixture endret; feilet QA-transaksjon ble rullet tilbake.

## Utviklerbevis før kodepublisering

- **63 faktiske rollback Sandbox SQL assertions PASS**: KS-only firma og aktive firmabrukere, modul-/firma-/aktøravslag, vanlig ansatt/KS-ansvarlig/systemadmin uten automatisk redigering, avdelingsleder/egen gren, innhenting av utenforliggende medarbeider avvist, flytting/sletting, 12-nivå inkl. høyden på flyttet undertre, lederløkker, metadatafeltwhitelist/størrelse, HR-revisjon/CAS, booleanbekreftelse, gammelleders ordinære/ekstra innsyn fjernet, ny leder, direkte HR-lederbytte og fratredelse. Alle egne fixtures rullet tilbake.
- Faktisk PostgreSQL/PGlite-migrasjon og samme **63 assertions PASS**, eksplisitt syntetisk plattformadapter. Dette er ikke en cloud-restore eller separate browserkontoer.
- Berørte eksisterende HR H1 **75** og H3 **61** faktiske Sandbox assertions PASS. H3 fant først en konkret scope-regresjon; korrigerende migrasjon ble laget og prøven gikk deretter grønt uten svekkelse av testen.
- Faktisk React PASS: nye avdelinger/underavdelinger og readback, lærling, bekreftet HR-lederbytte, avdelingsleder og skrivebeskyttet medarbeider, revoke/fokus/sene svar/tomtilstand. Faktisk KS-komponent beholder bare kartets navigasjonsvalg ved rettighets-remount; bevisst navigasjon vinner. Ingen payload/autorisasjon i denne navigasjonsmarkøren. Berørt eksisterende HR/Hjelp/KS-meny React PASS, 12 KS-kapitler og 1 HR-kapittel, håndbok fortsatt først.
- Faktisk jsPDF 2.5.1: **48 syntetiske medarbeidere, fire avdelinger inkl. underavdeling, tre A3 liggende sider**. Første side er strukturtegning, deretter stillinger/medarbeidere. Lange navn/stillinger og lærlinger kontrollert. Alle tre sider rendret og visuelt kontrollert; alle 48 navn og fullt langt stillingsnavn tekstkontrollert. Privat fixturefelt er ikke eksportert. [Eksakt syntetisk prøve-PDF](evidence/organization/synthetic-48-people.pdf). Dette er et syntetisk PDF-bevis, ikke faktiske personalopplysninger.
- Eksportens faktiske motorprøve avviser endret revisjon, revoke etter PDF-bygging, arbeidsflatebytte og utilgjengelig motor. Fersk serverlesing før og etter bygging; endret navn/struktur/leder/rolle stopper nedlasting. Ingen source-URL, private kontaktfelt, referat, sykefravær eller automatisk e-post.
- **8 live funksjoner byteidentiske** med opprinnelig + korrigerende migrasjon; tomt search_path. Private hjelpere owner-only, offentlige RPC-er authenticated-only med fersk KS-/aktivt firma-/medlemskontroll. Tre private tabeller har RLS og ingen direkte public/anon/authenticated/service_role-rett.
- Faktiske Sandbox-migrasjoner **20261009232550 / 20261009232929**, CLI-filer **20261009230526 / 20261009232920**. Ingen Production-migrasjon.
- Advisors: bare forventet RLS-uten-policy INFO for de tre private tabellene og authenticated-definer WARN for de to gatede RPC-ene. [RLS-lint](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) / [RPC-lint](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Ingen org-funn for anon/search_path/indekser; øvrige tidligere prosjektfunn utenfor scope. Definer er nødvendig for private tabeller og er uttrykkelig avgrenset/testet.
- Lesende faktisk Sandbox etter rollback: **1 HR-firma/medarbeider, 0 artefakter/filer/receipts, 0 org-avdelinger/plasseringer og 0 O1-prøvefirmaer**; content=false/restore_quarantined=true. Eksisterende brukerdata beholdt. KS-mail ikke aktivert.

Første versjon bruker nedtrekksfelt for avdelingsflytting og plassering, ikke dra-og-slipp. Maks. 100 avdelinger/12 nivåer/500 aktive interne brukere i denne versjonen; overskridelse gir tydelig stopp, aldri stille avkorting. Ingen 100-firma-lasttest påstås. Org-PDF er en egen eksplisitt eksport; ingen automatisk innsetting i tilbud eller generelt KS-uttrekk.

Privat HR-kontakt/samtale/sykefravær er fortsatt stengt. H5a sin eksterne driftsbinding/ack og isolerte Supabase restore gjenstår som separate konkrete bevis. Ingen gjentatt B/C- eller Kenneth-testkø.

## Kort ny brukerprøve

1. Åpne **KS/HMS → Organisasjonskart → Legg til første avdeling**. Navngi avdelingen og trykk **Lagre avdeling**. Opprett underavdeling med **Plasser under**.
2. Åpne **medarbeidere venter på plassering**, velg person, fyll **Stilling**, velg **Rolle i kartet** og **Avdeling**. **Lagre plassering**. Velg Lærling for egen markering. **Vis medarbeidere** åpner kortene.
3. **Last ned PDF**. Hele firmaets organisasjon følger med, også lukkede/filtrerte avdelinger. Kontroller mottaker før manuell videresending.

Innlogget Skynett-kontroll skjer på publisert kode etter eksakt SHA/READY/Sandbox-kontroll; ingen ny browser-PASS påstås i dette avsnittet ennå.
