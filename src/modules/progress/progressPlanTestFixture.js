// Expo ProffDok – FASE 35A TEMP QA FIXTURE
// Anonymisert strukturkopi av akseptert testtilbud med samme arbeids-/opsjonsmønster som Andreas-eksemplet.
// Personopplysninger, kontaktdata, priser og tokens er bevisst fjernet.
// Skal brukes kun i sikker Preview-test og fjernes før merge.

export const ANDREAS_ACCEPTED_OFFER_TEST_FIXTURE = Object.freeze({
  label: 'Anonymisert testkopi av akseptert Andreas-tilbud',
  requestRef: 'F-2026-0053-TESTKOPI',
  versionNumber: 3,
  lines: [
    { mainPostId: 'tildekking', mainPostTitle: 'Tildekking', description: 'Tildekking og beskyttelse' },
    { mainPostId: 'stop', mainPostTitle: 'Støp', description: 'Støping av baderomsgulv' },
    { mainPostId: 'membran', mainPostTitle: 'Membran', description: 'Membranarbeider' },
    { mainPostId: 'tomrer', mainPostTitle: 'Tømrer', description: 'Tømrerarbeider' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', description: 'Rørleggerarbeider' },
    { mainPostId: 'elektriker', mainPostTitle: 'Elektriker', description: 'Elektrikerarbeider' },
    { mainPostId: 'maler', mainPostTitle: 'Maler', description: 'Malerarbeider' },
    { mainPostId: 'rigg-drift', mainPostTitle: 'Rigg og drift', description: 'Prosjektering, dokumentasjon, rigg og drift' },
    { mainPostId: 'avfall', mainPostTitle: 'Avfallshåndtering', description: 'Avfall håndteres etter avtale' },
    { mainPostId: 'demontering-riving', mainPostTitle: 'Demontering og riving', description: 'Demontering og riving' },
  ],
  selectedOptions: [
    { mainPostId: 'avfall', mainPostTitle: 'Avfallshåndtering', title: 'Avfallshåndtering er inkludert i tilbudet' },
    { mainPostId: 'tomrer', mainPostTitle: 'Tømrer', title: 'Komplett ny dør med karm, terskel, utforinger, lister og håndtak' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', title: 'Toalettsisterne' },
    { mainPostId: 'elektriker', mainPostTitle: 'Elektriker', title: 'Stikkontakt og strømopplegg' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', title: 'Opplegg vaskemaskin' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', title: 'Kjøkkenopplegg ved røropplegg med bad' },
    { mainPostId: 'elektriker', mainPostTitle: 'Elektriker', title: 'Varmekabel 1–3 m²' },
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Flisarbeid av alle vegger og gulv' },
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Tileinsert slukrenne' },
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Flislegge toalettsisterne' },
  ],
});
