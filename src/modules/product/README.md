# Produktvalg i prosjekt

`productViewTools.js` beholder appens eksisterende produktvalg, produktdokumenter og manuelle produkter. `ProductCategory` er en presentasjonsramme uten produktdata eller transport.

Oversikten bruker to kolonner over760px, ellers én. Redigerbare kategorier begynner lukket, også når noen produkter er valgt; valgt antall står på kortet. Åpne/Lukk styrer eksisterende `openProductSections`. Bare den kategorien brukeren åpner, utvides. Alle feltverdier eies fortsatt av hovedappen og beholdes ved bytte/lukking. Snarveien fra listen over manglende FDV-/databladlenker åpner samme kategori. Kategorititler/antall holdes separate fra hovedtekst; felt og handlinger beholder16px/44px.

Et låst prosjekt åpner fortsatt automatisk bare kategorier med brukte standard- eller manuelle produkter. Kategorien har en statisk overskrift med brukt antall i stedet for en tilsynelatende fungerende lukkeknapp. Eksisterende disabled-felt, manglende opprettings-/slettehandlinger og valgfri rapportdokumentvelger beholdes. Ingen opplåsing eller produktendring skjer ved navigasjon.

Valg, FDV, datablad, DOP, EPD, sikkerhetsdatablad, farge, brukssted, manuelle produkter og rapportvalg bruker opprinnelige handlers. Ingen database, priser, PDF, firmatilgang eller e-post er endret.

Regresjon: `product-categories-react-check.mjs` bruker faktisk renderer/ramme med syntetisk vertsstate for standard/manuelt/skrivevern/metadata. `project-subflows-036-browser-check.mjs` bruker appens faktiske feltprimitiver, kontrollert kategorinavigasjon og320/390/768/1363/1920-bredder. Layoutattest og live rolle-/portalattest skal rapporteres særskilt.
