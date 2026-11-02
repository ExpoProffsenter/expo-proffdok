# Hjelp i Boligprosjekter

«Slik styrer du prosjektet» åpner en søkbar veiledning i appens felles høyrepanel. Velg ett av de åtte temaområdene eller søk etter ord fra forklaringen. Én forklaring vises om gangen. «Alle temaer» går tilbake til temaoversikten.

Krysset øverst, Escape og den faste «Tilbake til prosjektet»-knappen lukker panelet. Arbeidsflaten bak panelet er fortsatt montert: valgt prosjekt, bygg, søk, filter og ulagret arbeid skal beholdes. Hjelpen lagrer eller endrer ingen prosjektdata. Modulens eksisterende aktivering og tilgang styrer om veiledningsinngangene vises.

«A–Å-veiledning for Boligprosjekter» bruker samme panelramme. Alle 18 steg, neste/forrige, stegvelger og eksempelbilder beholdes. Forstørret eksempelbilde lukkes separat før man fortsetter i guiden.

`boligHelpContent.jsx` inneholder selvstendige temaer med stabile ID-er, tittel, temaområde og forklaring. Endre berørte temaer når funksjoner endres. Søk inkluderer både overskrift og forklaring. Innholdet i den tidligere veiledningen er bevart; regresjonen sammenligner alle 69 opprinnelige tekstblokker og den eksterne referanselenken mot en uavhengig baseline.

## Videoveiledninger

PROFFDOK-VIDEO-1.0 er brukergodkjent: faktiske eksempelskjermer, tekst uten lyd og animert peker/klikkmarkering. Fem avgrensede filmer finnes med separate redigerbare kilder. Godkjenningen av uttrykket er særskilt fra appens redesign-TEST OK.

Hjelp har en kompakt «Vis videoer»-inngang. Oversikten bruker samme søk som teksthjelpen og kan filtreres på område. Relevante hjelpetemaer har «Se video». Video åpner en stor native arbeidsflate; kapitler hopper til den faktiske scenetiden. Videokontrollene og en egen knapp tilbyr fullskjerm. «Les filmens steg» virker også når videoen feiler. Lukk/kryss/Escape returnerer til samme oversikt eller hjelpetema og stopper avspillingen. Ingen automatisk avspilling eller filmnedlasting ved vanlig åpning av Hjelp.

`videoGuides.json` eier film-ID, uforanderlig filsti, SHA256, omfang, kildecommit og kapitler fra den redigerbare tidslinjen. `videoGuides.mjs` filtrerer etter eksisterende synlige hjelpetemaer og Bolig-tilgang. HR-prøvesamtalen vises bare i Sandbox, som den eksisterende prøvefunksjonen. Én main-prop sender allerede lastet Bolig-kontekst; ingen ny tilgangslesning eller tilgangstildeling. Endret bruker/firma/rettigheter fjerner åpne filmvinduer uten å gjenåpne dem ved gjenopprettet tilgang. Hjelpetekst og usendt arbeid beholdes. Den grunnleggende Hjelp-filmen følger åpen teksthjelp for innlogget bruker også mens moduloppslaget venter eller feiler. Modulfilmene følger fortsatt eksisterende synlige temaer og fersk bruker-/modulkontekst; et gammelt moduloppslag for en annen bruker gir bare grunnleggende Hjelp.

Filmene i `public/help-videos` er de fem kontrollerte originalfilene med syntetisk eksempelinnhold. De er statiske opplæringsressurser med offentlige filstier, ikke et lager for private prosjekt- eller HR-opptak. Rollefiltrering bestemmer hvilke veiledninger som tilbys i appen; filene er ikke private kundevedlegg. Ingen ekstern videoplattform, sporing, ny Storage-policy eller brukerdataopplasting brukes. Nye utgaver får ny versjonert filsti. Slett ikke tidligere redigerbare kilder eller andre filmer som del av en oppdatering.

Før publisering: kontroller at hver fil/hash og kapittel er riktig, spill filmen gjennom samme native React-avspiller, test søk/område/fokus/retur/kladd, feilet fil og retry, bruker-/firmabytte og tilbakekalt tilgang. Native prøve: `scripts/help-video-browser-check.mjs`. Uferdige filmer får ingen knapp. Fem filmer er ikke full appdekning; flere arbeidsflater trenger egne kontekstinnganger og filmer. Fysisk mobil/Safari er et eget kontrollpunkt.
