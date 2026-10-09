# Min side, tekstforslag og privat kontaktprofil – 9. oktober 2026

## Avklart scope

Miljømål **BEGGE**, levering bare feature/Preview og Supabase Sandbox `ppvircenkjizeiqdxphj`. Faktisk remote baseline **9bda37d35772ebf70c9a385305d703d4cca07535**, tree **88f14e78b2b4b021b0d951c05bf88a6892fbf634**; faktisk main **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Lokal baseline har annet commit-ID men identisk tree; ingen blind push.

Kenneths svar: Min side vises når firmaet har **KS/HMS eller HR**. Innhold følger fortsatt brukerens personlige modultilgang. Hovedvalget **HR** er for firmaadmin og registrerte nærmeste ledere. Andre ansatte og uttrykkelige lesere bruker **Min side → Mine oppfølginger**. KS/HMS beholder medarbeiderens daglige operative arbeidsflate (Avvik, SJA m.m.).

Nytt scope: Min side-komponenter, profilinnbinding i main, globalt profilnavn/HR-gate, personlig håndbokvisning, avgrensede HR-lister, HR-oppsettets tekst-/datoforslag, private kontakt-RPC-er, relevante critical/React/SQL-prøver og disse statusfilene. Ingen Sales-/autosave-/bootstrap-, prosjektmeny-, e-posttransport-, andre moduler eller Production-endringer. Eksisterende konto-/rapportidentitet og e-postsamtykke beholdes. Ingen juridiske sykefraværsfrister innføres.

## Produkt og privat kontaktkontrakt

- Tre kompakte oversiktskort, fire interne visningsvalg og sammenleggbare detaljer. Personalhåndboka bruker eksisterende lesing/bekreftelser uten forvaltningsknapper. Samtale og sykefravær merkes **Kommer**; ingen falsk editor eller fullføring.
- **Profil og e-post**: fullt navn og mobil redigeres med eksisterende egen Auth-kontoprofil. E-post er kontoens verifiserte adresse, kun lesbar her. Rapportfelter og faktiske eksisterende e-postvalg ligger i en sammenleggbar del. Deres komponent forblir montert ved visningsbytte og midlertidig rettighetsoppfriskning; ulagret e-postvalg og kontakttekst bevares.
- **Adresse og nærmeste pårørende**: forberedt privat HR-innhold med adresse/postnummer/poststed, navn/relasjon/telefon/e-post til én kontaktperson. Ingen fødselsnummer, diagnose eller fritekst-/medisinske vedlegg. Kenneth presiserer innsyn for leder, firmaadmin og eventuelt uttrykkelig leser ved en ulykke. Det følger eksisterende `can_read`: egen medarbeider + registrert nærmeste leder + firmaadmin + eksplisitt tildelt aktiv leser i samme firma. Bare medarbeideren redigerer egen kontaktprofil. KS/HMS-/systemadmin-rollen gir ingen individuell rett.
- Private kontaktverdier bruker **eksisterende `hr_private.artifacts`** med `contact_profile`-type og kontrollfrist; de legges aldri i Auth/JWT-metadata, firmaets adressefelter, public profiles, prosjekt-/KS-uttrekk eller lokal/offline-cache. Endring erstatter tidligere kontaktverdier i én transaksjon. Firma-/medarbeider-/kontaktrevisjon kontrolleres; lederbytte/tilbakekalling/fratredelse kontrolleres ferskt. Eksisterende innholdspurge/arbeidsavslutning sletter også kontaktartefakten. Den omfattes dermed av H3/H4 restore-/slettemanifest.
- **Privat kontaktlagring er fortsatt stengt**, akkurat som annet HR-innhold: både lesing og skriving bruker eksisterende runtime-port/restore-karantene. UI samler ingen adresse/pårørende før åpning og forklarer dette i den sammenleggbare delen. Varig ekstern driftsbinding/ack og full isolert Supabase-cloud database-/Storage-restore fra H4 gjenstår før åpning. Dette er ikke en påstand om at pårørende allerede er tilgjengelig ved en faktisk ulykke.
- HR-oppsett får to valgfrie tekstforslag og kontrollfrist **Om 3 måneder / Om 6 måneder**. Egne tekster erstattes bare ved uttrykkelig valg. Behandlingsgrunnlag er en **skrivemal med firmaets egen vurdering**, ingen automatisk juridisk godkjenning; uutfylte klammer stopper UI-lagring. Kontrollfristvalgene er firmaets egne revisjonsdatoer, ingen nye lovfrister. På desktop står tekstfeltene ved siden av hverandre; mobil bruker én kolonne.

## Utviklerbevis

