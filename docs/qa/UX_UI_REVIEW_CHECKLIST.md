# Felles UX/UI-kontroll for Expo ProffDok

Bruk denne listen ved hver berørt arbeidsflate, også underdialoger og alternative tilstander. Den er et kontrollgrunnlag, ikke bevis på at hele appen er testet. Originalskisse 03.6 og senere avklaringer gjelder; historiske forslag om venstremeny er ikke dagens designretning.

## Tidligere avtalte kriterier

Kilder: `AGENTS.md`, `docs/architecture/UX_DIRECTION_20261010.md` og [funksjonskartets åtte spørsmål og permanente krav](https://github.com/ExpoProffsenter/expo-proffdok/blob/fase45b-bolig-portal-polish-20261025/docs/reviews/PROFFDOK_FUNKSJONSKART_OG_NYANSATTPROVE_20261028.md). [Visuelle regler](https://github.com/ExpoProffsenter/expo-proffdok/blob/fase45b-bolig-portal-polish-20261025/docs/reviews/BYGGBASE_UX_VURDERING_20261027.md) beskriver felles typografi, knapper, dialoger og statuser.

| Kontroll | Hva skal være tydelig? |
| --- | --- |
| Hvor er jeg? | Firma, rolle, arbeidsflate og valgt sak/prosjekt/bygg/bolig. |
| Hva gjør jeg her og etterpå? | Kort, konkret forklaring og én tydelig hovedhandling. Språk en nyansatt kan forstå. |
| Hvordan starter jeg? | Forslag eller lagret innhold som kan brukes og redigeres. Forslag betyr ikke godkjenning. |
| Hvor finnes resten? | Alle eksisterende, autoriserte funksjoner kan fortsatt nås. Ingen konkurrerende navigasjon. |
| Hva er lagret? | Lokalt sikret, serverlagret, godkjent, sendt og mottatt er forskjellige tilstander. |
| Hvordan går jeg tilbake? | Samme filter, valg, fane og kladd; bevisst navigasjon vinner over recovery. |
| Hvordan fungerer mobil? | Lesbar tekst, minst 44 px sentrale trykkflater, forståelig tekstbryting og korte arbeidsflater. |
| Hvordan får jeg hjelp? | Kort hjelp ved oppgaven og tilgang til full veiledning. |

Bevar fersk firmatilgang, egne HR-roller, server-first, kladd ved dvale/fanebytte, priser/mva./versjoner og eksisterende lagring/eksport. Rutine-e-post forblir deaktivert. Ekte sending, signering og bestilling følger egen autorisasjon.

## Presisering etter dialogfunnene 29.10

Disse målingene konkretiserer kriteriene. De erstatter ikke funksjonstestene:

- Kontroller like topp- og bunnlinjer i samme knapperad, lik høyde, konsekvent avstand og sentrerte ikoner/tekster. Sjekk både første/siste steg og lange knappnavn. Hovedhandlingen kan være bredere når teksten krever det.
- Se etter arvet margin, full bredde, hover-transform og motstridende CSS. Mål de faktiske knappene; antall grønne tester alene beviser ikke visuell kvalitet.
- Kontroller hele dialogens innhold og interne scrollbredde, ikke bare dokumentets bredde. Ingen avklippede bilder, felt, titler eller lukkeknapper.
- Prøv både smal bredde og kort høyde. Lagre-/neste-/lukkeknapper skal være innenfor dialogen. Kroppsinnholdet skal kunne scrolle når plassen er liten.
- Prøv tomt/utfylt skjema, lagret kladd, valideringsfeil, forsøk som må kontrolleres, lange titler og lange handlingsnavn. Skjulte skjemaer skal forbli skjult når en annen dialogtilstand åpnes.
- Kontroller tastaturfokus, Escape, fokusretur og at åpne/lukke/utvide ikke remounter eller tømmer arbeidet.
- Sammenlign skjermbilder med originalskissen. Se etter doble overskrifter, kort inni kort, unødvendig luft, svak kontrast og overflødig scrolling. Ikke løs plassproblemer med mindre tekst.

## Bevis og status

Registrer branch/commit, faktisk Preview-adresse, arbeidsflate/tilstand, bredde/høyde, metode og resultat. Skill mellom lokal komponentprøve med syntetiske callbacks, GitHub CI, innlogget skynettprøve og fysisk enhet/Safari. En lav nettleserhøyde er ikke bevis på faktisk skjermtastatur.

Relevante automatiske vern: `scripts/bolig-builder-browser-check.mjs` (bilder, bunnknapper, korte skjermer, kladd/opprettelse) og `scripts/app-ux-review-browser-check.mjs` (høyrepanel, kontekst, kontrollplassering, fokus og bevaring av arbeid). Øvrige modulers eksisterende kontroller beholdes.

Salg og vareflyt: `sales-editor-ux-browser-check.mjs` laster faktisk app-ramme og design-CSS og kjører også `sales-store-layout-browser-check.mjs` for Generelt tilbud. `sales-overview-ux-browser-check.mjs` prøver liste/sak/retur. `smart-price-search-browser-check.mjs`, `price-search-mobile-check.mjs` og `pro-catalog-order-browser-check.mjs` måler også faktisk designstil og interne bredder. Dette er komponent-/adapterprøver med syntetisk transport, ikke bevis på innlogget brukerreise eller fysisk kamera/tastatur.

Neste samlede arbeidsflater følger brukerens prioritering: forespørsel/befaring og begge tilbudstyper; varesøk/bestilling og varetillegging; prosjekt og sjekklister; HR/HMS/KS; Firmaadmin/Systemadmin og portaler. Før hver pakke avgrenses hva som faktisk prøves. Ingen full manuell appdekning er attestert av denne listen.
