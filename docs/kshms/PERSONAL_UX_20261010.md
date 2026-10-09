# Min side – utforming og stabil faneretur, 10. oktober 2026

## Avklart scope før endring

Miljømål **BEGGE**, bare feature/Preview og Sandbox ppvircenkjizeiqdxphj. Faktisk remote feature **a1cc7b2004762da6e46d7c53dac90ab732ddd5b0**, tree **6cc7291c76480220ce288467d966f104f6023d68**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5** kontrollert før endring. Lokalt tree identisk, historikken forskjellig. Draft PR #216.

Kenneth rapporterer hopping ved screenshot/fanebytte og ønsker en mindre kjedelig Min side. Begge opplastede bilder er lest: egen demo-oppføring, merket Din medarbeidertilgang, ingen uvedkommende medarbeider synlig. Min side beholder egen oppføring og uttrykkelig delt lesetilgang; lederens team/firmaets register ligger under HR. SQL-kontrakten endres ikke.

Scope: PersonalPage/personal.css, HrModule/hr.css, avgrensede personal-critical og faktiske personal-/HR-React-prøver, dette notatet og prosjektets OVERSIKT/CONTINUITY/PLAN/QA/USER_TEST. Ingen main.jsx, global-/prosjektmeny, tilgangshooks, backend/migrasjon, database, e-post eller innholdsåpning endres.

## Rotårsak og ny kontrakt

Tilgangshooks nullstiller kontekster ved fokus/bakgrunn for fersk kontroll. PersonalPage tolket dette som profilfallback og åpnet rapportdetaljene. HR ble avmontert; registerdetaljen forsvant. Dette gav et synlig profilsprang før den valgte fanen kom tilbake.

Ny kontrakt: bare ikke-sensitive navigasjonsvalg (bruker-/firmascope, valgt fane, valgt oppførings-ID og fanenes visuelle skall) beholdes i komponentminne. Ingen tilgangskontekst, oppføringsdata eller kontaktverdier lagres som autorisasjonscache. **Ferske rights gate-er hver KS/HR-modul.** Null/pending viser kontrollstatus på valgt fane, ikke profilfallback. Identitets-/firmabytte nullstiller den gamle oppføringsnavigasjonen; prosjekt/support uten egen authUser får ikke husket skall. Null/undefined-oppstart er fortsatt dekket.

HR invalidaterer fortsatt straks ved fokus/bakgrunn, og skjuler gamle rader og detaljer. Etter fersk liste får bare en fortsatt listet valgt oppføring to ferske get-lesninger med samme revisjon før detaljen kommer tilbake. Feil/tilbakekalling/sent svar gir ikke gamle data tilbake. Bare valgt ID beholdes; admin-/HR-utkast får ingen ny lagrings-/gjenopprettingskontrakt. Ingen persistent/offline HR-cache, signed URL eller filtilgang.

Den tidligere React-assertionen krevde at detaljen forble lukket også etter vellykket fersk kontroll. Den er erstattet med strengere hendelsesbevis: hold fersk lesning pending → gammel payload borte → autorisert dobbel lesning → samme valgte oppføring tilbake. Risikoen er å vise data før autorisering eller gjenåpne gammel firmscope; nye negative prøver dekker begge. Ingen tilgangstest fjernes eller hook-sperre svekkes.

## Utforming

Personlig velkomst med egne kontoinitialer, mørk petrolbakgrunn og korte tekster. Tre egne fargetoner for håndbok, oppfølging og profil; ikoner på alle interne faner og tydelige handlingsknapper. Ingen illustrasjonslast, oppdiktede oppgaver, framdrift eller prestasjonsscore.

Personlig HR mister dobbel overskrift og stor introduksjon. Egen rad heter **Min medarbeideroppføring**, med kontoens e-post under; andre serverautoriserte rader merkes **Delt med deg · ekstra lesetilgang**. Søk vises bare ved flere oppføringer. Kommende samtale/fravær er ærlig samlet under **Hva kommer her?**. Firmaadmin-/lederregisterets layout og handlinger beholdes. Profil-/rapport-/e-postkomponentene forblir montert ved interne visningsbytter; private pårørendefelter fortsatt stengt.

Responsive CSS er avgrenset til personal-page/hr-personal; desktop tre kort, små skjermer én kolonne/to faner per rad, minst 44 px handlinger, fokusmarkering og tekststatus i tillegg til farge. Ingen skjermbredde simulert i live nettleser før faktisk bevis.

## Utviklerbevis

Faktisk utvidet personal-page-react-check **PASS**: tom auth-oppstart, tre kort, to kommende typer, egen/delt oppføring, ingen dobbel HR-header, pending tilgang uten profilhopp/utvidede rapportdetaljer/gamle HR-rader, fersk gjenåpning, fokus og bakgrunn, tilbakekalling, firma-/aktørbytte, eksisterende kontakt-/e-postkladd og egne konto-/kontakt-CAS-/forslagsprøver. Syntetisk transport, håndbokinnholdet stubbet i denne isolerte routing-prøven; ingen virkelige profil- eller personendringer.

Faktisk berørt hr-register-react-check **PASS**: eksisterende Hjelp/meny/register/paging/leder/leser/revoke/revisjon/avslutning/slettekvitteringer beholdt; ny pending/autorisasjon/valgt-ID-prøve. Permanent personal-critical og full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**. Ingen ny SQL- eller B/C-/PDF-/ZIP-omtest fordi backend og eksport uendret. Tidligere 59 SQL assertions og Kenneths TEST OK er historiske bevis, ikke nye tester av denne UX-runden.

## Publisering og faktisk Preview

Publisert eksakt SHA, grønn Core Safety, READY Preview og direkte Sandbox-binding føres i draft PR #216; innlogget visuell kontroll og originale bilder følger etter publisering. Ingen browser-PASS påstås i dette notatet før faktisk kontroll. Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Kort relevant brukerprøve: **Meny → Min side → Mine oppfølginger**, åpne **Min medarbeideroppføring**, bytt nettleserfane og gå tilbake. Samme interne fane og autorisert oppføring skal komme tilbake; gamle persondata skal ikke vises under kontroll. Visuelt vurder velkomst/kort og personlig HR. Ingen gjentatt B/C-test.

Privat innhold fortsatt stengt; varig ekstern driftsbinding/ack og full isolert Supabase database-/Storage-restore gjenstår. Ingen Production, main/demo-merge eller testmail sendt.
