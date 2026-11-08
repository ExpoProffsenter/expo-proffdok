# HR: oppdatert lengdefeil etter retting –6.november

Miljømål BEGGE; kun PR311 Preview/Sandbox fra46b66835. Scope: HrConversations sin change-handler, eksisterende hr-conversations-react-check, HR README og dette endringsgrunnlaget. Ingen backend, lagring, roller, tekstgrenser, kalender, PDF eller e-post endres.

## Faktisk førbevis og avgrensning

Innlogget demokonto på46b66835, Demo medarbeider2 → DEMO-årssamtale, utgave4. Felles møte hadde112tegn per felt. Innliming av10001tegn beholdt eksakt hele teksten, teller10001/10000, ingen HTML-maxLength. Lagre samtale viste lokal lengdefeil og beholdt hele kladden. Tilbakeføring til opprinnelige112tegn og steg3Referat viste fortsatt samme feilmelding samtidig med Lagret på serveren/utgave4. Etter Hent lagret utgave ble feil ryddet. Ingen HR-utgave, deling, tiltak, bekreftelse eller utsending ble opprettet; opprinnelig tekst ble bekreftet uendret, medarbeidervindu lukket til samme rad/fokus og0dialoger.

## Rettelse og regresjonsbevis

Ved en allerede vist lokal lengdefeil sammenlignes den med samme valideringsfunksjon på forrige kladd. Bare denne feilen oppdateres mot neste kladd. Når teksten er gyldig, forsvinner feilen. Annen feiltekst røres ikke; redigering lagrer ikke. Valideringsarbeidet kjøres ikke ekstra når ingen feil vises.

Ny faktisk React-regresjon feiler på original46b66835: corrected text removes stale length error without saving, true!==false. Første negative assertion sammenlignet en DOM-node mednull og førte til svært stor feildiagnostikk/prosessavbrudd; assertionen bruker nå kun Boolean og feiler presist på samme produktmål. Ingen krav ble svekket.

Ny faktisk React-prøve PASS145krav, alle tidligere bevart: fortsatt ugyldig tekst beholder feil, korrigert forberedelse/tiltak/kommentar rydder lengdefeil, null mutasjon ved retting, syntetisk transportfeil beholdes ved ny redigering. Tidligere kladd/hydrering/remount, historikk, partenes egne bekreftelser, PDF-retur, tilbakekalt tilgang og firmaskille består. Full lokal Sandbox-build/critical, video-register, syntax og whitespace PASS også etter siste guard-optimalisering. Eksakt kandidat-CI/innlogget etterkontroll gjenstår ved dette skrivepunktet.

Rollback: revert kun denne UI-/test-/dokumentasjonspakken; ingen DB-steg. Main34daef4c og demoabc38f7e urørt. Ingen TEST OK eller produksjon. Full HR-A–Å med reelle parter, fysisk mobil/Safari og øvrige helappfilmer er ikke attestert.
