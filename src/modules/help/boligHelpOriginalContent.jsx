import React from "react";

// Each topic is editable on its own. Bodies preserve the established workflow text.
export const BOLIG_HELP_GROUPS = [
  {
    "id": "start",
    "title": "Kom i gang",
    "description": "Arbeidsrekkefølge, roller og finn tilbake."
  },
  {
    "id": "structure",
    "title": "Bygg og boliger",
    "description": "Struktur, kontakt og boligoversikt."
  },
  {
    "id": "packages",
    "title": "Rom, pakker og bilder",
    "description": "Standardleveranse, tilvalg og plantegninger."
  },
  {
    "id": "progress",
    "title": "Fremdrift og bemanning",
    "description": "Planer, ansvar og oversiktsliste ved tilsyn."
  },
  {
    "id": "people",
    "title": "Beboere og samarbeid",
    "description": "Portaler, meldinger og UE-tilgang."
  },
  {
    "id": "orders",
    "title": "Bestilling og levering",
    "description": "Vareutvalg, sending og varemottak."
  },
  {
    "id": "quality",
    "title": "Sjekklister og overtakelse",
    "description": "Kontroller, restpunkter, PDF og FDV."
  },
  {
    "id": "contracts",
    "title": "Kontrakter og økonomi",
    "description": "Private dokumenter, indeks og a konto."
  }
];

