# Prosjektarbeidsflate og prosjektinvolverte

Prosjektinformasjon og lagring eies av hovedappens prosjektflyt. Kontaktlisten i `projectParticipantsUxV3.jsx` har egen React-root og egen lagrehandling; den må ikke kobles til generell prosjektlagring eller opprette portaltilganger som sideeffekt.

Kontaktpanelet kan flyttes mellom oversikt og eksisterende deltakerslot uten remount. Samme prosjekt beholder inputidentitet, ulagret kontaktkladd, usendt e-post og navigasjonsvakten. Lagre prosjektinvolverte lagrer kontaktlisten; portaltilganger har separate handlinger og regler.

Main leverer `data-project-participants-id` og `data-project-participants-readonly` på aktivt prosjektskall. Panelet kontrollerer disse mot faktisk prosjekt-ID i URL. Låst prosjekt, support-skrivevern eller lesetilgang gir deaktivert kontaktredigering, lagring og e-posthandlinger. Manglende kontekst tillater ikke redigering. Ved midlertidig uavklart eier-ID skjules samme prosjekts kladd til identiteten er bekreftet; ved ekte prosjektbytte ryddes gammel root.

Dette erstatter ikke serverens tilgangskontroll. Auth-klienten skal fortsatt hentes fra den etablerte appregistreringen, og rutine-e-post forblir deaktivert etter gjeldende policy.
