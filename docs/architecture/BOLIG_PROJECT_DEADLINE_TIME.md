# Felles klokkeslett for bestillingsfrister

Miljømål BEGGE. Ny migrasjon `20261113191737_bolig_project_deadline_time.sql`.

`roots.choice_deadline_time` er ett klokkeslett for hele prosjektet. Nye prosjekter og eksisterende prosjekter uten daterte bestillingsfrister får 12:00. Prosjekter med tidligere registrerte datoer får NULL, som bevarer tidligere frist ved neste midnatt. Først når manager bekrefter prosjektinnstillingen endres disse fristene. `units.choice_deadline` forblir dato per bolig. Tidssone er Europe/Oslo, også ved sommertid.

Eksisterende beboerbatch autoriserer og låser roten før ny handling `deadline_time`. Handlingens request-id, payloadhash og prosjektrevisjon sikrer retry og samtidige endringer. Ingen boligfilter kan avgrense klokkeslettet. Root-revisjonen økes, slik at tidligere gjennomgåtte batchutvalg blir foreldet. Datoer, avtalesvarfrister, aksepterte avtaler, e-postinnstillinger og gamle mottatte portalsvar beholdes. Portalens visning og serverens request-sperre bruker samme beregnede tidspunkt. Eksisterende portalgrants og kontroll av utsteder/tilgang bevares.

Installasjon: kontroller migrasjonsliste og eksisterende funksjoner i målmiljø. Kjør bare ny migrasjon etter tester. Production etter TEST OK. Ingen Edge Function-endring. Tilbakeføring av frontend alene fjerner tidsinnstillingen fra UI, men beholder serverfristene; ikke gjør dette uten å vise riktig fristtekst. Backend-tilbakeføring krever gjennomgang av eventuelle allerede endrede klokkeslett; ikke slett kolonnen eller sett slutten av dagen blindt.
