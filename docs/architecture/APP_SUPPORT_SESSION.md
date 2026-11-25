# Samlet supportøkt – testkandidat i sandbox

PR322 erstatter PR319 ved vellykket QA. Kravet er kundens faktiske app og egne priser, med opprettelse/redigering, uten sletting. Tilbake skal forbli i kundens app; eksplisitt avslutning skal gjenopprette administratorens arbeidsflate. Dette dokumentet beskriver grunnlaget og åpne integrasjonspunkter, ikke en ferdig brukerreise.

## Identitet og levetid

Den opprinnelige administratorens Auth-token beholdes. Privat økt binder aktør, innloggingsøkt fra `auth.sessions`, målbruker og firma. Aktiv og godkjent aktør/målbruker samt medlemskap kontrolleres på nytt. Varighet er én time. Gjenåpning for samme aktør/innlogging/mål gjenbruker økten uten forlenget utløp; bytte av mål krever avslutning. Avslutning fungerer etter at målets medlemskap eller funksjonsaktivering er trukket tilbake.

Det utstedes ikke kundetoken, og `auth.uid()` eller brukerkontoene endres ikke. Den foreløpige Data API-hooken validerer aktøren, setter transaksjonslokale claims til målbrukeren og lar eksisterende RLS/RPC-er beholde autorisasjonsansvaret. Målets faktiske aktive firma må samsvare med supportfirmaet. Dette er ikke bevis på at alle eksisterende RPC-er fungerer i support; det må kontrolleres per modul.

## Lagring og sletting

Private tabeller for innstillinger, økter og revisjonslogg har RLS uten direkte kundetilgang. Triggerne avviser fysisk sletting, TRUNCATE, eierskifte, kjente arkiveringsflagg og fjerning av identifiserte elementer i JSON. Før/etter logges med faktisk aktør og mål. Hemmelighetsfelter redigeres bort fra loggen. Vanlig aktivitet uten supportkontekst følger eksisterende behandling.

Generisk JSON-kontroll er **ikke tilstrekkelig som full modellgaranti**: navnløse objekter, egne statusfelt, lagringsrutiner som erstatter rader, nye tabeller og felter med særskilt slettesemantikk må gjennomgås. Audit er privat, men før/etter kan inneholde personopplysninger; tilgang og bevaring må inngå i endelig driftsoppsett. Ingen aktivering før de aktuelle modellene er kontrollert.

## Klientgrunnlag

Runtime krever først servervalidert økt og deretter et eget kontekstsvar gjennom Data API-hooken. Manglende hook, feil firma, utløp og byttet aktør stopper kundemodus. Sene svar etter avslutning kastes. Den faller aldri automatisk tilbake til administratorens data.

Lagringsadapteren skiller supportkladder og navigasjon med økt-ID. Administratorens Auth-lagring deles; egne kladder og andre supportøkter bevares. Ved en lagret supportøkt venter alle app-installatører på serverbekreftelse. Local/sessionStorage, IndexedDB og storage-events er navneromsisolert; Auth-lagringen beholdes. Auth-fasaden viser målbrukeren uten å endre administratorens lagrede bruker/token. Utløp blokkerer flaten. Innlogget reload og Sales-gjenåpning er kontrollert i sandbox; langvarig dvale utover utløp dekkes av runtime-test.

## Transportgrenser og aktiveringskrav

Supabases `db_pre_request` gjelder bare Data API. Storage, Realtime og Edge Functions omfattes ikke. Storage-policyene pakkes rundt sine opprinnelige uttrykk, som evalueres etter validert kontekst. UPDATE/DELETE er i tillegg sperret med restriktive policyer. Kontraktfil-Edge validerer konteksten og sender den videre til eksisterende RPC-er før privilegert fillesing/opprettelse. Øvrige Edge-endepunkter er fortsatt sperret. Realtime kobles ikke til med administratorens identitet; prosjektchat beholder sin eksisterende 5-sekunders REST-oppdatering. Faktisk HTTP/CORS og moduldekning må verifiseres før aktivering.

Før aktivering må følgende være ferdig:

- Kundeautoriserte dokumentlesinger og nye filopplastinger, med filfjerning og overskriving sperret på serveren.
- Edge Functions/andre tjenester gjennomgått; reell utsending, bestilling og aksept skal beholde egne sperrer.
- Full dekning av berørte tabeller/RPC-er, også Boligprosjekter. Nye tabeller må ikke slippe utenom slettesperren.
- Felles bruker-/firmavelger, Auth-visning, banner, cache/IndexedDB-isolasjon og navigasjon gjennom hele appen.
- Innlogget sandbox/Preview-test med syntetiske data: opprette/redigere, slettingsforsøk, dvale/refresh, tilbakekalling, sent svar, tilbudsrecovery og avslutning.

Begge innstillinger starter `false`. Migrasjonene konfigurerer **ikke** `pgrst.db_pre_request`. Ikke slå på innstillinger eller hook manuelt for å prøve UI før transportene er klare. Tre migrasjoner er installert deaktivert i Sandbox, ikke Production. Se QA-loggens versjonsmapping; ikke kjør lokale migrasjonsversjoner ukritisk på nytt. Full produksjonsplan, tilbakeføring og TEST OK må foreligge før aktivering.

## Verifisert kandidat og driftsplan (erstatter historiske aktiveringsavsnitt over)

