# Skrivevern for prosjektinvolverte

Hovedappens prosjekteier beregner prosjektlås, support-skrivevern og lesetilgang. Den publiserer bare prosjekt-ID og samlet skriveverntilstand på det eksisterende DOM-skallet. Ingen nye globale klienter, lagringsnøkler eller tilgangskoder innføres.

Kontaktadapteren verifiserer prosjekt-ID mot aktiv URL før montering. Kun eksplisitt `false` i skrivevernmarkøren tillater endringer. En MutationObserver ser bare på relevante eierattributter i tillegg til eksisterende strukturendringer. Endret skrivevern oppdaterer samme React-root og beholder lokal state. Manglende eller uavklart eieridentitet skjuler og fryser panelet uten å slette samme prosjekts usendte arbeid. Ekte prosjektbytte beholder den tidligere oppryddingsregelen.

Alle muterende UI-behandlere sjekker fersk eierkontekst ved handlingen, slik at tiden frem til neste observer-frame ikke blir et redigeringsvindu. DOM-markørene er ikke en sikkerhetsgrense mot egen klientkode: database og Edge Functions eier fortsatt faktisk autorisasjon, og allerede startede forespørsler er ikke tilbakekalt av UI-låsen.
