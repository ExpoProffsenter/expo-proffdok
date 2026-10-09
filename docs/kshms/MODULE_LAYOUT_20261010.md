# KS/HMS og HR – samme visuelle retning som Min side, 10. oktober 2026

## Avklart scope før endring

Miljømål **BEGGE**, nå bare feature/Preview/Sandbox ppvircenkjizeiqdxphj. Faktisk remote feature **4e6a6710822b0171100be8459c180199ad4f6566**, tree **80ded9d1f204a41972fb242a0516ce0b3780be44**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5** kontrollert før endring. Lokal historikk forskjellig, tree identisk; publisering på faktisk remote parent med expected-head lease. Draft PR #216.

Kenneth godkjente Min sides visuelle retning og ba om samme stil i KS/HMS og HR. [Varig designbeslutning og senere appvurdering](../architecture/UX_DIRECTION_20261010.md). Godkjenningen er Min side TEST OK, ikke bruker-PASS for de nye modulendringene.

Scope: ModuleHeading/moduleWorkspace.css, KshmsModule/KshmsNavigation/kshms.css, HrModule/hr.css, utvidet faktisk HR-/navigasjons-React og critical-hr-navigation, dette notatet, designbeslutningen og OVERSIKT/CONTINUITY/PLAN/QA/USER_TEST. Ingen main.jsx, globale menyer, tilgangshooks, RPC, SQL, Storage, e-post eller private innholdsporter endres. Ingen ny B/C/PDF/ZIP-omtest; tidligere tester og Kenneths TEST OK beholdes.

## Leveransen

Felles presentasjonskomponent gir statisk petrolfarget hero, eksplisitt hvit h2, firmanavn, ikon og eksisterende rolleetikett. Den tar bare visningsprops; ingen tilgangsavgjørelse. Personlig håndbok/HR inne i Min side beholder kompakt personlig topp og får ingen dobbel hero.

KS/HMS: samme rekkefølge **Daglig arbeid → Mine rutiner → Forvaltning** og samme skjerm-ID-er, rettigheter og lesetall. Tre kompakte kortgrupper, ikon på alle navigasjonsvalg og eksisterende valgt-status. Veiledningsavsnittet kan åpnes under **Slik bruker du KS/HMS**. Ingen skjema, lagring, påminnelse eller eksportlogikk endres.

HR: felles toppfelt, synlig melding om kommende samtale/fravær, åpnbart bruksavsnitt og rolletilpassede snarveier. Firmaadmin får register/oppsett/slettekvitteringer; leder får bare egne medarbeidere. Snarveiene fokuserer og ruller til eksisterende register/detaljer og åpner relevante details uten RPC-skriving. Medarbeiderlisten kommer før oppsettet. Slettekvitteringer har sann tomtilstand også før første avslutning; pending/complete/paging beholdes. Fersk kontroll og private gates uendret.

CSS er avgrenset til KS/HMS/HR og deres felles presentasjon. Mobilregler reduserer kortkolonner; min44px knapper, tekstbryting og synlig fokus. Faktisk mobil/kamera er ikke bevist av responsive kildekode.

## Relevante prøver

**Faktisk hr-register-react-check PASS** med syntetisk transport: hero/tre adminkort, register-snarveiens fokus, oppsett-snarveiens fokus, åpnet og ærlig tom slettekvittering, bare ett lederkort/ingen adminsnarveier, dekorativt ikon på hver eksisterende KS-navigasjonsknapp. Alle tidligere HR/Hjelp/meny/paging/leder/leser/revoke/revisjon/avslutning/pending-complete/fersk fokusretur/sene svar beholdt.

**kshms-source-updates-react-check PASS** på berørt faktisk foreldrekomponent: editor/kildesammenligning/utkast/feltbevaring/godkjenning/lesetildeling; syntetiske undermoduler i denne isolerte prøven. **personal-page-react-check PASS**: Min side/profil/kontakt/forslag/kladd/fokus og freshe gates. Permanent HR-navigation-critical og full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**. git diff --check ren. Ingen live personer, oppsett eller rettigheter endret gjennom disse testene.

## Publisering og faktisk visuell kontroll

Eksakt publisert SHA, Core Safety, READY Preview og Sandbox-binding føres etter publisering. Innlogget browser-PASS påstås først etter faktisk kontroll av denne utgaven. Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Relevant brukerprøve er utformingen under **Meny → KS/HMS** og **Meny → HR**, samt HRs tre snarveier. Ikke gjenta tidligere B/C-prøver uten konkret feil.

Privat HR fortsatt stengt; varig ekstern driftsbinding/ack og full isolert Supabase database-/Storage-restore gjenstår før åpning. Ingen Production, main/demo-merge eller e-postsending.

Første faktisk browservisning fant unødvendig høyde: HR-kort med ikon over tittel og store lukkede details skjøv medarbeiderlisten under skjermen. Konkret rettet til ikon/tittel på én rad, mindre lokal luft og kompakte lukkede sections; ny publisering og faktisk sluttkontroll følger. Ingen PASS påstås for første HR-registerplassering.

Faktisk KS/HMS-kontroll fant i tillegg uheldig linjebryting i to lange navigasjonsnavn ved desktopbredden. Justert lokal knappepadding/gap/skriftvekt for mer tekstplass uten å endre navn, ID-er, rekkefølge eller min44px høyde. Ny faktisk kontroll følger rettingen.
