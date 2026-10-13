const lock=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(lock);Object.freeze(value);}return value;};
export const SOPRO_SYSTEM_CHECKLIST_TEMPLATES = lock({
    "sopro-aeb-815": [
      {
        category: "Sopro AEB 815 / TG 20918 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før montering av foliemembran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Underlaget er primet med Sopro Primer iht. monteringsanvisning"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Foliemembran",
        items: [
          "Sopro AEB 815 foliemembran er montert iht. leverandørens monteringsanvisning",
          "Folieskjøter er limt med Sopro FDK 1-K 1180 / Sopro FDK 415 eller annet godkjent systemlim",
          "Sopro tettebånd er montert i alle overganger mellom gulv og vegg, hjørner, folieskjøter og tilslutninger",
          "Innvendige og utvendige hjørner er utført med Sopro systemdetaljer"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Rør og sluk",
        items: [
          "Sopro rørmansjetter er montert på alle rørgjennomføringer og veggbokser",
          "Rør og veggbokser er rengjort før mansjetter er montert",
          "Slukmansjett er montert iht. leverandørens monteringsanvisning",
          "Klemring/limflens er kontrollert og utført iht. valgt sluktype",
          "Sluk og mansjett er dokumentert med bilde før flislegging"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Tetthetskontroll",
        items: [
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg",
          "Bildedokumentasjon av membransystem, skjøter, mansjetter og sluk foreligger"
        ]
      }
    ],
    "sopro-fdf-525-527": [
      {
        category: "Sopro FDF 525/527 / TG 20987 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før påføring av membran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Primer er påført iht. valgt Sopro-system og underlag"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Membran",
        items: [
          "Minimum to strøk Sopro FDF 525/527 membran er påført",
          "Membrantykkelse på gulv er minimum 1,0 mm",
          "Membrantykkelse på vegg er minimum 0,5 mm",
          "Primer og membran er overflatetørr før neste lag er påført",
          "Brukstemperatur minimum +10 °C er ivaretatt"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Overganger og gjennomføringer",
        items: [
          "Sopro tettebånd/fiberremse er montert i plateskjøter, overganger og tilslutninger",
          "Innvendige og utvendige hjørner er forsterket med Sopro hjørnemansjetter",
          "Sopro rørmansjetter er montert på alle rørgjennomføringer med riktig dimensjon",
          "Rør er rengjort før mansjett er montert",
          "Tekstilsjikt på mansjetter er fullstendig dekket med Sopro FDF 525/527",
          "Membran er ført litt forbi mansjett og ut på rør/veggboks"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Sluk og tetthetskontroll",
        items: [
          "Slukmansjett er montert med Sopro FDF 525/527 iht. valgt sluktype",
          "Det er påført minst to strøk Sopro FDF 525/527 over slukmansjett",
          "Klemring/limflens er kontrollert og dokumentert",
          "Sluk og mansjett er dokumentert med bilde før flislegging",
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg"
        ]
      }
    ]
  });
