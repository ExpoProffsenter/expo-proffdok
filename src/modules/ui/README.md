# Felles arbeidsverktøy

`WorkspaceTools` viser et høyrepanel med handlinger for aktiv arbeidsflate. Panelet bruker native `dialog.showModal()` for fokus, Escape og sperring av bakgrunnen. Å åpne, utvide eller lukke panelet remounter ikke modulinnholdet og gjør ingen lagring. Firma-/brukerbytte gir ny komponentnøkkel. Fanebytte eller endret arbeidskontekst lukker panelet. Prosjektverktøy bruker prosjektets eksisterende faner og `goToTab`; globale opprettingsvalg blandes ikke inn i et aktivt prosjekt.

Startsiden og panelet bruker samme `useWorkspaceTasks` i `home/WorkdayShortcuts.jsx`. Eksisterende moduleAccess-hendelser avgjør Prosjekter/Sales; øvrige innganger følger aktuelle kontekstprops fra App. Ingen ny tilgang, datamodell eller mal-lagring innføres. Alle handlinger bruker eksisterende callbacks. Native Prissøk løses mot appens opprinnelige, fortsatt tilgangsfiltrerte menyknapp; presentasjonskopier brukes ikke som kilde.

Sjekklistemaler bruker en transient engangsforespørsel fra App til KS/HMS. Den inneholder nonce, bruker og firma. KS/HMS behandler den først etter at fersk data/kontekst er lastet, krever samme bruker/firma og manage, og konsumerer den deretter via callback. Ulagret eller pågående rutinearbeid sperrer snarveien med beskjed. Vanlig focus/visibility eller ny render setter ikke skjermen på nytt etter konsumering. Eksisterende navigasjonsminne, kladd, publisering og prosjektkopier er uendret.

Tilbudsmaler i panelet peker til den eksisterende tilbudsbyggeren. Ingen tilbudslinjer, maler eller kladder kopieres til panelets state. Native details rundt ekstra varefelter beholder feltene og deres handlers; opplastingsflaten står åpen når varen allerede har bilde eller vedlegg.
