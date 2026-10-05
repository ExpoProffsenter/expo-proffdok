import React from "react";

const folder = "P:\\Expo ProffDok";
const jobFile = "ProffDok_Cordel_Jobbliste.txt";
const afgFile = "ProffDok_Cordel_Ordre.AFG";
const pickFile = "ProffDok_Cordel_Plukkliste.txt";

function Table({ headers, rows }) {
  return <div style={{ overflowX: "auto", margin: "12px 0" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
    <thead><tr>{headers.map((text) => <th key={text} style={{ padding: 10, borderBottom: "2px solid #b9d4da", background: "#edf7f8" }}>{text}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{row.map((text, col) => <td key={col} style={{ padding: 10, borderBottom: "1px solid #dbe7ea", verticalAlign: "top", overflowWrap: "anywhere" }}>{text}</td>)}</tr>)}</tbody>
  </table></div>;
}

function Picture({ name, alt, caption }) {
  return <figure style={{ margin: "18px 0" }}>
    <a href={`/help/cordel/${name}.svg`} target="_blank" rel="noreferrer" aria-label={`Åpne stort bilde: ${alt}`}>
      <img src={`/help/cordel/${name}.svg`} alt={alt} loading="lazy" style={{ display: "block", maxWidth: "100%", maxHeight: 540, width: "auto", height: "auto", border: "1px solid #cad8df" }} />
    </a>
    <figcaption style={{ fontSize: 13, lineHeight: 1.5, color: "#475569", marginTop: 7 }}>{caption} Trykk på bildet for større visning.</figcaption>
  </figure>;
}

export default function CordelGuide() {
  return <article data-cordel-guide="true" style={{ lineHeight: 1.65, overflowWrap: "anywhere" }}>
    <p><strong>A–Å-veiledning · oppdatert 04.10.2026</strong></p>
    <p>Overfør et akseptert tilbud direkte til en Cordel-ordre. ProffDok laster ned én ZIP med to filer. Importer jobblisten først og AFG-filen etterpå. Du trenger ikke opprette et tilbud i Cordel.</p>
    <p><strong>Daglig flyt:</strong> last ned → pakk ut i {folder} → åpne riktig tom ordre → importer jobbliste → importer AFG → kontroller jobber og sum. Engangsoppsettet gjøres av Cordelansvarlig.</p>

    <h3>A. Engangsoppsett: mappe og faste filer</h3>
    <ol>
      <li>Åpne Windows-filutforskeren i Cordel-miljøet. Opprett mappen <strong>{folder}</strong> hvis den ikke finnes.</li>
      <li>I Cordel Sky må filene flyttes fra den lokale PC-en til P:-stasjonen i Cordels eget Windows-miljø. Cordel må kunne se filene på denne stasjonen.</li>
      <li>Bruk alltid filnavnene nedenfor. Da gjenbrukes samme importdefinisjon for alle tilbud. Ingen ny definisjon eller endring av filsti per tilbud er nødvendig.</li>
    </ol>
    <Table headers={["Fil", "Brukes til"]} rows={[
      [jobFile, "Jobbnummer, beskrivelse og avtalt sum per jobb."],
      [afgFile, "Postinnhold, aksepterte priser og delsummer under hver jobb."],
      [pickFile, "Egen plukklisteflyt: varenummer, antall og leverandør."],
    ]} />
    <p>Filene skal ligge direkte i {folder}, uten en ekstra undermappe. Slå gjerne på visning av filendelser i Utforsker, slik at du ser forskjell på .txt, .AFG, .zip og .html.</p>

    <h3>B. Engangsoppsett: ordremetode for akseptert pris</h3>
    <p>Bruk en ordremetode med jobbliste. Den bekreftede testen brukte <strong>Jobbliste (veil. priser)</strong>. Be Cordelansvarlig gjøre de nødvendige innstillingene tilgjengelige som en egen ProffDok-metode, slik at ansatte kan velge denne ved opprettelse av ordre.</p>
    <ol>
      <li>Åpne ordren og gå til <strong>Økonomi → Kalkyle-spesifikasjon/Ordrebekreftelse</strong>.</li>
      <li>Velg <strong>Ordremetode</strong>. I vinduet <strong>Ajourhold ordre-parametre</strong>, åpne <strong>Priskalkyle (F3)</strong>.</li>
      <li>Sett feltene i tabellen nedenfor og velg <strong>Lagre</strong>. Kontroller at en ny ordre med valgt ProffDok-metode får de samme innstillingene.</li>
    </ol>
    <Table headers={["Felt", "Verdi for akseptert tilbud"]} rows={[
      ["Materiell → Standard Påslag", "0,00 %"],
      ["Avrunding → Priser", "Øre"],
      ["Avrunding → Beløp", "Øre"],
      ["Avrunding → Totaler", "Øre"],
    ]} />
    <p>Ordreparametrene ovenfor er bekreftet i testen. Lagring som en felles metodemal må gjøres av Cordelansvarlig i bedriftens oppsett; menyen for dette er ikke dokumentert i skjermbildene. Endring på én ordre er ikke bevis på at alle nye ordrer får de samme verdiene.</p>
    <Picture name="ordreparametere" alt="Cordel Priskalkyle med Standard Påslag og avrunding" caption="Historisk testbilde: Standard Påslag står her på 35,00 % og Totaler på Krone. For ProffDok skal disse feltene være 0,00 % og Øre. Priser og Beløp står allerede på Øre." />
    <p><strong>Prisgrunnlaget:</strong> ProffDok overfører kundens aksepterte salgspriser som ferdige rundsummer. Cordel behandler disse beløpene som materiell/selvkost. Reell innkjøpskost, arbeidstimer og fortjenestefordeling følger ikke med. Bruk derfor ikke denne importen som dokumentasjon av faktisk prosjektfortjeneste.</p>

    <h3>C. Engangsoppsett: importdefinisjon for jobbliste</h3>
    <ol>
      <li>Ha {jobFile} tilgjengelig i {folder} før definisjonen settes opp.</li>
      <li>I Cordel-ordren: åpne <strong>Generelt → Jobb-liste (F6) → Import</strong>.</li>
      <li>Gjenbruk den fungerende definisjonen, eller opprett én med navnet <strong>ProffDok – jobbliste</strong>.</li>
      <li>Under <strong>Generelt (F2)</strong>: bruk hele filstien <strong>{folder}\{jobFile}</strong>, semikolon som skilletegn og innlesing fra første datalinje. Filen har ingen overskriftsrad.</li>
      <li>Under <strong>Metode/språk (F3)</strong>: merk <strong>Les inn nye jobb fra fil</strong> og <strong>Oppdater eksisterende</strong>. La <strong>Slett ifølge fil</strong>, store bokstaver og tegnsettoversettingene være av. Filen bruker Windows ANSI, ikke DOS eller UTF.</li>
      <li>Under <strong>Kolonner (F4)</strong>: koble feltene som vist nedenfor. Velg <strong>Lagre Definisjon</strong>.</li>
    </ol>
    <Table headers={["Cordel-felt", "Kolonne i filen"]} rows={[
      ["Jobb", "1"], ["Beskrivelse", "2"], ["Prisberegning matr.", "3"], ["Fastpris materiell", "4"],
      ["Prisberegning arbeid", "5"], ["Fastpris arbeid", "6"], ["Sum fastpris", "7"],
    ]} />
    <p>Filen har et avsluttende tomt felt. Det skal ikke kobles til et ekstra Cordel-felt. Hele avtalt jobbsum ligger i Fastpris materiell; Fastpris arbeid er 0. Dette er prisoverføring, ikke en beregnet fordeling mellom arbeid og materialer.</p>
    <Picture name="jobbimport" alt="Metode og språk for import av jobber" caption="Bekreftet metodeoppsett for jobblisteimport. Nye jobber og oppdatering er på; sletting og tegnsettoversetting er av." />
    <Picture name="jobbkolonner" alt="Cordels feltnavn for jobblistekolonner" caption="Bruk feltene Jobb, Beskrivelse, Prisberegning matr., Fastpris materiell, Prisberegning arbeid, Fastpris arbeid og Sum fastpris." />

    <h3>D. For hvert tilbud: last ned fra ProffDok</h3>
    <ol>
      <li>Åpne det <strong>aksepterte eller aktiverte tilbudet</strong> i ProffDok. På ordinære prosjekter finnes eksporten også ved kontraktkortet i Avtalegrunnlag.</li>
      <li>Finn kortet <strong>Cordel-ordre</strong>. Kontroller saksreferanse, antall jobber/poster og akseptert sum eks. mva.</li>
      <li>Velg <strong>Last ned til Cordel</strong>. Du får <strong>ProffDok_Cordel.zip</strong> med {jobFile} og {afgFile}.</li>
      <li>Eksporten bruker det låste aksepterte tilbudet og valgte opsjoner. Ved melding om manglende grunnlag eller ulik totalsum skal saken avklares før import; kladden skal ikke brukes som erstatning.</li>
    </ol>

    <h3>E. Pakk ut og flytt filene til Cordel</h3>
    <ol>
      <li>Finn ZIP-filen i Nedlastinger. Høyreklikk og velg <strong>Pakk ut alle</strong>.</li>
      <li>Pakk ut eller kopier begge filene direkte til <strong>{folder}</strong> i Cordel-miljøet.</li>
      <li>Bekreft erstatning av de gamle eksportfilene når du behandler et nytt tilbud. Dette erstatter filene i mappen, ikke innhold i en Cordel-ordre.</li>
      <li>Kontroller at begge filene kommer fra samme nedlasting. Dersom flere ansatte bruker samme P:-mappe, må én person om gangen kopiere og importere; andre må ikke erstatte filene midt i importen.</li>
    </ol>
    <p>ZIP-filen kan få «(1)» i Nedlastinger uten at det er et problem. Filene inni ZIP-en har faste navn. Ikke importer ZIP-filen eller en lagret HTML-side i Cordel.</p>

    <h3>F. Åpne riktig tom ordre</h3>
    <ol>
      <li>Opprett ordren på vanlig måte, eller åpne riktig eksisterende ordre som ennå ikke inneholder jobber/prisposter.</li>
      <li>Velg den riktige kunden og kontroller ordrenummer og prosjekt. Bruk bedriftens ProffDok-ordremetode fra punkt B.</li>
      <li>Kontroller jobbliste, 0 % materiellpåslag og øreavrunding før import. Testkundene i bildene er kun eksempler.</li>
    </ol>
    <p>Den bekreftede flyten gjelder en tom ordre. En ordre med eksisterende arbeid, materiell, timer eller fakturering må avklares med Cordelansvarlig. Ikke slett eksisterende innhold eller importer samme tilbud på nytt som en prøve.</p>

    <h3>G. Import 1: opprett jobblisten</h3>
    <ol>
      <li>Velg <strong>Generelt → Jobb-liste (F6) → Import</strong>.</li>
      <li>Velg definisjonen <strong>ProffDok – jobbliste</strong>. Den leser allerede riktig fast filsti.</li>
      <li>Velg <strong>Aktivér (F12)</strong> i importvinduet én gang.</li>
      <li>Kontroller at jobber er nummerert fra <strong>1</strong> og at navn og jobbsummer stemmer med tilbudet. Sortering kan vise 1, 10, 11, 2 …; jobbnumrene er fortsatt riktige.</li>
    </ol>
    <Picture name="jobbliste" alt="Bekreftet jobbliste med jobbnummer, navn og fastpriser" caption="Bekreftet eksempel: F-2026-0053 har 11 jobber, med navn og avtalt sum per jobb. Arbeidsbeløp er 0 i denne importen." />

    <h3>H. Import 2: postinnhold, priser og delsummer</h3>
    <ol>
      <li>På samme ordre, gå til <strong>Økonomi → Kalkyle-spesifikasjon/Ordrebekreftelse</strong>.</li>
      <li>Velg <strong>Import → Anbud fra Grossist</strong>.</li>
      <li>Velg filen <strong>{folder}\{afgFile}</strong>. Kontroller at informasjonen gjelder det samme tilbudet som jobblisten.</li>
      <li>Bruk valgene i tabellen nedenfor. Velg <strong>Aktivér (F12)</strong> én gang.</li>
    </ol>
    <Picture name="importmeny" alt="Cordels importmeny med Anbud fra Grossist" caption="AFG-filen leses inn via Anbud fra Grossist. Jobblisten skal allerede være importert på denne ordren." />
    <Table headers={["Valg i AFG-importen", "Innstilling"]} rows={[
      ["Tilbuds-Spesifikasjon", "På. Kan være markert og låst/grått."],
      ["Kundeadresse / Vareadresse", "Av. Kunden er allerede valgt på ordren."],
      ["Stikkord/Prosjektnavn, Prosjekt-rabattmatrise og Tilbudets Notat", "Av."],
      ["Les akkordsatser fra fil", "Av."],
      ["Slett nåværende spesifikasjon før innlesing", "Av. Jobblisten fra import 1 skal beholdes."],
      ["Tarifftillegg og std.påslag", "Kan være på og låst/grått. Kontroller derfor 0 % materiellpåslag i ordremetoden."],
    ]} />
    <p>AFG alene oppretter ikke den nødvendige jobblisten i den bekreftede flyten. Derfor skal begge importene gjennomføres i denne rekkefølgen.</p>

    <h3>I. Sluttkontroll og timeføring</h3>
    <ol>
      <li>Åpne noen jobber og kontroller beskrivelse, prisposter og <strong>SUM JOBB</strong>.</li>
      <li>Gå tilbake til Jobb-liste (F6). Alle jobber og jobbsummer skal være bevart.</li>
      <li>Kontroller ordrenummer/kunde og totalsum eks. mva. mot det aksepterte tilbudet. Det skal ikke ligge ekstra samleposter som gjør beløpet dobbelt.</li>
      <li>Kontroller at riktig jobb kan velges ved timeføring. I den bekreftede testen kommer jobbeskrivelsen frem når jobb velges. Ikke registrer testtimer på et virkelig prosjekt.</li>
    </ol>
    <p><strong>Avsnitt i spesifikasjonen:</strong> Cordel kan vise overskriftene som «Avsnitt». Det er akseptert i denne flyten når jobbene samtidig finnes i Jobb-liste og kan brukes ved timeføring.</p>
    <Picture name="spesifikasjon" alt="Postinnhold, priser og SUM JOBB etter kombinert import" caption="Historisk, vellykket strukturtest med 11 jobber og 30 prisposter. Eksakt beløp er 402 164,10 eks. mva. Bildets Total-felt viser 402 164,00 fordi Totaler fortsatt var satt til Krone. Bruk Øre etter punkt B." />

    <h3>J. Egen flyt: eksport av plukkliste</h3>
    <p>Plukklisten bruker én ASCII-fil og trenger ikke jobbliste- eller AFG-importen ovenfor. Den overfører varenummer og antall, og bruker pris fra Cordels egen prisbok.</p>
    <ol>
      <li>I ProffDok: åpne Prissøk, velg eller skann varer, og kontroller antall. Gjenåpne lagret plukkliste på PC ved behov.</li>
      <li>Skriv gjerne Cordel-ordrenummer i plukklisten. Det er en påminnelse; filen velger ikke ordre automatisk.</li>
      <li>Velg <strong>Last ned til Cordel</strong> ved plukklisten og lagre filen som <strong>{folder}\{pickFile}</strong>.</li>
      <li>Åpne riktig ordre i Cordel. Bruk vanlig, godkjent ordremetode for denne vareføringen; 0 %-kravet ovenfor gjelder overføring av et akseptert tilbud.</li>
      <li>Velg <strong>Import → ASCII Fil</strong> i spesifikasjonen og gjenbruk en egen semikolondefinisjon <strong>ProffDok – plukkliste</strong>. Fast filsti: {folder}\{pickFile}. Ingen overskriftsrad eller tegnsettoversetting.</li>
      <li>Koble <strong>NR = 1, Mengde = 2, Fagområde = 3</strong>. Filen har ingen priser. Aktiver én gang og kontroller varer, antall, leverandør og Cordel-priser.</li>
    </ol>
    <p>Bruk riktig varenummer og leverandør. Manglende varenummer/leverandør eller ugyldig antall stopper eksporten. Hvis varen ikke finnes i Cordels prisbok, må varetreffet avklares før videre behandling.</p>

    <h3>K. Hvis noe ikke stemmer</h3>
    <Table headers={["Symptom", "Kontroller dette"]} rows={[
      ["Cordel finner ikke filen", "Kontroller filen i Cordels egen P:-stasjon, hele faste filstien og at filen ikke ligger i en ekstra undermappe."],
      ["Filen er .html", "Bruk Last ned til Cordel i ProffDok. En lagret nettside er ikke importfilen."],
      ["Priser er høyere enn i tilbudet", "Kontroller Materiell → Standard Påslag = 0,00 %. Ikke korriger hver prispost manuelt."],
      ["Et lite øreavvik i totalsum", "Kontroller Avrunding → Totaler = Øre, ikke Krone."],
      ["Bare postinnhold, ingen jobber ved timeføring", "Jobblisteimporten må være gjennomført først. Ikke kjør AFG en gang til som løsning."],
      ["Kun en samlepost MATERIELL per jobb", "Jobblisten er lest inn, men AFG med detaljinnhold mangler. Fullfør import 2 på samme ordre."],
      ["Dobbelt beløp eller doble poster", "Stopp og avklar innholdet med Cordelansvarlig. Ikke bruk Slett nåværende spesifikasjon som tilfeldig opprydding."],
      ["Konto eller flate poster uten jobbstruktur", "Kontroller at jobblistefilen ble lest inn i Jobb-liste (F6), og at spesifikasjonen ble lest som Anbud fra Grossist."],
      ["ProffDok stopper eksport på sum eller tekst", "Avklar det låste tilbudsgrunnlaget og meldingen. Ikke endre den aksepterte historikken eller bytt til en uakseptert kladd."],
    ]} />
    <p><strong>Huskeliste:</strong> riktig tilbud → samme nedlasting → faste filer i P: → riktig tom ordre → riktig metode → jobbliste → AFG uten sletting → kontroller jobber og eks. mva.-sum.</p>
  </article>;
}
