# Hjelp i Boligprosjekter

«Slik styrer du prosjektet» åpner en søkbar veiledning i appens felles høyrepanel. Velg ett av de åtte temaområdene eller søk etter ord fra forklaringen. Én forklaring vises om gangen. «Alle temaer» går tilbake til temaoversikten.

Krysset øverst, Escape og den faste «Tilbake til prosjektet»-knappen lukker panelet. Arbeidsflaten bak panelet er fortsatt montert: valgt prosjekt, bygg, søk, filter og ulagret arbeid skal beholdes. Hjelpen lagrer eller endrer ingen prosjektdata. Modulens eksisterende aktivering og tilgang styrer om veiledningsinngangene vises.

«A–Å-veiledning for Boligprosjekter» bruker samme panelramme. Alle 18 steg, neste/forrige, stegvelger og eksempelbilder beholdes. Forstørret eksempelbilde lukkes separat før man fortsetter i guiden.

`boligHelpContent.jsx` inneholder selvstendige temaer med stabile ID-er, tittel, temaområde og forklaring. Endre berørte temaer når funksjoner endres. Søk inkluderer både overskrift og forklaring. Innholdet i den tidligere veiledningen er bevart; regresjonen sammenligner alle 69 opprinnelige tekstblokker og den eksterne referanselenken mot en uavhengig baseline.

## Videoveiledninger

PROFFDOK-VIDEO-1.0 er brukergodkjent: faktiske eksempelskjermer, tekst uten lyd og animert peker/klikkmarkering. Sju avgrensede filmer finnes med separate redigerbare kilder. Godkjenningen av uttrykket er særskilt fra appens redesign-TEST OK.

Hjelp i toppfeltet åpner veiledningen over arbeidet uten navigasjon eller lagring. Kryss, Escape eller Tilbake til arbeidet returnerer til samme monterte arbeidsflate. Firma-/brukerbytte lukker panelet. Boligprosjekter vises som eget tema med eksisterende A–Å og detaljhjelp ved fersk Bolig-tilgang.

Ferdige filmer ligger direkte under de relevante temaene og kan åpnes med ett klikk. Samme søk finner både teksttemaer og filmenes kapittelinnhold. Det er ingen separat Vis videoer-mellomside. Relevante åpne hjelpetemaer har også «Se video». Video åpner en stor native arbeidsflate; kapitler hopper til den faktiske scenetiden. Videokontrollene og en egen knapp tilbyr fullskjerm. «Les filmens steg» virker også når videoen feiler. Lukk/kryss/Escape returnerer til samme temaliste eller hjelpetema og stopper avspillingen. Ingen automatisk avspilling eller filmnedlasting ved vanlig åpning av Hjelp.

`videoGuides.json` eier film-ID, uforanderlig filsti, SHA256, omfang, kildecommit og kapitler fra den redigerbare tidslinjen. `videoGuides.mjs` filtrerer etter eksisterende synlige hjelpetemaer og Bolig-tilgang. HR-prøvesamtalen vises bare i Sandbox, som den eksisterende prøvefunksjonen. Én main-prop sender allerede lastet Bolig-kontekst; ingen ny tilgangslesning eller tilgangstildeling. Endret bruker/firma/rettigheter fjerner åpne filmvinduer uten å gjenåpne dem ved gjenopprettet tilgang. Hjelpetekst og usendt arbeid beholdes. Den grunnleggende Hjelp-filmen følger åpen teksthjelp for innlogget bruker også mens moduloppslaget venter eller feiler. Modulfilmene følger fortsatt eksisterende synlige temaer og fersk bruker-/modulkontekst; et gammelt moduloppslag for en annen bruker gir bare grunnleggende Hjelp.

Filmene i `public/help-videos` er de fem kontrollerte originalfilene samt masseplan- og statusrapportkapitlene med syntetisk eksempelinnhold. De er statiske opplæringsressurser med offentlige filstier, ikke et lager for private prosjekt- eller HR-opptak. Rollefiltrering bestemmer hvilke veiledninger som tilbys i appen; filene er ikke private kundevedlegg. Ingen ekstern videoplattform, sporing, ny Storage-policy eller brukerdataopplasting brukes. Nye utgaver får ny versjonert filsti. Slett ikke tidligere redigerbare kilder eller andre filmer som del av en oppdatering.

Før publisering: kontroller at hver fil/hash og kapittel er riktig, spill filmen gjennom samme native React-avspiller, test søk/område/fokus/retur/kladd, feilet fil og retry, bruker-/firmabytte og tilbakekalt tilgang. Native prøve: `scripts/help-video-browser-check.mjs`. Uferdige filmer får ingen knapp. Sju filmer er ikke full appdekning; flere arbeidsflater trenger egne kontekstinnganger og filmer. Fysisk mobil/Safari er et eget kontrollpunkt.

«Planlegg flere boliger» ligger under Bolig-temaet ved siden av «Finn bolig». Filmen varer 3:24 og dekker utvalg, datoer, takt, ansvar, arbeidstrinn, forhåndsvisning, lagret resultat og retur. Ti kapitler og tekstalternativ følger samme tilgang og avspiller. Dette er et avgrenset masseplankapittel, ikke hele Bolig A–Å.

«Last ned statusrapport fra prosjekt» ligger direkte under Rapport og i samme hjelpetema, med sju kapitler, VTT og full tekst. Tilgang følger det eksisterende synlige Rapport-temaet; ingen ny tilgangslesning eller rettighet. Filmen viser eksport uten ekstra KS/HMS fra aktivt prosjekt med ikke utstedt garanti. Den dekker ikke garantiutstedelse, alle dokumentvalg eller full prosjektmodul. Rapportvisningen fra PR311 må følge med ved publisering av denne filmen.

«Medarbeidersamtale – samtale, tiltak og referat» er et106sekunders kapittel med ni scener fra faktisk syntetisk Sandbox. Det viser åpning av eksisterende samtale, delt forberedelse, samlet møte/tiltak, ansvar/frister/neste oppfølging, referat og retur. Eksempeltiltaket er kun lokal kladd og blir ikke lagret/sendt/bekreftet. Dette er ikke full HR A–Å, opprettelse, PDF eller faktisk utsending. Filmen bruker samme HR-tema og ferske tilgang som teksten; den separate gamle prøvesamtalefilmen beholder Sandbox-sperren. **Trestegsflyten i PR311 må følge med ved produksjonssetting.** Ingen HR-kjerne er kopiert til denne hjelpebranchen. Åtte filmer betyr ikke full appdekning.


HR-filmen har revisjon2 med ni nye faktiske Sandbox-bilder fra ddffddae, etter grensene10000/2000. Samme ni kapitler/106sekunder og godkjente renderer; v1-asset beholdes historisk, mens eksisterende guide-ID peker på v2. Tilgang/avspiller/VTT/tekst/retur er uendret. Ved senere autorisert release må PR311s trestegsflyt og tekstkontrakt følge filmen. Hele HR A–Å er fortsatt ikke dekket.
