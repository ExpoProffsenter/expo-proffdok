# HR-film: samtale, tiltak og referat

Miljømål BEGGE; kun PR308 Preview/Sandbox. Base516c6ad2, sju tidligere filmer bevart. Scope er nye MP4/VTT, metadata/HR-filmfilter, eksisterende additive avspillerkrav, Hjelp-README/filmregister og dette endringsgrunnlaget. Ingen HR-kjerne, SQL, navigasjon eller sending.

106sekunder/ni kapitler, H264/1920×1080/24fps/ingen lyd,5738527byte, SHA2569f065bb94c0266f617c0cab562de0385254b6d924e62ce8b441f252f5558125a. Full dekoding av2544frames uten feil og ni scenebilder visuelt kontrollert. PROFFDOK-VIDEO-1.0-rendereren er uendret.

Faktiske skjermbilder fra innlogget PR311 e3ced699, med identisk appkode på faa23f30. Bare eksisterende Demo medarbeider2/DEMO-årssamtale er brukt. Ett oppdiktet tiltak, eier og datoer ble bare vist i lokal kladd; Referat bekreftet20.11.2026/21.11.2026. Vanlig date-fill i testverktøyet satte først bare DOM-verdi; native feltvalg og ny readback bekreftet riktig React-utkast før de endelige scenene. Kladden ble fjernet med Fjern tiltak og tømt oppfølgingsdato; Referat viste ingen tiltak/ingen oppfølging og Lagre samtale var disabled før Lukk. Samtalen beholdt serverutgave4. Ingen serverlagring, sending, signering eller PDF utført. Espens reelle samtale er urørt.

Filmen viser eksisterende samtale, delte svar, samlet arbeidssteg, lokal oppfølging, referat og retur. Den er ikke full HR A–Å eller attest av opprettelse/lagring/bekreftelse/PDF. PR311s trestegsflyt må følge med ved release. PR308s Preview viser hjelpen separat og har ikke kopiert HR-kjernen.

Film: https://chatgpt.com/library?file_id=libfile_4420910e3f7481919e899f0fbfd5a50e&account_id=personal
Kilder: https://chatgpt.com/library?file_id=libfile_949632f3bac881919d15ed1e088adfea&account_id=personal

Sju tidligere metadataobjekter har JSON.stringify-SHA256b7f3bd3449dcb9d6a22b55548108dec21d399e14fbe7cc56b5c0cc867f35a7cf. Gamle originalvern beholdes. Avspillertesten omfatter alle åtte MP4/VTT, ingen autoplay, start/kapittel/seek/slutt, tekstalternativ, retur/fokus/kladd og revokasjon. Ny HR-film får fem bredder320/390/768/1363/1920 og kort skjerm; fysisk Safari er ikke attestert. Eksakt kandidat-CI/READY/binding/live føres i PR308. Rollback er revert av bare nytt filmtillegg/filtergren; ingen datareset/migrering. Ingen TEST OK/merge/Production.

## Faktisk avspilling og CI951-etterkontroll

42dcb985/tree95c963e9, dpl_5Q14n9uMKsYkMsQuqtUanvipSZm3 READY/eksaktSHA/fastalias. Ordinær eksisterende innlogging ble gjenbrukt på PR308, uten credentialkopiering. Hjelp viste ny film direkte under HR og inne i samme HR-tema. Faktisk MP4 viste106s/1920×1080/readyState4/paused=true/autoplay=false, VTTreadyState2. Kapittel0:44 ga currentTime44. Native videokontroll startet avspilling, og senere readback ga paused=false/currentTime94.8998. Alle ni tekststeg var til stede. Escape returnerte fokus til samme filmknapp i indeksen; videonoden var fjernet ved neste kontroll. Ny åpning fra HR-temaet og Tilbake til veiledningen returnerte til samme HR-tema/filmknapp/fokus. Til slutt Lukk panelet→Lukk hjelp ga0dialoger/0videoer og fokus på Hjelp. Ingen sending eller persondataendring.

CI951/run41963340431: åtte pakker PASS. App-browser kom gjennom alle åtte faktiske filmers avspilling/seek/kapitler/slutt/tekst/retur, samt nye HR-filmens fem bredder, før den nye søketesten stoppet. Rotårsaken er dokumentert renderkontrakt: kapittelsøk finner eiertemaet, som viser **alle** egne filmknapper. HR har nå to filmer, ikke én. Venteforventningen blir derfor2 både for Skill frist og det eksisterende prøvesamtalesøket; eksplisitte assertions krever én ny HR-film og én uendret prøvefilm. Ingen endring i app/filter/søkemotor eller lavere avspillings-/geometrikrav. Ny full CI kreves. Dette er ikke en fullgrønn CI951-attest.


## Revisjon2 – faktisk ny HR-tekstkontrakt

Alle9skjermbilder er tatt på nytt fra PR311/ddffddae, full CI959 SUCCESS9+gate og eksakt READY/Sandbox. Nye tellere viser10000/2000. Syntetisk Demo medarbeider2/eksisterende DEMO-årssamtale utgave4; lokal eksempeloppgave, eier, frist20.11 og oppfølging21.11 kontrollert i Referat. Ingen serverlagring/sending/bekreftelse/PDF under opptaket. Eksempeltiltak og oppfølgingsdato fjernet igjen, Referat viste Ingen tiltak/Ikke avtalt, Lagre disabled og Lukk ga0dialoger/samme rad. Datoene bygger på native tastaturendring og modellens Referat, ikke testverktøyets første DOM-only fill. Første ufullstendige datotømming ble korrigert før siste scene.

Godkjent PROFFDOK-VIDEO-1.0 renderer/tekster/durasjon/ni kapitler er beholdt. Scene06s klikkmål er kontrollert mot faktisk bilde (y795), fordi umiddelbar etterfølgende DOM-måling fulgte en senere fokusscroll. Ingen bildeinnhold er manipulert. Ny fil v2 er106s/1920×1080/H264/24fps/2544frames/uten lyd,5743761bytes, SHA256 cdfd8f3d415b60e65d482480c993adec078785d81dad5f2d7f17180e40854470. Full dekoding og scene-/klikkontroll PASS. Original v1 og alle sju tidligere filmer beholdes. VTT/kapittel-/tekstinnhold og tilgang er uendret; eksisterende guide-ID peker nå på v2. Aktuell film og kilder oppdateres med bevart filidentitet/versjonshistorikk. Siste kandidat-CI/READY/Sandbox og faktisk player/seek/tekst/retur må bekreftes i PR308 før ny sluttattest.

Dette er fortsatt det avgrensede samtale/tiltak/referat-kapitlet. Full opprettelse/lagring/utsending/partenes bekreftelser/PDF og full HR A–Å attesteres ikke av filmen. Produksjonsrelease av filmen krever PR311s stabile trestegsflyt og tekstutvidelse; ingen merge/TEST OK eller Production-endring. Rollback av Hjelp-pakken: guide-ID kan peke tilbake til bevart v1 ved behov, uten datainngrep; etter tekstutvidelsen foretrekkes korrigert v2-bildegrunnlag fremfor gamle feltgrenser.
