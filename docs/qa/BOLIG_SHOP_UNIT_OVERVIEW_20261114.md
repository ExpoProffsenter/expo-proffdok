# Butikkens boligvalg, kontakt og plan

Miljømål BEGGE. Base main 93e948775ff327534d297e24df8f15e181c57ca6, demo 804419397b52e5ae166c0cc38ec1a403496fd5f1. Begge faktisk READY og alias kontrollert. Handoff PR340 lest; dokumentasjonsbranchen er uendret. Arbeidsbranch fase45b-shop-unit-overview-20261114.

Scope: BoligMyCollaborations, ShopProposal, eget kontakt-/plankort, avgrenset CSS, additiv my_collaborations-projeksjon, hjelp og tilhørende regresjoner. Ingen andre moduler, e-post, dataimport eller endret tilgangsregel. Den nye projeksjonen gis kun ved aktiv personlig butikktilgang og godkjent ansattstatus, i tillegg til eksisterende overordnet kontroll.

Levert i kandidaten: eksplisitt Bytt bolig og klikkbare treff, melding om valgt bolig utenfor søket, registrert adresse/hovedkontakt/tel/mailto, bestillingsfrist fra eksisterende choice_deadline_at i Europe/Oslo, åpne aktiviteter i datorekkefølge. Første åpne aktivitet navngis og kalles ikke arbeidsoppstart. Bytte sperres under bilde/publisering. Forhåndsvisning identifiserer mottakerbolig. Kladd og usikkert publiseringssvar beholdes per bolig med eksakt retry.

Lokalt PASS: samarbeidets React-test (søk, eksplisitt bytte/retur, samme navn, frist/tel, focus og tilbakekalling); butikkens faktiske React-editor (manuell vare, pris, kladd A–B–A, usikkert svar A–B–A med identisk retry, mottaker, aksept og tilbakekalling); PostgreSQL2039 assertions; sandbox-build med critical-kjede; diff-check. Første nye returtest forsøkte å velge en bolig utenfor det aktive filteret; rettet til reell brukerflyt Tøm søk → Bytt bolig, uten å endre produktkravet.

Lokal Chromium kan ikke starte fordi arbeidsmiljøet avviser socket() med Operation not permitted. Nettlesertesten er lagt til eksisterende veiledningskontroll i CI, med faktisk editor, syntetiske transportdata, kladd/boligbytte og 320/390/1363px. Ingen påstand om innlogget end-to-end-test eller faktisk e-postlevering.

Sandbox: my_collaborations før endring sammenlignet med produksjon; migrasjonen bolig_shop_unit_overview installert én gang. Etterkontroll bekrefter ny projeksjon og fortsatt ingen anon execute. Produksjonsdatabasen er uendret. Ingen seed/reset, persondataendring eller utsending.

Før release: full CI og Preview-verifisering, eksplisitt TEST OK, produksjonsmigrasjon etter ny sjekk av installert tilstand, merge og verifisert commit, main→demo med bevart overlay/preflight. Tilbakeføring: revert UI og gjenopprett tidligere my_collaborations-definisjon hvis nye lesefelt skal trekkes tilbake; ingen lagrede data er endret.

Videoene er fortsatt V12. Ny film skal tas på ferdig godkjent butikkflyt, etter denne leveransen. Handoff PR340 og BOLIG_AA_REVISION_20261113.json er fortsatt opptaksgrunnlaget. Ingen ny film er påstått ferdig.