Åtte migrasjoner er installert i sandbox ppvircenkjizeiqdxphj; enabled/transport_ready er true og Data API-hook aktiv. Eksakte remote-versjoner finnes i QA-loggen. Produksjon dqffxflaoyarbxyiyhop er uendret. PR319 og separat PR320 må begge inngå i leveransen; sistnevnte er allerede installert som bolig-contract-files v4 i sandbox.

Tilbud: faktisk browseropprettelse, antall/prisredigering, serveravlesing, reload, PNG og privat PDF-opplasting/åpning er kontrollert. Bolig: eksisterende prosjektlederrolle, opprettelse via create_plan, redigering av bolig og avvist arkivering er kontrollert gjennom faktiske RPC-er i en transaksjon med ROLLBACK. Boligbrukerens nettleser stanser korrekt ved ikke-godkjente vilkår; vilkår er ikke godkjent på brukerens vegne.

INSERT/UPDATE-kontrollen kjører etter opprinnelige normaliseringstriggere, og validerer/auditerer endelig rad; feil ruller tilbake hele skrivingen. DELETE/TRUNCATE og net-kø er sperret før utførelse. Tomme arkivtidsstempler er tillatt, faktiske arkiveringsverdier sperres. Innebygde bilder kan legges til men ikke erstattes eller tømmes. Personlig user_terms_acceptance kan ikke skrives i support.

Etter TEST OK: kontroller main/demo og nyeste migrasjonshistorikk på nytt; installer bare manglende migrasjoner i rekkefølge og la Production-innstillinger være false under oppsett. Original Storage-policylista og eventuell eksisterende db_pre_request må kontrolleres før installering. Deploy PR320 Edge-adapter med eksisterende verify_jwt-kontrakt. Merge/release begge avgrensede PR-er med grønne kontroller. Aktiver først etter at publisert frontend-commit, funksjonsversjon og hook er bekreftet. Verifiser produksjon med lesing og navigasjon, ikke syntetiske kundeskrivinger. Synkroniser demo separat og bevar miljøoverlegg.

Tilbakeføring: sett app_support_private.settings enabled=false,transport_ready=false. Dette skjuler ny inngang og stopper pågående supportkall lukket; normale kall uten supportheader beholder gammel behandling. Reverter eventuelt frontend/Edge til forrige bekreftede release. Behold audit og kundens faktisk lagrede data; ikke fjern tabeller, migrasjonshistorikk eller Storage-snapshots ved normal rollback.

## Offentlige forespørsler – rettelse 12.11.2026

Global hook kjøres også for anon og service_role. Ny migrasjon `20261112230911_app_support_public_request_passthrough.sql` lar disse rollene kalle den offentlige SECURITY INVOKER-inngangen. Uten supportheader returnerer den før privat skjema berøres. Med supportheader kreves authenticated før eksisterende private økt-, aktør-, mål- og firmakontroll. Ingen nye private rettigheter, ingen bytting av rolle, ingen endring av RLS eller utsending.

Installer denne rettelsen før global hook registreres i et nytt miljø. Åtte tidligere supportmigrasjoner pluss denne rettelsen må avstemmes mot faktisk migrasjonshistorikk; ikke gjeninstaller sandbox-migrasjonene. Sandbox lokal 20261112230911 → remote 20261112230959. Produksjon ikke endret. Ved rollback må rettelsen beholdes så lenge den globale hooken finnes; å deaktivere support alene reparerer ikke den gamle manglende anon-kallrettigheten.

## Invitasjoner og nylig publisert Firmaadmin – 13.11.2026

PR324 er publisert i main f7298e11. Supportbranchen er samordnet med denne. Ny migrasjon20261113005500_app_support_invitation_fences krever company_invitation_management installert først. Support kunne tidligere sette company_user_invites.status til revoked fordi invitasjonstabellen ikke var navngitt som tilgangsendring; lokal negativ test beviste dette.

Invitasjoner og alle private sendeloggskrivinger er nå sperret i support. Dette dekker opprettelse, tilbaketrekking, reservering og bekreftelse/usikkert svar. Offentlig invitasjonstabell og ny privat deliveries-tabell får eksplisitte write/delete/truncate-triggere, uansett om support eller invitasjonsmodulen kom først. Eksisterende guard erstattes bare ved eksakt forventet definisjon, ellers stoppes migrasjonen. Vanlig autorisert firmaadministrasjon uten supportheader følger samme oppførsel som før. UI sperrer Trekk tilbake invitasjon i support; serveren er fasit. Ingen e-posttransport eller roller endres.

Denne additive sperren skal med før produksjonsaktivering. Ikke fjern den ved rollback så lenge support kan brukes. Kontroller gjeldende migrasjonshistorikk før installasjon; ikke kjør installasjonen på nytt. Eksakte miljøresultater føres i PR322.

## Installasjonsrekkefølge med PR323

Den private resident_batch_receipts-tabellen kom etter opprinnelig support i sandbox. Migrasjon20261113013443_app_support_resident_batch_guards avstemmer tre eksisterende supporttriggere på akkurat denne tabellen. Manglende triggere opprettes; eksisterende må ha forventet funksjon og hendelsestype. Når support installeres etter Orvei i produksjon, bevares triggerne opprettet av grunninstallasjonen. Tilgang, RLS, batchfunksjon og fristlogikk endres ikke. Kontroller installasjonshistorikk per miljø.
