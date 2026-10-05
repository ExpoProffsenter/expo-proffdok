# Release-status – kontrollert 05.10.2026

## Production

- PR #211 er merget etter Kenneths TEST OK kl. 16:29 og Production OK kl. 19:05 Europe/Oslo. Funksjonscommit: deaca065d37c6f51e4481898176e8987ca84fc6e.
- Vercel dpl_ERi5YX2xU9NXegqT6nJzidre8fVo er READY, target=production, riktig SHA. expo-proffdok.app og arbeidsprofilasset svarer HTTP 200; asset bekrefter Production Supabase dqffxflaoyarbxyiyhop og ingen Sandbox-binding.
- cordel_export_access-migrasjonen er anvendt i Production og tidligere scenario-testet i Sandbox med rollback. RLS aktiv, direkte klienttabelltilgang og anonym RPC stengt. Ingen brukertilgang er forhåndstildelt; aktiv Systemadmin har automatisk tilgang. Andre får Eksport til Cordel på brukerkortet i Systemadmin. Samme tilgang styrer tilbud/plukklisteeksport og det spesifikke Cordel-Hjelp-temaet.
- Dagens ZIP/Rundsum beholdes. AFG kan importeres alene uten jobbliste. Ved jobbliste kreves jobblistefil først med tilsvarende Cordel-oppsett, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding beholder akseptert pris også ved AFG alene. Faktisk kildekost/timebudsjett/fortjeneste følger ikke med.

## QA og avgrensning

- Godkjent Preview: dpl_H6i4o4A48vAwTcvgSpPLAvFPE4FU, Sandbox-only, head b727b9d0a267b15ee9be5be4ea6c1a471470ab3a. Lokal og publisert tree identisk.
- Full critical-suite, Vite-build, refresh-runtime-test, Core Safety og scope/docs guards grønne. Sandbox-scenarioer dekker tildeling/fjerning, vanlig bruker/Firmaadmin, firmascope, inaktiv/ikke godkjent/anonym og bevaring av prisrettigheter.
- Innlogget Preview er godkjent av Kenneth. Innlogget Production-UI er ikke kontrollert i skynettleseren; tidligere innlogging var blokkert. Ingen Production-testdata eller brukertildelinger er skrevet.
- Kundeprofiler og eks. mva.-visning fra brukerfeedback er egen, ikke implementert oppgave og inngår ikke i PR #211.

## Demo

- Miljømål: BEGGE. Kontrollert main → demo via PR #212, merge 35b51ff45cf058f55c581b396ab18884d5c655a6. Eksisterende overlay og Golden Demo-data beholdes. Lokal sammenslåing med Sandbox-build er grønn.
- Sandbox-migrasjonen er allerede anvendt. Innlogget Golden Demo-preflight gjenstår; kjør Kjør preflight før kurs/kundedemo. Ikke forveksle grønn build med innlogget preflight.
- Ingen branches er slettet. Behold main og permanent demo.

## Pågående separat oppgave – kundeprofiler og eks. mva.

Miljømål BEGGE. KJØR 05.10.2026 gjelder ny feature/Preview `feat-company-customers-vat` fra main 86e6036, ingen Production-godkjenning. Kunderegister deles i aktivt firma, lagring er frivillig/av som standard, gjenbruk i prosjekt og begge tilbudstyper. Visning eks. mva. velges per tilbud, av som standard, følger låst kundevisning/PDF. Scope: customer-modul/migrasjon, én kundedataflate i main, forespørselsskjema, tilbudsform/snapshot og pris-presentasjon, dokumentasjon/Hjelp. Ingen urelaterte UX-/recoveryendringer.

Preview-feedback kl. 20:03: mva.-valg manglet i aktiv generell tilbudsbygger. Rettet i grouped/router-flyten, kladdforhåndsvisning og grunnsum. Ny permanent React-render-test beskytter faktisk router. Ny Preview krever fortsatt TEST OK og konkret Production OK.