export const BOLIG_HELP_TOPICS = [
  {id:"start-start-med-en-bolig",group:"start",title:"Start med én bolig",body:(
    <p>Bruk «A–Å-veiledning for Boligprosjekter» for ett steg om gangen.
          Du kan ta én bolig i bruk først og deretter bruke samme oppsett på flere.</p>
  )},
  {id:"start-anbefalt-arbeidsrekkeflge",group:"start",title:"Anbefalt arbeidsrekkefølge",body:(
    <ol>
          <li><strong>Bygg og boliger:</strong> Opprett hovedprosjektet. Kontroller bygg, oppganger,
            etasjer og bolignumre før du fordeler innhold. Excel-import er foreløpig satt på vent.</li>
          <li><strong>Grunnpakker og tilvalg:</strong> Lag rom, avsnitt, varer og bilder.
            Prøv på én bolig før du fordeler til flere. Behold individuelle unntak.</li>
          <li><strong>Plan og kontroller:</strong> Lag arbeidsrekkefølge, ansvar og datoer under
            «Fremdrift og varsler». Bruk stammegrupper for boliger som følger samme arbeid.
            Fordel sjekklister og velg hvilke som er påkrevde.</li>
          <li><strong>Avklar og del:</strong> Legg inn beboerkontakt, avklar boligvalg og del avtalen.
            Gi UE og leverandører tilgang til funksjonene de trenger. Kontroller mottaker,
            innhold og sendingsstatus ved utsending.</li>
          <li><strong>Utfør og følg opp:</strong> Bestill varer, registrer leveringer og dokumenter
            arbeidet med sjekklister, bilder og avvik. Følg meldinger og frister underveis.</li>
          <li><strong>Overta fortløpende:</strong> Bruk «Løpende overtakelse» øverst i byggoversikten.
            Velg «Ferdigstilling av bygg», åpne boligen og vurder åpne forhold.
            Registrer faktisk overtakelse med dato og protokollreferanse. Restpunkter beholdes.</li>
          <li><strong>Dokumentasjon og økonomi:</strong> Ta ut PDF/ZIP for bolig, bygg eller prosjekt.
            Følg restpunktene til de er løst. Registrer a konto og indeks under
            «Kontrakter → Kontraktsøkonomi → Fakturert og a konto» når dette området er tatt i bruk.</li>
        </ol>
  )},
  {id:"start-roller-og-tilgang",group:"start",title:"Roller og tilgang",body:(
    <p>Prosjektleder styrer oppsett, vurderinger og overtakelse. Lesebrukere får innsyn.
          UE og leverandører bruker sin tildelte lenke; beboere bruker beboerportalen.
          Firmaets aktivering og den enkelte brukerens tilgang styrer hvem som får åpne modulen.
          Private kontrakter har i tillegg navngitt tilgang.</p>
  )},
  {id:"people-neste-steg-i-beboerportalen",group:"people",title:"Neste steg i beboerportalen",body:(
    <p>Beboeren ser firma, prosjekt og egen bolig øverst. «Neste steg» viser
          vei til en avtale som venter på svar, et innsendt valg eller tilgjengelige
          valgmuligheter. Knappen åpner riktig fane. Den sender eller aksepterer ingenting.</p>
  )},
  {id:"people-valg-avtaler-og-siste-status",group:"people",title:"Valg, avtaler og siste status",body:(
    <p>«Mine valg», «Avtaler», «Dokumenter» og «Meldinger» fungerer som før.
          Et valg sendes først til gjennomgang. En avtale aksepteres separat etter
          gjennomgang av varer, pris og svarfrist. Bruk «Hent siste status» ved behov.</p>
  )},
  {id:"people-boligoppgaver-pa-min-side",group:"people",title:"Boligoppgaver på Min side",body:(
    <p>På Min side vises «Prøv å hente oppgavene igjen» hvis boligoppgavene
          ikke kunne hentes. En tom eller feilende henting skal ikke tolkes som
          at alle oppgaver er ferdige. Manglende tilgang gir ikke innsyn i oppgaver.</p>
  )},
  {id:"progress-se-faktisk-bemanning",group:"progress",title:"Se faktisk bemanning",body:(
    <p>Prosjektleder åpner prosjektet → «Oppsett» → «Faktisk bemanning».
          Her vises registrert tilstedeværelse med navn, firma, inn- og uttid,
          valgt prosjektdag og rettingshistorikk. «Eksporter liste (CSV)» laster ned listen.</p>
  )},
  {id:"progress-aktiver-inn-og-utregistrering",group:"progress",title:"Aktiver inn- og utregistrering",body:(
    <p>Aktiver bemanning og legg til navngitte deltakere. Ansatte registrerer
          seg på Min side. UE bruker sin personlige lenke. Prosjektleder kan også
          registrere manuelt. Kontroller åpne registreringer fra tidligere dager.</p>
  )},
  {id:"progress-sett-opp-oversiktsliste-ved-tilsyn",group:"progress",title:"Sett opp oversiktsliste ved tilsyn",body:(
    <p>Velg «Oversiktsliste ved tilsyn» for byggeplassens elektroniske oversiktsliste.
          Åpne «Rediger byggeplass» og fyll inn adresse, byggherre og listefører.
          Legg deretter til virksomheter med organisasjonsnummer og personer med
          fødselsdato, arbeidsgiver, HMS-kort og arbeidsperiode. Innleide får også
          innleievirksomhet. En person trenger ingen appkonto.</p>
  )},
  {id:"progress-legg-til-personer-i-oversiktslisten",group:"progress",title:"Legg til personer i oversiktslisten",body:(
    <p>Under «Personer» kan du hente navngitte deltakere eller dagens manuelle
          registreringer. Fyll inn opplysningene som mangler og velg «Lagre endringer».
          Kladden holdes i minnet ved fanebytte. Lagre før du lukker eller laster siden på nytt.
          Disse personopplysningene vises ikke i UE- eller beboerportalen.</p>
  )},
  {id:"progress-bekreft-daglig-kontroll",group:"progress",title:"Bekreft daglig kontroll",body:(
    <p>Se over manglene under «Oversikt». Bekreft hver dag at opplysningene er
          riktige og at alle som skal arbeide på plassen er med. Velg «Bekreft daglig kontroll».
          En endring etter kontroll krever ny kontroll. Utfylte felt bekrefter ikke
          gyldig HMS-kort eller at virksomheten er kontrollert i et register.</p>
  )},
  {id:"progress-eksporter-oversiktslisten",group:"progress",title:"Eksporter oversiktslisten",body:(
    <p>Velg «Last ned oversiktsliste (PDF)» eller CSV ved tilsyn. Eksporten bruker
          lagrede opplysninger og merkes som utkast når kontroll ikke er bekreftet.
          «Historikk» viser tidligere lagrede versjoner. Registrer faktisk avslutningsdato
          under byggeplassen for å se minste oppbevaringstid. Del eksporten bare med
          dem som skal ha innsyn. Byggherren har ansvaret; føring kan delegeres skriftlig.
          Se <a href="https://www.arbeidstilsynet.no/hms/hms-i-bygg-og-anlegg/byggherreforskriften/elektroniske-oversiktslister/" target="_blank" rel="noopener noreferrer">Arbeidstilsynets veiledning om oversiktslister</a>.</p>
  )},
  {id:"people-gi-ue-og-leverandrer-tilgang",group:"people",title:"Gi UE og leverandører tilgang",body:(
    <p>
          Åpne «UE og leverandører» i prosjektet. Velg «Gi tilgang», fyll inn
          kontakt og bedrift og velg funksjonene kontakten får se. Tilgangen
          gjelder alle aktive leiligheter i prosjektet, også nye. Du trenger
          ikke velge leilighetene enkeltvis. UE får forslag om fremdrift og
          sjekklister med egen utfylling og vedlegg. Leverandør får forslag om
          fremdrift og bestillinger. Du kan endre forslagene. Ved bestillinger
          velger du leverandørnavnet som brukes på ordrene. Bare denne
          leverandørens bestilte varer deles, uten priser. Velg «Opprett
          tilgangslenke» når valgene er klare.
        </p>
  )},
  {id:"people-del-og-trekk-tilbake-tilgangslenker",group:"people",title:"Del og trekk tilbake tilgangslenker",body:(
    <p>
          Lenken gir tilgang til den som har den. Del den bare med kontakten du
          har valgt. Når lenken er opprettet, åpner du kontakten og velger
          «Send tilgangslenke». Mottakeren vises i samme vindu. Du kan åpne
          «Forhåndsvis e-post» først. Meldingen bruker appens vanlige e-postmal
          med firmalogo. Sendingsstatus og historikk vises under knappen.
          «Bekreftet av e-posttjenesten» betyr at tjenesten har tatt imot
          meldingen, ikke at mottakeren har åpnet den. Ved nettbrudd velger du
          «Prøv samme sending igjen». Lenken finnes bare i nettleseren der den
          ble opprettet; bruk denne nettleseren for utsending. I testmiljøet er
          e-post pauset, men forhåndsvisning og manuell deling fungerer.
          Tilgangen gjelder i
          valgt antall dager og kan stoppes med «Trekk tilbake tilgang». Ved
          endrede funksjoner: åpne kontakten og velg «Endre funksjoner». Samme
          lenke gjelder. Ved ny kontakt: trekk tilbake og opprett ny tilgang.
          Eldre lenker med enkeltutvalg beholder sitt opprinnelige omfang.
        </p>
  )},
  {id:"people-ue-fremdrift-og-leveranser",group:"people",title:"UE: fremdrift og leveranser",body:(
    <p>
          «Fremdrift» åpner et samlet Gantt-skjema. Pilene ved leilighetene
          viser aktivitetene. Velg dag, uke eller måned og søk i planen. Trykk
          på en aktivitet eller stolpe for detaljer og «Bekreft dato / meld
          avvik». Under «Leveranser» finnes samme svarknapp på ordren. Svarene
          vises i oppfølgingen. Endret grunnlag merker tidligere svar som
          historikk. Bekreftelsen registrerer ikke varemottak og flytter ingen
          datoer. Prosjektleder følger opp i eksisterende bestilling eller
          «Fremdrift og varsler». «Sjekklister» viser kontrollpunkter og status.
          Kontakten kan søke etter leilighet, adresse eller innhold.
        </p>
  )},
  {id:"people-ue-utfylling-og-vedlegg",group:"people",title:"UE: utfylling og vedlegg",body:(
    <p>
          For UE velger du «Tilgang til sjekklister»: Les, eller utfylling med
          vedlegg og bilder. Gamle leselenker får ikke skrivetilgang automatisk.
          UE åpner «Mine sjekklister og vedlegg». Start egen utfylling fra en
          prosjektliste, eller velg «Lag egen sjekkliste». Originalen beholdes.
          Velg plassering når du laster opp PDF, bilder, Word (.docx), Excel
          (.xlsx) eller tekstfiler. Hver fil kan være inntil 20 MB. Lagre filene
          før du velger dem på kontrollpunktet. «Lagre sjekkliste» lagrer
          svarene. Velg «Fullfør sjekklisten ved lagring» når alt er
          kontrollert. Prosjektleder finner filene og utfyllingen i den vanlige
          dokumentasjonen. Fullførte kontroller må gjenåpnes av prosjektleder
          før retting.
        </p>
  )},
  {id:"people-ue-finn-pagaende-og-fullfrte-sjekklister",group:"people",title:"UE: finn pågående og fullførte sjekklister",body:(
    <p>
          Sjekklistene viser «Pågående» først og «Neste sjekklister» etterpå.
          Når lagringen er bekreftet, flyttes en fullført liste til «Fullførte»
          nederst. Trykk på gruppen for å se tidligere kontroller. Tallet viser
          hvor mange lister gruppen inneholder. Søk etter leilighet, adresse
          eller navn for å finne både prosjektets og dine egne sjekklister.
        </p>
  )},
  {id:"progress-bruk-samlet-fremdriftsplan",group:"progress",title:"Bruk samlet fremdriftsplan",body:(
    <p>
          Samlet fremdriftsplan er hovedbildet. Grupper etter leilighet,
          stammegruppe eller arbeid/fag. Flere aktiviteter kan ligge på samme
          dag. Leilighetene står i rekkefølge etter adresse og bolignummer. Fold
          sammen grupper for oversikt. Trykk en stolpe for detaljer, dra for å
          flytte eller bruk Alt + piltast. «Se over datoendringer» viser
          resultatet før lagring. Aktivitetskort og «Ny aktivitet» finnes under
          «Aktivitetsliste og enkeltaktiviteter».
        </p>
  )},
  {id:"progress-lag-stammegrupper",group:"progress",title:"Lag stammegrupper",body:(
    <p>
          Velg «Velg leiligheter til stammegruppe» i byggbildet. Trykk boligene,
          også på forskjellige etasjer, og lagre et navn på utvalget. Gruppering
          endrer ingen datoer. En bolig kan tilhøre én stammegruppe. Flytting
          fra en annen gruppe må bekreftes. I masseoppsettet kan du velge lagret
          gruppe og bruke 0 dager mellom boligstarter for felles datoer.
        </p>
  )},
  {id:"progress-planlegg-flere-boliger",group:"progress",title:"Planlegg flere boliger",body:(
    <p>
          Mange boliger? Velg «Planlegg flere boliger». Filtrer på bygg, oppgang
          eller etasje og velg boligene. Sett første oppstart og dager mellom
          boligstarter. Velg startregel for hvert arbeid: etter forrige
          aktivitet, samtidig med boligstart eller et bestemt antall dager etter
          boligstart. Velg varighet og ansvarlig. «Forhåndsvis planen» viser
          alle datoene før du lagrer. Ukeregelen teller mandag–fredag eller alle
          dager. Juster helligdager selv. Samme oppsett kan brukes på neste
          utvalg. Inntil 400 aktiviteter lagres samlet.
        </p>
  )},
  {id:"progress-flytt-og-juster-datoer",group:"progress",title:"Flytt og juster datoer",body:(
    <p>
          «Åpne samlet tidslinje» bruker appens felles planlegger. Velg bolig,
          uke eller måned. Dra en aktivitet eller endene for å justere datoene.
          «Angre» gjelder ulagrede endringer. Se over og lagre datoendringene.
          «Flytt datoer samlet» flytter åpne aktiviteter i valgte boliger.
          Påbegynt og utført arbeid avklares enkeltvis. En avhengighet som
          brytes, stopper hele lagringen. Varsler som berøres av datoendringen,
          må oppdateres før ny publisering.
        </p>
  )},
  {id:"progress-opprett-og-flg-opp-aktiviteter",group:"progress",title:"Opprett og følg opp aktiviteter",body:(
    <p>
          Åpne «Fremdrift og varsler» i prosjektet eller boligen. Velg «Ny
          aktivitet», legg inn bolig, rom, datoer og ansvarlig, og velg «Lagre
          endringer». «Må utføres etter» knytter arbeidet til en annen aktivitet
          i samme bolig. Registrer faktisk start og slutt når arbeidet er gjort.
          Fra «Se åpne forhold» velger du «Oppfølging i fremdriftsplanen». Når
          saken har en aktivitet, åpner «Åpne aktivitet» det samme
          aktivitetsvinduet. Endre ansvarlig og frist, og lagre for å komme
          tilbake til saken. Aktivitetens ansvarlige får fristvarslene. Saken og
          vurderingsansvarlig endres ikke automatisk. Påkrevde aktiviteter må
          være utført før intern sluttkontroll kan godkjennes. Faktisk
          overtakelse vurderes separat av prosjektleder.
        </p>
  )},
  {id:"progress-lag-og-publiser-beboervarsel",group:"progress",title:"Lag og publiser beboervarsel",body:(
    <p>
          Velg «Nytt beboervarsel» under «Fremdrift og varsler». Velg hele
          prosjektet, et bygg, en oppgang eller bestemte boliger. Skriv
          meldingen, datoene og prosjektkontakten. Åpne «Kontaktperson på
          varslet» for å endre navn, telefon og e-post. Feltet holder seg åpent
          mens du skriver. Forhåndsvisningen viser firmalogo og innhold. «Lagre
          utkast» sender ingenting. «Last ned PDF / oppslag» lager en ferdig
          papirutgave uten krav om beboerens e-post. «Publiser til beboerne»
          publiserer eller planlegger varslet og bestiller e-post når utsending
          er aktivert. Alt gjøres i samme vindu. Endret kontakt eller
          aktivitetsgrunnlag krever en oppdatert utgave. «Trekk tilbake» stopper
          visning og ventende utsending; en allerede sendt e-post kan ikke
          trekkes tilbake.
        </p>
  )},
  {id:"progress-frister-og-e-postvarsler",group:"progress",title:"Frister og e-postvarsler",body:(
    <p>
          Åpne aktiviteter vises i planen. Når e-post er aktivert, får ansvarlig
          også oppfølging ved tildeling, to dager før planlagt slutt, på
          sluttdatoen og ukentlig etterpå. Ny mottaker, endret grunnlag,
          avsluttet arbeid eller bortfalt tilgang stopper gamle ventende
          varsler. I testfasen er automatisk publisering og e-post satt på
          pause. Status «akseptert av e-posttjenesten» betyr ikke at e-posten er
          mottatt eller lest.
        </p>
  )},
  {id:"people-les-og-behandle-beboermeldinger",group:"people",title:"Les og behandle beboermeldinger",body:(
    <p>
          En pulserende meldingsbrikke på boligen betyr ny melding. Trykk
          brikken for å åpne samtalen. En fast brikke betyr lest, men ikke
          ferdig behandlet. «Marker samtalen som lest» beholder oppfølgingen.
          Svar eller velg «Marker som behandlet» når saken er avklart. Et nytt
          svar fra beboeren gir ny markering. «Krever oppfølging» samler
          leilighetene i én innboks. Samtalen oppdateres mens siden er åpen;
          «Oppdater meldinger» henter status med en gang.
        </p>
  )},
  {id:"people-sla-beboermeldinger-av-eller-pa",group:"people",title:"Slå beboermeldinger av eller på",body:(
    <p>
          Under «Meldinger av/på» velger prosjektleder prosjektets standard og
          ansvarlig. Nye prosjekter starter med meldinger av. Valgte leiligheter
          kan arve innstillingen eller ha eget av/på-valg. Historikk og åpne
          oppfølginger beholdes ved avslåing. Beboeren får kontaktinformasjon.
          Fremdriftsvarsler, dokumenter, boligvalg og avtaler påvirkes ikke av
          dette valget.
        </p>
  )},
  {id:"people-e-postvarsel-om-beboermeldinger",group:"people",title:"E-postvarsel om beboermeldinger",body:(
    <p>
          Når e-posttransport er aktivert, samles raske meldinger i samme
          samtale i to minutter før varsling. Ansvarlig prosjektleder varsles om
          ny ulest beboermelding; beboeren varsles om svar. E-posten viser ikke
          meldingsteksten. Beboerens nye varslingslenke er personlig og varer
          høyst sju dager, aldri lenger enn portaltilgangen. Avslått dialog,
          endret kontakt, avklart melding eller bortfalt tilgang stopper
          ventende utsending. E-post er fortsatt av i Sandbox.
        </p>
  )},
  {id:"packages-finn-fasadebilder-og-plantegninger",group:"packages",title:"Finn fasadebilder og plantegninger",body:(
    <p>Åpne Oppsett → Bilder og plantegninger. Velg bygg for en fasade eller bolig for en plantegning. Du kan også velge Fasadebilde i byggoversikten og Plantegninger i boligens romoversikt.</p>
  )},
  {id:"packages-last-opp-og-plasser-bildefelt",group:"packages",title:"Last opp og plasser bildefelt",body:(
    <p>Last opp JPG, PNG eller WebP på inntil 12 MB. Eksporter en PDF-tegning som bilde først. Flytt forslagene til riktig sted, eller velg et felt og trykk i bildet. På mobil kan du også justere plasseringen med tallfeltene. Zoom for å se små felt.</p>
  )},
  {id:"packages-forhandsvis-og-lagre-bilder",group:"packages",title:"Forhåndsvis og lagre bilder",body:(
    <p>Velg Forhåndsvis endringer og deretter Lagre bilde og felt. Boliger og rom beholder sine ID-er, valg og historikk. Et bilde kan vise bare noen av rommene; de andre finnes fortsatt i romlisten. Legg til flere plantegninger for ulike etasjer.</p>
  )},
  {id:"packages-bildehistorikk-og-kladd",group:"packages",title:"Bildehistorikk og kladd",body:(
    <p>Bildehistorikk viser tidligere versjoner. Velg Rediger bilde og plassering for å flytte feltene eller bytte bildet. Endringene lagres først når du velger Lagre bilde og felt. Tidligere versjoner beholdes. Usendt kladd beholdes ved lukking og fanebytte.</p>
  )},
  {id:"structure-rediger-bygg-og-nummerer-boliger",group:"structure",title:"Rediger bygg og nummerer boliger",body:(
    <p>
          Åpne Oppsett → Bygg og boliger for å klargjøre flere boliger samtidig.
          «Rediger bygg» endrer navn, type, adresser og boligfordeling. Velg
          «Lagre endringer», se gjennom resultatet og velg «Bekreft og lagre».
          «Nummerer boliger» gir nummerforslag og samlet redigering. Offisielt
          bolignummer har et eget felt. Forhåndsvisningen viser resultatet før
          du velger «Bekreft og lagre».
        </p>
  )},
  {id:"packages-fordel-rom-og-pakker-til-flere-boliger",group:"packages",title:"Fordel rom og pakker til flere boliger",body:(
    <p>
          «Rom og pakker til flere boliger» lager en rommal med rompakker og
          valgfri fellespakke. Lagre malen for gjenbruk i prosjektet. Velg bygg,
          oppgang eller enkeltboliger og forhåndsvis før tildeling. Boliger med
          egne rom eller valg hoppes over som standard. Du kan velge å legge til
          manglende innhold; eksisterende rom, pakker og individuelle
          tilvalgspakker beholdes. Romkonflikter må vurderes på boligen.
        </p>
  )},
  {id:"structure-bygg-nytt-prosjekt",group:"structure",title:"Bygg nytt prosjekt",body:(
    <p>
          Velg «Bygg nytt prosjekt». Velg boligtype, legg inn bygg og adresser,
          og se over boligfordelingen før «Opprett prosjektforside». Navn og
          foreløpig boligstruktur er nok. Adresser og kontakter kan fylles inn
          senere. En enebolig registreres som én husstand, uansett etasjeantall.
        </p>
  )},
  {id:"structure-finn-bygg-og-filtrer-boliger",group:"structure",title:"Finn bygg og filtrer boliger",body:(
    <p>
          Bruk «Alle bygg» eller «Bytt bygg» for å finne riktig bygg. Lange
          blokker har oppgangsvelger og et oversiktsbånd. Søk finner boliger,
          adresser og kontaktpersoner på tvers av byggene. «Boligliste» viser
          alle boliger med kontakt og status. «Filtrer boliger» finner manglende
          valg, utkast som må gjennomgås og ufullstendig kontaktinfo. Filteret
          følger valgt statusområde. «Fasade» fjerner søk og filter og viser
          bygget igjen.
        </p>
  )},
  {id:"structure-kontakt-og-leilighetsinformasjon",group:"structure",title:"Kontakt og leilighetsinformasjon",body:(
    <p>
          Velg en bolig. Åpne «Leilighetsinformasjon» for å fylle inn navn,
          e-post og mobil. Adressen hentes fra oppgangen. Her kan du også rette
          leilighetsnummer og koble til et ordinært ProffDok-prosjekt. Opprett
          selve våtromsprosjektet gjennom vanlig prosjektopprettelse først.
          Koblingen kopierer ikke prosjektinnhold.
        </p>
  )},
  {id:"packages-legg-til-og-rediger-rom",group:"packages",title:"Legg til og rediger rom",body:(
    <p>
          Under «Rom og oversikt» velger du «Legg til rom». Velg type, navn og
          eventuell etasje. Flere bad får egne navn. «Rediger rom» lar deg rette
          opplysningene. Rom kan arkiveres og gjenopprettes uten å miste
          historikken. Ett ordinært prosjekt beholdes for hele boligen.
        </p>
  )},
  {id:"packages-lag-grunnpakker-og-tilvalgspakker",group:"packages",title:"Lag grunnpakker og tilvalgspakker",body:(
    <p>
          Åpne «Grunnpakker og tilvalgspakker» øverst i prosjektet → «Ny
          grunnpakke». Gi pakken navn. Velg «Legg til avsnitt» for Fliser,
          Baderomsinnredning, Dusjvegger eller egne navn. Legg varer i riktig
          avsnitt. Piltastknappene endrer rekkefølgen. Fjerner du et avsnitt,
          beholdes varene under «Uten avsnitt». Åpne innholdet ved behov. Legg
          inn varenummer og antall. Grunnpakken trenger ingen sum. Valgfri
          grunnsum per varelinje brukes bare som fratrekk ved et alternativ.
          Last opp bilde fra enheten, eller dra det inn på varen. «Ny
          tilvalgspakke» står ved siden av. Åpne en lagret pakke eller
          Tilvalgspakker og velg Rediger for å rette innholdet. Under
          Tilvalgspakker velger du Tillegg til eller Alternativ til en
          standardvare, med eller uten fratrekk. En tilvalgspakke kan inneholde
          flere varer og avsnitt. De velges samlet til én pakkepris. I
          bestillingsutkastet kan du fortsatt utelate enkeltvarer.
        </p>
  )},
  {id:"packages-velg-fellespakke-og-rompakke",group:"packages",title:"Velg fellespakke og rompakke",body:(
    <p>
          Velg «Alle rom» → «Velg fellespakke» for varer som gjelder hele
          boligen. Velg deretter et rom → «Velg rompakke». Den samme grunnpakken
          kan brukes i flere rom med egne tilvalgspakker i hvert rom. Kontroller
          pris, fratrekk og samlet innhold med «Forhåndsvis pakkevalg». Velg
          «Lagre pakkevalg» når det stemmer. Andre rom og tidligere versjoner
          beholdes.
        </p>
  )},
  {id:"packages-bruk-eldre-boligvalg",group:"packages",title:"Bruk eldre boligvalg",body:(
    <p>
          Eldre boligvalg kan fortsatt fordeles manuelt med «Legg innhold på
          rommet». Når rompakker tas i bruk, beholdes det eldre valget som
          fellespakke. Nye rompakker kommer i tillegg. Behold eller fjern
          fellespakken etter at du har sett over hele boliggrunnlaget. Uendret
          manuell romfordeling beholdes. I fellespakkevalget kan du også fjerne
          denne fordelingen og beholde varene felles i boligen.
        </p>
  )},
  {id:"orders-klargjr-vareutvalget",group:"orders",title:"Klargjør vareutvalget",body:(
    <p>
          Under «Klargjør varebestilling» er alle varelinjer valgt første gang.
          Fjern linjer som skal kjøpes andre steder. «Lagre og fortsett» lagrer
          utvalget uten å endre boligvalget. Varelinjene viser riktig rom. Ved
          nye pakkevalg beholdes utelatte, uendrede varer. Nye og endrede varer
          velges. Se over og bruk siste grunnlag før du lagrer. Utkastet er ikke
          sendt.
        </p>
  )},
  {id:"structure-finn-arbeidsomradet-for-boligen",group:"structure",title:"Finn arbeidsområdet for boligen",body:(
    <p>
          Velg en bolig. Høyrekolonnen har «Rom, grunnpakke og tilvalgspakker»,
          «Bestilling og levering», «Sjekklister og dokumentasjon» og
          «Ferdigstilling». Arbeidet åpnes i popup. Lukk og fortsett senere uten
          å miste kladden.
        </p>
  )},
  {id:"packages-tilpass-en-leilighet",group:"packages",title:"Tilpass én leilighet",body:(
    <p>
          Åpne «Rom, grunnpakke og tilvalgspakker». «Tilpass denne leiligheten»
          endrer varer og antall bare for valgt bolig og rom. Skriv begrunnelse,
          se over og lagre. Pakkeprisen endres bare hvis du skriver et
          pristillegg eller fratrekk. Gjenoppretting bruker pakkevalget før
          første tilpasning. En klargjort eller bestilt ordre må avklares før
          varegrunnlaget kan endres.
        </p>
  )},
  {id:"orders-se-leveranser-i-bygg-og-prosjekt",group:"orders",title:"Se leveranser i bygg og prosjekt",body:(
    <p>
          «Leveranser i bygget» og «Leveranser i prosjektet» viser faktiske
          ordrestatus per bolig. Tallene gjelder ordre, ikke ferdige boliger. Én
          bolig kan ha flere ordre.
        </p>
  )},
  {id:"quality-lag-og-fyll-ut-en-sjekkliste",group:"quality",title:"Lag og fyll ut en sjekkliste",body:(
    <p>
          «Sjekklister og dokumentasjon» har egne kontroller for boligen. Velg
          «Ny sjekkliste» for å bygge manuelt eller hente en publisert firmamal.
          Last opp bilder under «Filer og bilder» og knytt dem til
          sjekkpunktene. Lagre underveis. Velg «Fullfør kontrollen ved lagring»
          når listen er ferdig. Merk listen som påkrevd hvis den skal inngå i
          sluttkravene. Valgfrie lister gir påminnelser. Kritiske avvik stopper
          intern sluttgodkjenning. Mindre restpunkter følger med som «Klar med
          restpunkter» og tas med i sluttdokumentasjonen.
        </p>
  )},
  {id:"quality-fordel-sjekklister",group:"quality",title:"Fordel sjekklister",body:(
    <p>
          Velg «Fordel sjekklister» for å hente publiserte firmamaler fra
          sjekklistesentralen eller bruke egne prosjektlister. Velg boliger
          eller rom, se over fordelingen og velg «Bekreft og fordel». Hver
          mottaker får sin egen kontroll med tomme svar. Eksisterende kontroller
          og utfylte svar beholdes.
        </p>
  )},
  {id:"quality-last-ned-samlet-pdf-og-zip",group:"quality",title:"Last ned samlet PDF og ZIP",body:(
    <p>
          «Samlet PDF og ZIP» finnes under Sjekklister og dokumentasjon for
          bolig, bygg og prosjekt. Relevant fellesdokumentasjon følger med. Last
          ned samlet PDF eller ZIP med PDF, originale filer/bilder, lagrede
          kontrollutgaver, historikk og filmanifest. Ekstern FDV følger som
          lenker. Uferdig dokumentasjon kan også lastes ned; status og
          restpunkter vises tydelig. Nedlasting godkjenner ikke arbeidet.
        </p>
  )},
  {id:"quality-kontroller-og-last-ned-fdv",group:"quality",title:"Kontroller og last ned FDV",body:(
    <p>
          Legg FDV-lenker på varene i grunnpakker, tilvalgspakker og
          boligtilpasninger. «FDV» viser siste lagrede varevalg. «Rediger lenke»
          i boligen retter en dokumentlenke uten å endre gamle bestillinger.
          «Last ned FDV-oversikt» lager PDF med klikkbare lenker. Kontroller
          monterte varer før overlevering. Bygg og prosjekt samler boligenes
          varer. Eksterne dokumenter følger ikke PDF-en.
        </p>
  )},
  {id:"quality-registrer-ekstern-protokoll-og-retting",group:"quality",title:"Registrer ekstern protokoll og retting",body:(
    <p>
          Har kontrolløren en egen protokoll? Velg «Legg til protokoll» under
          «Ekstern protokoll». Last opp originalen, før inn merknadene og
          dokumenter rettingen. Du kan også velge en fil som allerede er lastet
          opp. Appen leser ikke merknadene automatisk fra PDF-en. «Bekreft
          retting» lagrer navn og tidspunkt. «Send bekreftelse på e-post» er
          valgfritt. «Bekreft og send» lar deg velge mottaker samtidig med
          bekreftelsen. Først lagres rettingsbekreftelsen, deretter ser du den
          ferdige e-posten og velger «Send bekreftelse». Ved uavklart svar
          bruker du «Prøv samme sending igjen». Tidligere protokoller og
          bekreftelser beholdes.
        </p>
  )},
  {id:"orders-sett-opp-leveringsadresse",group:"orders",title:"Sett opp leveringsadresse",body:(
    <p>
          Under Bestilling velger du «Leveringsoppsett». Lagre felles adresse
          for prosjektet, eller velg egen adresse for boligen. Bestilling og
          levering kan være samlet eller delt. Leverandørordrenummer er
          valgfritt og kan fylles inn senere.
        </p>
  )},
  {id:"orders-klargjr-bestilling",group:"orders",title:"Klargjør bestilling",body:(
    <p>
          «Klargjør bestilling» bruker det lagrede vareutvalget. Velg
          leverandør, Vårt ordrenummer og eventuell ønsket leveringsdato. Se
          over og velg «Lagre og gå til sending». E-postdialogen åpnes direkte.
          Delt bestilling lar deg velge varer i flere omganger. Et klargjort
          grunnlag er ikke en bestilt ordre.
        </p>
  )},
  {id:"orders-send-bestilling-med-vedlegg",group:"orders",title:"Send bestilling med vedlegg",body:(
    <p>
          Prosjektleder sender bestillingen fra «Send bestilling». Oppgi
          leverandørens e-postadresse og kontroller bestillingsopplysningene.
          Kontroller e-post og de to vedleggene: Cordel ASCII og Excel. Begge
          har samme varer og antall. Klikk «Send bestilling med to vedlegg» når
          alt stemmer. Ved uklart svar bruker du samme sending igjen. Bestilt
          betyr at e-posttjenesten har bekreftet sendingen, ikke at leverandøren
          har bekreftet ordren.
        </p>
  )},
  {id:"orders-registrer-bestilling-og-varemottak",group:"orders",title:"Registrer bestilling og varemottak",body:(
    <p>
          Er ordren lagt på annen måte, bruker du «Registrer som bestilt». Under
          «Registrer varemottak» skriver du mengden som kom nå. «Fyll inn alt
          som gjenstår» foreslår resten. En korrigering bruker negativ mengde og
          en forklaring. Historikken beholdes. Endret boligvalg etter faktisk
          bestilling må avklares før nye bestillinger.
        </p>
  )},
  {id:"people-klargjr-beboeraksept",group:"people",title:"Klargjør beboeraksept",body:(
    <p>
          Åpne «Endringer og beboeraksept» i boligen. «Klargjør beboeraksept»
          bruker boligens lagrede varer og tilvalgspris. Beskriv grunnlaget, og
          kontroller varer og pris i samme vindu. Velg «Lagre utkast» for å
          fortsette senere, eller «Opprett beboerlenke» når det er klart. Send
          med «Send beboerlenke» i avtalevinduet, eller del lenken med riktig
          beboer. Lenken varer i 30 dager. «Opprett beboerlenke» sender ingen
          e-post automatisk. Beboeren gjennomgår pris og varer, oppgir navn og
          bekrefter svaret i to trinn. Kvitteringen viser den aksepterte
          utgaven. Dette er en lenkebasert beboerbekreftelse.
        </p>
  )},
  {id:"orders-endringsordre-og-leverandroppflging",group:"orders",title:"Endringsordre og leverandøroppfølging",body:(
    <p>
          «Ny endringsordre» lar deg velge bestillingen som endres. Samle alle
          vareendringene i samme kladd og angi samlet pristillegg eller fratrekk
          inkl. mva. Kontroller «Før» og «Etter» før du oppretter beboerlenken.
          Den opprinnelige bestillingen beholdes. Når beboeren har akseptert,
          avklarer du endringen med leverandøren og registrerer hvem som
          bekreftet og hvor endringen er bestilt eller kreditert. «Last ned
          endringsbestilling / kreditering» gir Excel med bare forskjellene.
          Pluss er tillegg. Minus er reduksjon som må avklares med leverandøren.
          Velg «Registrer leverandøroppfølging», fyll ut referanse og
          bekreftelse og velg «Bekreft og oppdater leveransen». Da oppdateres
          mottaksgrunnlag og FDV, mens tidligere mottak følger riktig vare.
          Originalbestillingen beholdes under historikk. Uavklart oppfølging
          vises som et åpent forhold ved overtakelsesvurderingen og stopper
          intern sluttgodkjenning. Beboerens svar alene sender ingen bestilling.
        </p>
  )},
  {id:"people-boligavtale-og-tidligere-utgaver",group:"people",title:"Boligavtale og tidligere utgaver",body:(
    <p>
          «Gjeldende boligavtale» viser én hovedavtale. Tidligere utgaver ligger
          under «Avtalehistorikk». Etter aksept brukes endringsordre for nye
          endringer. «Lag ny utgave» beholder tidligere utgaver. En gyldig
          publisert eldre utgave kan fortsatt aksepteres. Når én utgave er
          akseptert, sperres de andre uavklarte utgavene i samme avtalerekke.
          «Tilbakekall utgaven» sperrer en uavklart lenke. Et registrert svar
          endres gjennom en ny avtale. Ved uavklart lagring bruker du «Prøv
          samme lagring igjen». Lukk dialogen for å beholde kladden; velg
          «Fortsett kladd» når du vil arbeide videre.
        </p>
  )},
  {id:"quality-sluttkontroll-og-vurdering-av-apne-forhold",group:"quality",title:"Sluttkontroll og vurdering av åpne forhold",body:(
    <p>
          Åpne «Ferdigstilling» i boligen → «Opprett kontrollplan». «Samlet
          gjennomgang» viser lagrede kontroller, avvik, filer og FDV. Bekreft
          gjennomgangen og legg til notat ved behov. De faste kontrollområdene
          gjennomgås samlet; «Vis kontrollpunkter» åpner detaljene. Egne ekstra
          kontrollpunkter følges opp hver for seg. «Godkjenn intern
          sluttkontroll» krever at påkrevde forhold og kritiske avvik er
          avklart. Mindre restpunkter gir «Klar med restpunkter». Dette gjelder
          intern sluttkontroll. «Vurder åpne forhold og overtakelse» samler
          mangler, aktiviteter, godkjenning og ubehandlede meldinger.
          Prosjektleder vurderer hvert forhold som hinder eller videre
          oppfølging, med begrunnelse og ansvarlig. Kritiske forhold bekreftes
          enkeltvis. «Registrer overtagelse» viser til en allerede gjennomført
          protokoll. Dette er intern registrering, ikke en digital signatur.
        </p>
  )},
  {id:"quality-lpende-overtakelse",group:"quality",title:"Løpende overtakelse",body:(
    <p>
          «Løpende overtakelse» ligger øverst i byggoversikten, før fasaden.
          Tellingen gjelder valgt bygg. «Gjenstår» betyr boliger uten registrert
          faktisk overtakelse; «Overtatt» betyr at overtakelsen er registrert.
          Ved «Alle bygg» gjelder tellingen hele prosjektet.
          «Ferdigstilling av bygg» åpner boliglisten med «Alle boliger»,
          «Gjenstår» og «Overtatt». «Ferdigstilling av prosjekt» samler hele
          prosjektet. En bolig kan overtas mens andre fortsatt er under arbeid.
          Avklar også egne fellesarbeider, eller velg «Ingen egne
          fellesarbeider». Notat er valgfritt. Ferdige boliger alene er ikke
          nok. Endret arbeids- eller dokumentgrunnlag krever ny godkjenning, men
          tidligere kontrollbeskrivelser beholdes. En faktisk overtakelse
          registrert gjennom prosjektleders vurdering beholdes også ved senere
          endringer. Åpne forhold skal følges opp videre. Registrering av
          underliggende overtagelser krever ikke ny gjennomgang av uendret
          arbeid. «Gjenåpne med begrunnelse» beholder tidligere godkjenninger og
          overtagelser i historikken. Usendt kontrollbeskrivelse beholdes når du
          lukker vinduet.
        </p>
  )},
  {id:"structure-koble-bolig-til-ordinrt-prosjekt",group:"structure",title:"Koble bolig til ordinært prosjekt",body:(
    <p>
          I «Leilighetsinformasjon» lagrer du med «Lagre endringer». Boligen
          hører allerede til boligprosjektet. «Koble til et eget prosjekt
          (valgfritt)» brukes bare hvis leiligheten også har et separat
          ProffDok-prosjekt. Du trenger ikke koble til noe for å bruke Bolig.
        </p>
  )},
  {id:"start-lagring-og-konflikt",group:"start",title:"Lagring og konflikt",body:(
    <p>
          Vent på «Endringene er lagret». Andre med tilgang kan hente samme
          struktur. Hvis noen har endret strukturen, beholdes din kladd. Hent
          siste versjon og se over før ny lagring.
        </p>
  )},
  {id:"structure-arkiv-og-synlighet",group:"structure",title:"Arkiv og synlighet",body:(
    <p>
          Åpne Oppsett → Arkiv og synlighet for å skjule/gjenopprette byggdeler.
          Færre etasjer skjuler overskytende boliger og bevarer ID-er, kontakt
          og prosjektkobling.
        </p>
  )},
  {id:"start-finn-tilbake-til-prosjektet",group:"start",title:"Finn tilbake til prosjektet",body:(
    <p>
        Start i prosjektoversikten. Velg «Bygg nytt prosjekt», fortsett en
        kladd, eller åpne et av firmaets prosjekter. «Prosjektoversikt» tar deg
        tilbake uten å fjerne usendt arbeid. En ny åpning starter her.
        «Hovedside» viser bygg og boliger i prosjektet du har valgt.
      </p>
  )},
  {id:"people-inviter-beboer-og-trekk-tilbake-portaltilgang",group:"people",title:"Inviter beboer og trekk tilbake portaltilgang",body:(
    <p>
        Åpne «Beboerportal» i boligen. Legg til grunnpakken og ønskede
        valgmuligheter. «Klargjør invitasjon» viser kontakt og innhold før du
        lager en personlig lenke. Send invitasjonen fra samme vindu med «Send
        beboerlenke», eller kopier invitasjonen og del den gjennom deres vanlige
        e-postkanal. E-post sendes først når du trykker «Send beboerlenke».
        «Klargjør påminnelse» bruker samme lenke. Lenken varer i 30 dager.
        «Tilbakekall portaltilgang» stenger den. Ny kontakt krever ny lenke.
      </p>
  )},
  {id:"people-behandle-innsendte-boligvalg",group:"people",title:"Behandle innsendte boligvalg",body:(
    <p>
        Beboeren sender et valg til gjennomgang. Se varer og pris under
        «Innsendte valg». «Bruk valget i avtalegrunnlaget» lagrer nytt boligvalg
        før en avtale er delt eller varer bestilt. Klargjør deretter avtalen
        under «Endringer og beboeraksept». Ved senere endringer bruker du
        endringsavtalen. En akseptert avtale vises som kvittering.
      </p>
  )},
  {id:"people-del-dokumenter-og-meldinger",group:"people",title:"Del dokumenter og meldinger",body:(
    <p>
        Del dokumentlenker og skriv meldinger under «Beboerportal». Bare det som
        deles her blir tilgjengelig for beboeren. Meldinger og svar leses i
        portalen. Automatisk e-postvarsling og deling av private prosjektfiler
        inngår ikke i denne versjonen.
      </p>
  )},
  {id:"contracts-private-kontrakter-og-dokumentgjennomgang",group:"contracts",title:"Private kontrakter og dokumentgjennomgang",body:(
    <p>
        «Kontrakter» samler private originaler for hovedprosjektet.
        Prosjektoppretteren med prosjektledertilgang starter området og velger
        navngitte personer under «Tilgang». «Last opp dokument» lagrer en ny
        original. Bruk «Ny versjon» når samme dokument endres. «Versjoner»
        beholder tidligere utgaver. PDF, JPG og PNG støttes. Kontraktene deles
        ikke gjennom eksterne lenker eller vanlig FDV/sluttpakke. Opplasting
        innebærer ingen kontraktsaksept. «Les og gjennomgå kontrakter» åpner
        tekstsøk og gjennomgang. Velg «Gjør søkbar» for å lese tekst fra en fil.
        Kontroller usikre sider mot originalen. Under «Gjennomgang» velger du
        tekstutgaver og eventuelt et spørsmål. Funnene er forslag med dokument,
        versjon og side. Åpne kildesiden før du bruker et funn. Ingen avtale eller
        oppgave endres automatisk. Opplastingskladden beholdes i nettleserøkten; ikke last siden
        på nytt før filen er bekreftet lagret.
        AI-baserte funn krever at analysetjenesten er tilgjengelig. Full
        automatisk kontroll av store kontrakter er fortsatt under utprøving;
        bruk originalene og tekstsøket som grunnlag for egen gjennomgang.
      </p>
  )},
  {id:"contracts-kontraktssum-og-vilkar",group:"contracts",title:"Kontraktssum og vilkår",body:(
    <p>
        Under «Kontrakter → Kontraktsøkonomi → Kontraktssum og vilkår» lagrer du opprinnelig
        grunnleveranse og opsjoner ekskl. mva., avtalt indeks, basismåned og
        eventuell reduksjonsfaktor. Kryss av hvilke deler som reguleres.
        Bruk opprinnelige beløp fra basismåneden.
      </p>
  )},
  {id:"contracts-fakturert-og-a-konto",group:"contracts",title:"Fakturert og a konto",body:(
    <p>
        «Fakturert og a konto» brukes når du registrerer periodens fakturering.
        Oppgi fakturadato og a konto-beløp. Indeksberegningen bruker tilgjengelig
        publisert indeks på fakturadatoen. For eldre datoer uten sikker
        publiseringshistorikk må indeksmåneden bekreftes. Kontroller grunnlaget
        før du trykker «Lagre». A konto og indeks lagres som separate
        fakturalinjer med én lagring. Fakturanummer kan stå tomt og fylles inn
        senere via «Fakturaoversikt → Rediger», uten at beløpet telles to ganger.
        Oversikten skiller fakturert a konto fra fakturert indeksregulering.
        Fakturert betyr ikke betalt. Appen sender eller bokfører ikke fakturaene.
      </p>
  )},
  {id:"contracts-indeksregulering-mot-byggherre",group:"contracts",title:"Indeksregulering mot byggherre",body:(
    <p>
        «Indeksregulering mot byggherre» kan også vise beregning på hele
        kontraktsgrunnlaget og tidligere godkjente beregninger. Disse teller
        ikke som fakturert. Kontraktsøkonomi endrer ikke beboerprisene automatisk.
      </p>
  )},
];
