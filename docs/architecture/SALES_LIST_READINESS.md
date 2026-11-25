# Klartransport og klar liste er to forskjellige tilstander

Summary-transporten i salesSupabase kan være ferdig før Core har kontrollert tilknyttede prosjekter, tilbudsstatus og installert listen. Transportens globale ready er derfor ikke autoritet for appoversiktens antall eller tomtilstand.

SalesModuleCore eier en lokal status for eksisterende salesStorageKey. Manglende/fremmed eierstatus betyr loading. Ready følger setRequests(hydrated) og eksisterende lokal listecache. Status endrer ikke selve server-/kladd-/editorhydreringen, tilgangskontroll eller reparasjonsflyt. Eksisterende effect-cleanup avviser sene gamle callbacks.

SalesListView mottar eierstatusen fra appens Core og bruker global transportstatus bare når ingen slik status er gitt. Loading/ukjent, feil og bekreftet tomt resultat er separate visninger. Antall og0treff vises først når listen er klar. Søk og filtre er uavhengig brukerstate og skal beholdes gjennom ferdiglasting.
