# Valgt samlet KS/HMS-uttrekk – scope og QA

Miljømål BEGGE; denne leveransen går bare til feature/Sandbox på `feat-kshms-foundation`, draft PR #216. Baseline `9ac259fa8027a3d88e57c5ab761d71fbeaef5cb7`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Bevar tidligere TEST OK. Ingen Production-release, main/demo-merge, databaseendring eller ekte e-postsending. KS/HMS-utsending forblir deaktivert.

## Leveransen

Ny managerflate **KS/HMS → Dokumentuttrekk** bruker eksisterende serverstyrte read-RPC-er. Firmaadmin/KS/HMS-ansvarlig beskriver omfang, henter katalog, velger 1–50 dokumenter og bekrefter før lokal PDF-nedlasting. Ingen standardvalg, lagring, signering, fullføring, portalpublisering eller e-posthandling.

| Gruppe | Innhold |
|---|---|
| Rutineutgaver | Godkjent fast tekst, kilder, publiseringsidentitet, nummer/hash; historisk/utgått status |
| Sjekklistemaler | Publisert fast utgave; tydelig tom mal, ikke utført kontroll |
| Håndbokrevisjoner | Lagret signatur/bruker-ID, funn, oppfølging, neste dato og kontrollerte versjonsreferanser |
| SJA | Full lagret analyse, medvirkning, rutineutgaver og bevart signatur/utkaststatus |
| RUH | Full paginert hendelseshistorikk, lagrede identiteter/lukking, private bilder og vedleggsoversikt |
| Vernerunder/kontroller | Lagrede punkter, tiltak, bilder og fullføring/utkaststatus |
| Risiko 5×5 | Lagret vurdering, matrise, tiltak, forventet effekt og fullføring/utkaststatus |
| Prosjektkontroller | Valgt prosjekts lagrede svar, kommentarer, bilder, utgave og fullføring |

PDF har omfang/firma/tid/uttrekks-ID, én ny side per valgt dokument og manifest med dokument-ID, hash eller lagret revisjon, status, prosjekt-ID og sideintervall. Eksisterende felles rammer/gjennomføringsrenderere gjenbrukes. Historisk revisjon uten lagret navn viser bruker-ID, uten å erstatte den med dagens kontonavn. Refererte rutinetekster tas med bare ved separat valg, bortsett fra dokumentenes egne allerede lagrede rutinesnapshots.

## Vern og begrensninger

Tilgang/firma/bruker sjekkes ved katalog og før/sist i eksport. Alle valgte snapshots leses på nytt etter bilde-/PDF-venting. Endret utgave, revisjon, historikk, filer eller tilgang stopper hele uttrekket. Sent firma-/brukerbytte, avmontering og dobbelklikk kan ikke lagre fil. RUH-bilder hentes med innlogget Storage download; metadata/type/størrelse kontrolleres. Utilgjengelig dokumentbilde stopper uttrekket; manglende logo gir tydelig beskjed og firmanavn.

Dette er et avgrenset klientuttrekk med kontrollert dobbel lesing, ikke et lagret atomisk serverarkiv eller en tilsynsgodkjenning. RUH/kontroll/risiko kan hente flere sider. SJA viser de første 100 treffene med total og søk; prosjektlisten viser inntil 200 tilgjengelige prosjekter med total. Maksimalt 50 valgte dokumenter per PDF. Firmaets godkjente/historiske rutine- og malutgaver kan velges; upubliserte kladder inngår ikke.

Separate dokumentoriginaler er listet, ikke pakket/vedlagt. Full avviksdekning utenfor RUH, annen vedleggsdekning, versjonerte underskjema, frist-/utløpspåminnelser og kildeoppdatering er senere B/C-punkter. HR, fortrolige varslinger, ansattes lesebekreftelser og opplæringsbevis inngår ikke. Gjeldende HR-beslutninger ligger uendret i HR_SCOPE_20261008.md.

## Utviklerbevis

- Permanent `critical-kshms-inspection-extract-check.mjs`, integrert i uendret kritisk buildkjede: PASS for åtte typer, to lesepass, uttømmende 55-hendelsers RUH, manifest og feilhåndtering/tilgang/avbrudd uten delvis fil eller mutasjon.
- `kshms-inspection-extract-react-check.mjs`: PASS, ekte React/privat Storage/jsPDF og PDF-tekstekstraksjon; 15 sider med åtte grupper, 14 uten rutine. Langtekstslutt, signaturer, bilder, matrise, originalfilnavn og alle ID-er med; ingen ansatt-/utkast-/tokenlenkelekkasje. Visuell kontaktarkkontroll: rammer, fortsettelsesbokser og manifest uten klipping.
- Eksisterende egen RUH React/PDF samt fem rutine-/mal-/prosjektkontroll-PDF-er: PASS etter refaktor av felles RUH-leser og ny intern KS/HMS-fane.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build`: PASS exit 0 med eksisterende critical-kjede. React-gjennomgang: managerrolle, navngitte felt/knapper, sammenfoldede grupper, parallell kataloglesing, senere PDF-import og kontekstvern. Eksisterende chunk-/modultypeadvarsler består. Publisert CI/READY og én innlogget skynettleserfane med konkret nedlastet app-PDF føres i CONTINUITY ved sluttkontroll; nettleser-PASS er ikke forhåndsregistrert.

Brukerens nye TEST OK for samlet uttrekk, innlogget privat RUH-bilde, mobil og flere ekte brukere gjenstår. Tidligere TEST OK gjelder fortsatt sine leveranser.
