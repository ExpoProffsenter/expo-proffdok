# FASE 41A – Mobilvisning og responsive rettinger

Dato: 10.09.2026

## Formål

Fase 41A retter konkrete responsive visningsfeil som ble avdekket på mobil uten å endre forretningslogikk, lagring, priser, tilgangsstyring eller navigasjonsmodell.

## Omfang 41A.1

To feil er rettet:

1. Interne tilbudslinjer i Sales kunne på smale skjermer beholde en desktop-lignende trekolonnelayout. Lange beskrivelser ble derfor presset mot høyre og kunne bli avkuttet. Mobilvisningen legger nå nummer og beskrivelse i hovedraden og pris under beskrivelsen, slik at hele teksten forblir synlig.
2. Checkboxer i `Brukere og tilganger` arvet den globale `input { width: 100% }`-regelen. Checkboxen kunne dermed bruke hele kortbredden og skyve modulnavn og hjelpetekst utenfor høyre kant. Modultilgangspanelets checkboxer har nå eksplisitt kompakt bredde og modultekst kan brytes normalt.

## Implementasjon

Rettelsene ligger samlet i:

- `src/modules/app/mobileResponsive41A.css`
- lastes fra `index.html` etter eksisterende app-/modulstiler

Dette er bevisst en avgrenset responsiv override i stedet for å refaktorere Sales- eller tilgangskomponentene. Eksisterende DOM, beregninger, autosave, RLS og serverkall er urørt.

## Menygrenser

Fase 41A endrer ikke navigasjonen.

- Den kollapsbare desktopmenyen i `desktopSideMenu.js` aktiveres bare ved `min-width: 1181px`.
- Prosjektets egen mobilmeny brukes fortsatt på små skjermer.
- Eksisterende mobilregler i `APP_RUNTIME_STYLES` gjelder under 700 px og skjuler desktop-/headernavigasjon der mobilflyten skal overta.

Ved testing i Chrome DevTools må viewport derfor settes under 700 px, for eksempel 390 × 844, og siden lastes på nytt slik at appen starter direkte med mobilbetingelsene.

## Hjelp

`Hjelp → Mobilbruk` er kontrollert i 41A. Teksten beskriver fortsatt riktig mobilmeny og arbeidsflyt. Siden 41A.1 kun retter layout og ikke endrer brukerhandlinger eller navigasjon, er ingen ny hjelpetekst nødvendig.

## QA

Før merge skal følgende være oppfylt:

- manuell Preview-test på mobilbredde godkjent
- tilbudslinjer viser nummer, full beskrivelse og pris uten horisontal forskyvning
- `Brukere og tilganger` viser checkbox og modultekst innenfor kortbredden
- mobilmenyen er fortsatt den eksisterende mobilmenyen
- desktopmenyen er ikke endret
- branch er ikke bak `main`
- alle eksisterende critical checks og Vite-build er grønne
- ingen nye runtime error/fatal i Preview

Manuell Preview-test på 390 px mobilbredde ble godkjent 10.09.2026.

## Ikke endret

Fase 41A.1 endrer ikke:

- Sales-data, tilbudssummer eller prisberegning
- Butikktilbud-maler eller vareregister
- autosave/recovery
- kundelenker, PDF eller aksept
- modultilganger, RPC eller RLS
- desktop- eller mobilmenyens funksjonslogikk
- database, Storage, Edge Functions eller e-post
