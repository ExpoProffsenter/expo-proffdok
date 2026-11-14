# Prosjektbundet kommersiell samarbeidstilgang

Miljømål BEGGE. Gjeldende tildeling bruker `shop_staff_access`: systemadmin tildeler godkjent intern ansatt direkte til prosjektet under Butikktilgang. Prosjektleder leser og tilbakekaller. Eldre partnerbundne personrettigheter beholdes, men gammel RPC tillater bare lesing og tilbakekalling. Ingen direkte tabelltilgang, nye firmamedlemskap eller endring av aktivt firma.

Hver lesing/skriving kontrollerer navngitt e-post, godkjent aktiv profil, internt firmamedlemskap, modulaktivering, aktivt prosjekt, partnerutløp/tilbakekalling og uttrykkelig rettighet. Kun katalog/romprojeksjonene får prosjektbundet lesekontekst. Boligvalg og individuelle vare-/arbeidslinjer bruker eksisterende revisjon, validering og historikk. Avtaler og ordre sperrer samarbeidsskriving. Beboeraksept, utsending, ordrefunksjoner og HR åpnes ikke.

Min side legger til én isolert lazy-komponent. Etter fjerning av nøyaktig to integrasjonslinjer skal filen være byteidentisk med basen. Oppfrisking skal beholde samme editor; tilbakekalt tilgang skal fjerne den. Personrettighetsutkast sikres lokalt og usikkert lagringssvar gjenbruker samme request-id.

Installasjon: kontroller miljø og eksisterende funksjonsankre/migrasjon først. Installer ny migrasjon bare én gang. Ingen dataimport eller rettighetstildeling inngår. Tilbakeføring: tilbakekall personrettighetene og rull frontend tilbake; bevar audit/valg og migrasjonen. Ikke slett historikk. Produksjon krever grønn QA, Preview og TEST OK.


### Butikktillegg til eksisterende beboerportal
Migrasjon `20261113235139_bolig_shop_proposals.sql` følger partner_commerce. Ny `publish_shop`-rettighet er avslått som standard og tildeles separat på eksisterende prosjektadgang. RPC `bolig_shop_proposal` kontrollerer person, firma, prosjekt, bolig og rettighet før hver handling og før kvitteringsretry. Ingen medlemskap, arbeidsfirma eller generelle roller endres.

Den ansatte kan legge til manuelle varer uten katalogtilgang hos prosjektfirmaet, med varenummer, antall, enhetspris inkl. mva., valgfritt bilde og monteringspris for hele linjen. Katalogsøk bruker den ansattes eksisterende katalogrettigheter, mens prosjektadgangen kontrolleres separat. Server beregner beløpet og lagrer bare felter beregnet på beboeren. Lastede bilder komprimeres til JPEG (maks600px/120KB) og lagres i den private avtaleversjonen. Ingen offentlig bildebeholder eller ny lagringstilgang på tvers av firmaer. Hele forslag begrenses til1,5MB.

Et publisert forslag er et selvstendig butikktillegg (`commercial_documents`, source=shop, kind=change). Det endrer ikke boligvalg eller eksisterende ordre. En felles basis hindrer overskriving mellom ansatte; en tidligere ubesvart butikkversjon supersedes atomisk. Aksepterte versjoner beholdes, og videre tillegg får ny avtalegruppe. Den eksisterende portalens polling viser oppdateringen innen20sekunder. Kontaktbytte/tilbakekalling og ordinære akseptkontroller beholdes. Bestillingsfrist gjelder publisering; svarfrist er begrenset av aktiv portal og30dager.

Første leveranse er additive varer og montering. Erstatning/kreditering av eksisterende vare bruker fortsatt ordinær endringsavtale. Prosjektleder bekrefter faktisk leverandøroppfølging av akseptert tillegg i eksisterende apply-flyt; server oppretter da én separat ordered-bestilling med egne vare-/arbeidslinjer, mottak og FDV. Kvitteringsretry gir ikke dobbeltbestilling. Ingen automatisk utsending.

Tilbakeføring: slå av publish_shop og tilbakefør frontend. Bevar migrasjonen, avtalehistorikk, kvitteringer og allerede registrerte ordre. Produksjon krever separat kontroll og TEST OK.

Installer også `20261114001335_bolig_shop_order_identity.sql` etter butikkmigrasjonen; den bevarer bolignummer og bolig-ID i nye tilleggsordrer/eksport.

Fristintegrasjon: `20261114001703_bolig_shop_project_deadline.sql` følger portal_state.choices_closed, slik at PR332s prosjektklokkeslett gjelder også butikktillegg. Kladdbasis inkluderer prosjektrevisjon. Anbefalt produksjonsrekkefølge: PR332s klokkemigrasjon, partner_commerce, shop_proposals, shop_order_identity, shop_project_deadline. Ingen gammel migrasjon kjøres på nytt. Grunninstallasjonen bruker datofrist før prosjektklokken finnes.

### Systemadmin-tildeling 14.11.2026
Migrasjon `20261114003459_bolig_shop_staff_admin.sql` følger de tre butikkmigrasjonene. `bolig_shop_staff` er security-invoker med privat validert implementasjon. Kontrollerer aktivt prosjekt/firma, prosjektlederkontekst og eksplisitt aktiv systemadmin ved oppslag/tildeling. Kun eksakt e-postoppslag, ingen brukerdatabase eksponert for prosjektfirmaet. Ansatt må være godkjent, aktiv og ha ansatt/firmaadmin-medlemskap i is_internal_work_profile_company. Rettigheten følger bruker-ID og kontrolleres ved hver bruk. Gir read/edit_choices/publish_shop, aldri edit_catalog eller generell firmatilgang. Gyldighet velges 30/90/365 dager; utløp, tilbakekalling, arkivering, deaktivert modul eller tap av ansattstatus stenger tilgang.

I supportmodus brukes eksisterende request_session-validering, med nøyaktig firma, gyldig innlogging, aktiv systemadmin og supportbruker. Tildeling auditeres med ekte actor_id i både bolig- og supportaudit. Ingen generell supportregel eller transport er utvidet. Den effektive brukeren i RPC-resultatet forblir supportbrukeren; UI-identitetskontrollen beholdes. Klientroller har ingen direkte tabelltilgang. Ingen e-post, invitasjon eller pending-rettighet opprettes for ukjent konto; skjermen forklarer godkjenning i riktig firmas brukeradministrasjon, og beholder e-postkladden.

Frontend: prosjekt → Butikktilgang. Min side → Mine boligprosjekter viser alle personens tildelte prosjekter uavhengig av arbeidsfirma. Lagringsforsøk sikres lokalt før nettverkskall; samme request-id brukes ved mistet svar og etter reload. Optimistisk revisjon og serverkvittering hindrer dobbel tildeling og overskriving. Eksisterende UE-/leverandørfunksjoner beholdes.

Tilbakeføring: tilbakekall nye shop_staff_access-tildelinger og eldre partnerrettigheter. Bevar historikk og migrasjon. En frontend-rollback skal ikke gjenåpne gammel tildelingsrett: backend sperrer gammel save med enabled=true.
