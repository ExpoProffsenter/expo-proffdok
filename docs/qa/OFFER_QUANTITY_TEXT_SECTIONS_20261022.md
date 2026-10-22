# Kundens antall og større tilbudstekster

Miljømål: **BEGGE**, først egen feature-Preview fra main **0730eeb4**. Boligprosjekter/PR #278 er utenfor denne rettelsen. Ingen produksjonsmerge uten brukerens TEST OK og grønn relevant QA.

## Årsak og avtalt kontrakt

Tilbakemeldingen viste ikke-valgte opsjoner med låst antall og svært små tekstfelt i den ordinære tilbudsbyggeren. Baseline-testen på faktisk main bekreftet den gamle kontrakten: antall var deaktivert før kunden krysset av opsjonen. Det gjorde funksjonen vanskelig å oppdage. Produksjonsmigrasjonen `customer_option_quantities` er allerede registrert som **20261017131349**, lest tilbake 22. oktober; det er ikke nødvendig med ny migrasjon.

- Kunden kan skrive mengde eller trykke pluss/minus direkte på et tillegg hvor avsenderen har tillatt kundeantall. Endring velger opsjonen og lagrer mengden i samme state-oppdatering, bevarer andre valg og oppretter ingen duplikat-ID-er. Fokus alene velger ingenting. Avkryssing kan fjerne opsjonen uten å miste mengdekladden. Minste/maksimale mengde, desimaler, faste alternativer, utløpt/avvist tilbud og låst aksept følger eksisterende regler.
- «Forutsetninger og forbehold», «Dette er inkludert», «Dette er ikke inkludert» og «Dette sørger kunden for» blir fire sammenfoldbare seksjoner i full bredde. Lukket visning har overskrift, tekstutdrag og tydelig åpning. Åpen visning har 320 px tekstfelt på PC / 280 px på mobil, 16 px tekst, vertikal størrelsesjustering og tastaturbetjent åpning/lukking. Feltene er fortsatt montert og bruker de samme kontrollerte verdiene/endringshandlerne som før.

## Scope

Kun `SalesCustomerOptionQuantity`, de fire tekstfeltenes presentasjon i `SalesOfferBuilderCore`, ny `SalesOfferTextSection`, avgrenset Sales-CSS, eksisterende relevante browserchecks og dokumentasjon. Ingen endring av serverpris/aksept, publisering, signatur/PDF, autosave, hydrering, recovery-kjerne, navigasjon, andre moduler eller SQL/RLS/Storage.

Den gamle browserforventningen om deaktivert ikke-valgt mengde er erstattet av den nye uttrykkelige brukerflyten, med ekstra assertions for direkte pluss, direkte skriving, fokus uten valg og bevaring av andre valg. Tilbudstekstenes gamle to-kolonners-/116 px-forventning er erstattet av kollapsbar fullbreddevisning med større felt. Befaringens tidligere layout, bilder, Badskisse, handlerne for lagring/tilbake og eksplisitt server-/lokal-konfliktvalg beholdes i samme test. Ingen sikkerhetsassertion fjernes.

## Kontroll før Preview

- Baseline: **92** Chromium-kontroller på faktisk main, før rettelse.
- Kundeantall: **116** Chromium-kontroller ved 1363/768/390/320 px, med faktiske customer-wrapper, begge tilbudsbyggere, sum/mva., ugyldig mengde, låste tilbud, akseptvisning og bestillingsgrunnlag.
- Tilbuds-/befaringseditor: **152** Chromium-kontroller ved samme bredder; native kollapsing, store felt, tastatur, samme DOM-felt, tekstutdrag, full tekst etter lukking/focus/visibility og eksisterende lagre-/tilbakehandlinger og server-/lokalvalg.
- Kundeantall: **29** rene runtime-kontroller og **41** PostgreSQL-kontroller med faktisk tidligere migrasjon.
- Eksisterende sandbox-integrasjon kjørt på nytt med ekte `anon`-aksept-RPC og ROLLBACK: serveren bruker publisert enhetspris, lagrer valgt antall, avviser ugyldig/utdatert grunnlag og bevarer publiserte snapshots. Ingen rader eller e-post beholdt.
- Scope guard og diff-check PASS. Full critical build PASS før publisering. Endelig eksakt CI/Preview og innlogget prøve dokumenteres i PR-beskrivelsen.

## Kort brukertest

1. Rediger et ordinært tilbud. Åpne «Dette er inkludert», skriv flere avsnitt, kollaps og åpne igjen. Hele teksten skal være beholdt. Lagre, åpne tilbudet igjen og kontroller teksten.
2. Forhåndsvis som kunde, med et tillegg der «Kunden kan velge antall» er på. Trykk pluss før du krysser av opsjonen. Opsjonen skal velges, og antall, linjesum og totalsum skal endres sammen.
3. Fjern opsjonsvalget, skriv f.eks. `2,5` direkte, og kontroller at den velges igjen. Andre valgte opsjoner skal beholdes. Fjern valg igjen og kontroller at tillegget trekkes fra totalsummen.

Ingen kundelenke er akseptert og ingen melding/e-post sendt under disse prøvene.
