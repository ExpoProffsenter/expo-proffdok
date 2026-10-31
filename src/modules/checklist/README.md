# Sjekklister

`StandaloneChecklists` åpnes fra Meny → Sjekklister eller Startside → Fyll ut sjekkliste, uten prosjekt-ID. Prosjektliste beholder en ekstra inngang. Ordrenummer og arbeidssted/adresse er påkrevd. Valgfritt eksternt prosjektnavn og kunde/oppdragsgiver følger også lagret kontroll, PDF og e-post. Publisert firmamal eller egen liste bruker eksisterende `ChecklistFields`/`ChecklistFieldBuilder` og de kanoniske serverhjelperne. Eksisterende prosjekt-/boligkontroller beholder egne komponenter/RPC-er.

Lokal kladd er bruker-/firmascopet. Lagre/fullfør krever command + egen readback før lokal kladd fjernes. Eksakt request-ID og payload beholdes ved ukjent utfall. En annen kontroll kan leses uten å overskrive en eksisterende lokal kladd. Forkasting av kladd krever eksplisitt bekreftelse og er sperret under uavklart lagring. Fullførte kontroller og lagrede definisjoner er låst. Endring av sporingsopplysningene opphever feltbekreftelser, også på serveren. Tidligere ufullstendige testkontroller bevares uten automatisk metadata/backfill. Fersk firmatilgang og eier kontrolleres før lesing, lagring, PDF og e-post.

E-post er en eksplisitt brukerhandling til én selvvalgt mottaker. Backend lager PDF fra lagret revisjon og fryser første vedleggsbyte. Ved ukjent status beholdes samme mottaker, revisjon og request-ID. UI lover ikke innbokslevering. Sammefirmas fokusoppfrisking skal bevare usendt arbeid; reelt firmabytte skjuler tidligere innhold.

Nye tester: standalone-checklists-db-check.mjs, standalone-checklist-email-check.mjs og standalone-checklists-browser-check.mjs. Browserprøven bruker faktisk React/HTTP/PostgreSQL og PDF; bare innlogging/transportbinding og ekstern e-postleverandør er isolert.

## Signering av utførelse og firmamal

Vanlige prosjekt-/eksterne utførelseskontroller bruker `ChecklistSignatures` og `ChecklistSignaturePad` (samme tegneinteraksjon og utseende som Overtagelse). Prosjekteringskontrollen er eksplisitt unntatt; ingen Bolig-/UE-/vernerunde-/risiko- eller Overtagelse-endring. Signaturer ligger på kontrollnivå, uten endringer i låste fag-/produkt-/garantidefinisjoner. Fullførte eldre dokumenter vises ærlig uten oppdiktet signatur.

Tegnet egen signatur kreves ved fullføring. Ekstern signatur er valgfri, men ved bruk kreves navn/rolle/firma. Endrede svar/definisjon/sporingsopplysninger nullstiller tegninger; endret eksternt navn/rolle nullstiller ekstern tegning. Canvas har fast backingflate, pointer-capture, og lokal sikring av påbegynte pennestrøk; rotasjon endrer bare visningsstørrelsen. Signaturer følger lokal kladd og serverens lagrede kontroll, egen readback, PDF og e-postsnapshot.

Nye UI-kommandoer er `project_checklist_signed_command` og `standalone_checklist_signed_command`, alltid med strengt krav. Original request/payload og transportvariant beholdes ved uavklart retry; eldre ventende forespørsler kan avklares uten å endre fingerprint. Privat `execution_signature_rollout.enforced=false` holder eldre Demo i drift under Preview. Etter separat TEST OK og verifisert publisering av begge UI-er skal rollout aktiveres, slik at også eldre kommandoer krever signatur på nye fullføringer. Gamle kvitteringer og fullført historikk blir stående.

`ChecklistFirmTemplate` kopierer bare `checklistContent(definition)` gjennom eksisterende mal-RPC/egne readback og rettigheter. Utkast og publisering er separate valg. Klientens frosne maljobb har egen nøkkel per bruker/firma/kontroll; uavklart maljobb endrer aldri kontrollsvar eller signaturer. Ingen personlig malsentral eller automatisk firmapublisering.

### Kompakte svarvalg i design-Preview

ChecklistStatusChoices er en ren kontrollert visning. Den bruker eksisterende Ok/Ikke aktuelt/Avvik-verdier og onChange; lagring, signaturinvalidasjon og avvikslenker blir hos opprinnelig editor. Native knapper har aria-pressed,20px visuell boks og minst44px trykkflate. Avvik er oransje, øvrige valgte svar grønne. Foreldres disabled/fieldset og definisjonens allow_na beholdes. Prosjektets felles editor (inkludert prosjektering/fag/garanti) og eksterne sjekklister bruker samme visning. Bolig/UE har egen komponent og er fortsatt en separat, åpen del av oppgave302; ingen Bolig-kjerne endres i design-PR295.

## Egne punkter og malforslag

Alle godkjente ansatte i aktivt arbeidsfirma kan starte Egen sjekkliste og bygge punkter/underfelt uten personlig KS/HMS-tilgang. En eksisterende kladd blokkerer ikke Start sjekkliste. `standaloneDraftsKey` avgrenser flere lokale kladder per bruker/firma. Ny og gammel kladd arkiveres atomisk før aktiv legacy-nøkkel flyttes; feil eller korrupt innhold sperrer byttet. Kun den bekreftede/forkastede kladdens ID fjernes. Eksakt ventende request/payload bevares. Lokal sikring er ikke serverlagring; enhetsbytte krever Lagre sjekkliste.

`ChecklistTemplateProposal` sender bare kanonisk definisjon via `checklist_template_proposal_submit`. Ingen ordre, kunde, besvarelse eller signatur kopieres. Forslaget er privat til forslagsstiller og firmaets behandlere. `ChecklistProposalInbox` viser Mine malforslag for ansatte og Forslag til firmamaler for firmaadmin/utpekt KS/HMS-ansvarlig. Eksakt detalj leses før behandling. Punkter/underfelt vises uendret. Godkjenning krever bevisst gjennomgang; avslag krever begrunnelse. Frosne forespørsler og separat readback håndterer forbindelsesbrudd uten doble maler. Usendt behandlingsmerknad sikres lokalt. Eksisterende direkte malutkast/publisering beholder sine tidligere rettigheter.

Migrering `20261031012504_checklist_template_proposals.sql` er additiv. Kjør først i Sandbox, deretter Production først etter ny TEST OK. Nye DB- og kladdbiblioteksprøver importeres fra den eksisterende standalone-nettleserprøven slik at samme CI-pakke dekker dem. Ingen e-post sendes for malforslag; køen er selve leveringen til firmaadmin.

Rapportmappingen merker bare signaturbildets presentasjon med `kind: signature`, slik at boxed PDF-rendereren kan begrense bildet proporsjonalt til80×24mm. Signaturinput, bruker-/revisjons-/grunnlagsbinding, krav, readback og historiske verdier er uendret.
