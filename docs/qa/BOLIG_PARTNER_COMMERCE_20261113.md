# Personstyrt grunnpakke og tilvalg – arbeid pågår

Miljømål BEGGE. Arbeidsbranch feat/bolig-partner-commerce-20261113 fra main 6eb54148b3d61e318c5447810cdf89deab6afffa. Ikke klar for TEST OK eller installasjon.

Avtalt: Navngitte, godkjente brukere ved Bademiljø Expo, Expo Proffsenter og Ringside skal få prosjekttilgang via Min side / Mine samarbeid. Lesing, endring av boligtilvalg (inkludert varer og arbeid) og endring av felles katalog er separate rettigheter. Ingen automatisk firmatilgang eller medlemskapsendring. Beboer godkjenner i portalen. Ingen e-post er autorisert av dette arbeidet.

Implementert utkast: private prosjekt-/brukerbundne rettigheter knyttet til eksisterende partneradgang; egen administrasjons-RPC og samarbeidsliste; avgrenset lesekontekst uten manager-rolle; eksplisitte skriverettigheter for pakkevalg og individuell tilpasning. Frontend integrert som egen komponent i Min side og eksisterende partnerdialog.

Status: Lokal Vite build bestod første versjon. Første PostgreSQL-scenario feilet på prosjektlisten. SQL-variabel med samme navn som tabellalias er rettet; ny kjøring PASS med 1864 PostgreSQL-assertions. Dette inkluderer separate lese-/valg-/katalogrettigheter, nektet øvrig prosjekttilgang, uendrede medlemskap og tilbakekalling. Ny migrasjon 20261113194437 er IKKE installert i sandbox eller produksjon. Ingen rettigheter er tildelt reelle brukere.

Må fullføres før Preview: full DB-pakke og negative tilgangstester, individuell vare/arbeidslinje og avtalelås, tilbakekalling/utløp/feil firma, lokal sikring av tilgangsredigering og usikkert lagringssvar, PT409-oppfrisking, stabil editor ved fokus/dvale (nå kan periodisk oppfrisking avmontere editor), dokumentert arbeidsflyt for deling av forslag til beboeren, hjelp og boundary-test av kun den avtalte Min side-integrasjonen. Ingen grønn eller ferdig-påstand før dette er gjort.