**59 faktiske Sandbox SQL-assertions PASS** (`scripts/hr-personal-page-sandbox-check.sql`), syntetiske identiteter og gateendringer er isolert i transaksjon og rullet tilbake. Dekker firmalisens kontra brukerrett, egen/leder/admin/uttrykkelig leserliste, system-/KS-/annet firma-avslag, lukket kontaktport uten payload, egen skriving, andre autoriserte rollers lesing/ingen skriving, kontakt- og medarbeider-CAS, feltwhitelist/størrelse/null, rydding av gamle verdier, lederbytte, tilbakekalling og fysisk kontaktsletting uten å slette annen medarbeider. Åpen gate i prøven var bare transaksjonslokal; ingen aktive Sandbox-personer endret.

**Faktisk React/DOM PASS** (`personal-page-react-check.mjs`): tre kort/to kommende HR-rader, egen kontaktlagring/fersk feil-aktør-avvisning, bevart kontakt-/e-postkladd ved visningsbytte/rettighetsrefresh, privat lukket port, privat kontakt-CAS/revokering/sent svar etter unmount, kontaktkladd bevart ved uendret foreground-kontroll og uttrykkelig forslagsbruk. Transport er syntetisk, håndbokinnholdet er stubbet i denne isolerte prøven; dette er ikke nytt innlogget håndbok-/konto-/pårørendeskrivebevis.

**Berørt faktisk eksisterende HR/Hjelp/meny-React PASS** (`hr-register-react-check.mjs`), med kun ny lukket-kontakt-RPC i syntetisk adapter: oppsett, paging, opprettelse, leder/leser/revoke, revisjon, fokus/unmount, avslutning og ærlig pending/complete-slettestatus. Eksisterende øvrige kapitler består.

Permanent ny `critical-personal-page-check.mjs` er del av fullcritical. Nye og eksisterende full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**. Profilidentitet, prosjekt-/globalmeny, e-postvalg og beskyttede arbeidsflyter omfattes av eksisterende full QA. Ingen B/C-/PDF-/ZIP-omtest.

CLI-migrasjon **20261009212615_personal_page_context.sql**; faktisk Sandbox-versjon **20261009214042**. Alle **5 funksjonskropper byteidentiske**, SECURITY DEFINER bare for avgrenset privat oppslag, empty search_path, authenticated-only EXECUTE, anon/service avvist. Advisor: eksisterende deny-by-default RLS uten policies er tilsiktet for privat schema; authenticated-definer-varsler gjelder bevisst callable RPC-er med fersk scope-/relasjonskontroll. Ingen ny offentlig tabell/policy/Storage-rett. [Supabase advisor-veiledning](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Lesende etterkontroll: **1 eksisterende HR-firma / 1 medarbeider**, **0 artefakter/filer/receipts/jobs/HR-Storage/QA-firmaer**, **content_enabled=false / restore_quarantined=true**. Ingen privat innholdsport åpnet, firmaavtale eller levende bruker endret. KS-e-posttransport forblir avslått, én autorisert testmail er ikke sendt.

## Publisering og konkret prøve

Eksakt feature-SHA, Core Safety/fullcritical, READY Preview og Sandbox-binding føres i draft PR #216; nettleserbevis legges til etter publisering. Ingen ny browser-PASS påstås før dette. Fast adresse: [Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe).

Kort ny produktprøve: **Meny → Min side → Profil og e-post**, kontroller kontaktfelter og sammenleggbar **Rapportopplysninger og e-postvalg**. **HR → Oppsett og kontrollfrist**, åpne **Tekstforslag: formål / behandlingsgrunnlag** og kontroller **Om 3 måneder / Om 6 måneder**. Ikke lagre et juridisk grunnlag du ikke har vurdert. Tidligere Kenneth TEST OK, spesielt 9. oktober SJA-PDF/samlet PDF/ZIP/bilder/manifest/kvalitet/HMS/SJA-bilder, beholdes uten ny obligatorisk omtest.

## Oppstartsrettelse funnet i faktisk Preview

Første innloggede reload av kode `5c105deba84f53f1780a95cb135ad83a3d6673bc` avdekket `Cannot read properties of null (reading company_id)` under auth-hydrering: null kontekst og manglende aktør ble sammenlignet som to undefined-verdier. Rettet med eksplisitt krav om både kontekst og aktør før firmalesing. Permanent kritisk prøve dekker null/undefined/tom aktør, og faktisk React-prøve monterer tom innloggingsstatus før ekte kontekst. Ingen browser-PASS på den første utgaven; ny kode/CI/Preview og faktisk ny reload må verifiseres.
