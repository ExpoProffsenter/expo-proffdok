# Overlevering – neste chat

Anbefalt tidspunkt: etter brukertest av neste UX-Preview og før support bygges.
Denne chatten har håndtert mange releaser. Et naturlig skifte er ved modulsnittet,
med repo/PR som fasit. Det er ingen påvist teknisk grense som krever ny chat nå.

Start neste chat slik:

> Fortsett Expo ProffDok. Les AGENTS.md, PROJECT_GUARDRAILS.md,
> CURRENT_RELEASE_STATUS.md, docs/CHAT_HANDOFF_20261016.md og
> docs/SUPPORT_PLAN_20261016.md. Kontroller faktisk main, demo og siste PR.
> Bruk samme faste Preview. Eksisterende funksjoner skal bevares.
> Support er avtalt for innloggede brukere, med dialog i app og e-post,
> skjult servermottaker og Systemadmin-svar i ProffDok-layout.
> Ikke bland støttefunksjonen med uferdig publisering av UX-runden.

## Godkjent og publisert

- PR #261, godkjent av Kenneth «test ok og kjør» 16.10.2026.
- Godkjent head 235dd05dc434087cb3f8b70b3e5e1c692c106fc0, Core Safety #503 SUCCESS.
- Main 688d7f63990bde408a8a49d876343ae778022f63.
- Production dpl_Ft85njmyjterNv3ARC77axRAvMqd READY på expo-proffdok.app.
  HTTP og publisert bundle kontrollert: Production-binding, ingen Sandbox-binding.
  Innlogget funksjonsprøve var gjort i godkjent Preview; ingen ny innlogget
  Production-prøve påstås i denne publiseringen.
- Main → demo 19b48a95276afabbba6463afdcc260bab987475a,
  dpl_5PDPP4kieWmGy4zCLaLjNaHYsQgy READY. Overlay bevart, full build PASS,
  preflight-guard PASS og faktisk innlogget preflight «Demo Sandbox er klar»:
  baseline main 688d7f63, lokal Badskisse, fem kurspunkter og 19 serverpunkter grønne.
- Ingen migrasjon, seed/reset eller e-postsending i denne publiseringen.

## Neste UX-runde

Branch fix-company-admin-scope-20261015. Samme faste Preview:
https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/

Kun presentasjon i KS/HMS, Garanti og Hjelp samt lokal CSS, tester og dokumentasjon.
Veiledning og lange referanser kan åpnes. Status/mangler/neste handling, utkast,
godkjenningskrav, signering og alle opprinnelige callbacks beholdes.
Se docs/qa/COMPACT_REFERENCE_UX_20261016.md og nyeste åpne PR for eksakt
head/CI/deploy. Ny TEST OK kreves før denne rundens merge/produksjon/demo-synk.
Brukerens godkjenning av #261 gjelder ikke automatisk nyere kode.

## Support

Kun planlagt, ikke implementert i UX-runden. Avklarte valg og leveranse finnes i
SUPPORT_PLAN_20261016.md. Brukerens oppgitte mottakeradresse finnes i chatten;
ikke bygg den inn i klienten. Noreply kan ha annen Reply-To, men direkte svar
krever fungerende mottak. Kontroller domenet/Resend-oppsettet før det loves.
