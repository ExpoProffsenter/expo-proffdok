// Planning prompts only. Project-specific requirements must be assessed and documented.
const items=[
 'Omfang, kundens behov og grensesnitt er avklart',
 'Eksisterende forhold, mål og tilkoblingspunkter er kontrollert',
 'Ansvar for prosjektering og kontroll er avklart',
 'Relevante krav og nødvendig dokumentasjon er vurdert',
 'Tegninger og valgt løsning er dokumentert',
 'Dimensjonering og beregningsgrunnlag er dokumentert der det er aktuelt',
 'Plassering, tilgjengelighet og serviceadkomst er avklart',
 'Fall, sluk, terskel og våtsoner er prosjektert der det er aktuelt',
 'Membran, underlag og gjennomføringer er avklart der det er aktuelt',
 'Produkter og systemer er valgt og kompatibilitet er vurdert',
 'Grensesnitt mot andre fag er koordinert',
 'Risiko, uavklarte forhold og avvik er dokumentert',
 'Prosjekteringsgrunnlaget er kontrollert og klart for utførelse'
];
export const PROJECT_DESIGN_CHECKLIST=Object.freeze({
 category:'Prosjektering – kontroll av grunnlag og løsninger',
 instructions:'Vurder prosjekteringen før utførelsen starter. Bruk Ikke aktuelt for punkter som ikke gjelder. Beskriv grunnlaget og henvis til tegninger, beregninger eller produktdokumentasjon i kommentaren. Fullført sjekkliste erstatter ikke nødvendig faglig kontroll eller godkjenning.',
 items:Object.freeze(items),requirements:Object.freeze({})
});
export const PROJECT_DESIGN_CHECKLIST_TEMPLATE=Object.freeze([PROJECT_DESIGN_CHECKLIST]);
