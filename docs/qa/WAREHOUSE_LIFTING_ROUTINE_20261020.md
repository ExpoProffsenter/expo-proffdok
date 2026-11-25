# Lagerrutine – 25 kg limsekker og arbeidsgivers ansvar

Miljømål: **BEGGE**. Baseline main `7a2978434ec7163d215fbc2730643ec376282174` (PR #271 publisert). Brukeren bestilte oppdatering av eksisterende lagerrutine, også sett fra arbeidsgivers side, med 25 kg limsekker som reell lageroppgave.

## Avgrensning og innhold

Bare `store_lifting` oppdateres fra kildeforslag v1 til v2, med stabil nøkkel og ny tittel **Tunge løft og varehåndtering på lager**. Mottak, varepåfylling, plukk og utlevering omfatter 25 kg lim-/mørtelsekker der lageret fører slike varer. Medarbeider forventes å utføre avtalte oppgaver. Manuelle enkeltløft kan inngå etter konkret vurdering av oppgaven og medarbeiderens forutsetninger. Arbeidsgiver beskriver oppgavekrav, bemanning, risikovurdering, hjelpemidler og praktisk opplæring. Medarbeider følger instruks, bruker utstyret, melder behov og medvirker.

25 kg, 6000 kg samlet per dag og 20 meter bæring beskrives som veiledning, ikke absolutte lovgrenser, arbeidskvote eller garanti for forsvarlighet. Repetisjon, grep, rekkeavstand, høyde, vridning og samlet belastning avgjør metoden. Tilrettelegging vurderes sammen med drift og kollegers arbeidsmiljø. Ved redusert arbeidsevne vurderes tiltak og eventuelt annet passende arbeid etter gjeldende plikter. Ingen automatisk vurdering av ansettelse, helse eller egnethet. Private helseopplysninger holdes utenfor felles håndbok.

Eksisterende hensyn for badekar, skadet porselen, møbler, lange rør, fellesløft og klempunkter er bevart. Den generelle rutinen `lifting` og de andre 86 forslagene endres ikke. Ingen meny, main.jsx, tilgang, database, HR-innhold eller e-postendring.

## Kilder kontrollert 20.10.2026

- [Arbeidstilsynet – manuelt arbeid](https://www.arbeidstilsynet.no/arbeidsmiljo/ergonomi/manuelt-arbeid/)
- [Arbeidstilsynet – tungt arbeid](https://www.arbeidstilsynet.no/arbeidsmiljo/ergonomi/manuelt-arbeid/tungt-arbeid/)
- [Tilrettelegging og medvirkning](https://www.arbeidstilsynet.no/arbeidstid-og-organisering/tilrettelegging/)
- [Forskrift om utførelse av arbeid, kapittel 23](https://www.arbeidstilsynet.no/regelverk/forskrifter/forskrift-om-utforelse-av-arbeid/)
- [Arbeidsmiljøloven §§ 2-3, 4-4 og 4-6](https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/)
- [Internkontrollforskriften §§ 4–5](https://www.arbeidstilsynet.no/regelverk/forskrifter/internkontrollforskriften/)

Selvstendig formulering. Ingen Reddit-/leverandørpåstand om «2–14 kg» eller automatisk dobling av løftevekt ved tomannsløft.

## Historikk og QA

Firmaets godkjente tekst og lesebekreftelser overskrives ikke. Den eksisterende kildeoppdateringsflyten viser nyere forslag. Firmaet sammenligner, velger felter, vurderer hele forslaget, lagrer utkast og godkjenner/publiserer en ny firmaversjon.

De eksisterende dato-guardene får et presist unntak for den bestilte `store_lifting` v2. Vernet er styrket med eksakt SHA256 for alle 13 øvrige butikkforslag. De 73 opprinnelige rutinene har uendret eksisterende hashvern. V1 er fryst i testfixture og brukes i faktisk v1→v2-modellscenario som bekrefter at gammel godkjent tekst gjelder frem til ny firmagodkjenning.

Full critical/build med eksplisitt Sandbox-binding, kildeoppdateringens gamle og nye React-scenario, 87-rutiners firmapublisering og håndbok-PDF kjøres før Preview. Gamle tester beholdes; de faktiske kildeoppdateringsscenarioene legges også inn i CI. Ingen faktisk e-post eller cloud-dataskriving i QA.

## Kenneths Preview-prøve

Fast adresse: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/

1. KS/HMS → Forvaltning → Håndbok → **Butikk, lager og truck**. Finn **Tunge løft og varehåndtering på lager** og les forhåndsvisningen.
2. Kontroller avsnittene om arbeidsoppgaver, 25 kg limsekker, arbeidsgivers planlegging/opplæring og medarbeiderens utførelse/medvirkning.
3. Har testfirmaet den gamle rutinen: åpne **Oppfølging og revisjon → Kildeoppdateringer → Sammenlign tekstforslag**. Se at gammel godkjent utgave fortsatt gjelder. Bruk bare testfirma til eventuell lagring/firmagodkjenning.

Ny eksplisitt TEST OK → merge → Production-verifisering → kontrollert main til demo og 19+5 preflight. Ingen migrasjon nødvendig. App-publisering erstatter ikke firmaets godkjenning av rutinen.
