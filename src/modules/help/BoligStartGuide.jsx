import React, { useState, useRef } from "react";
import Dialog from "../bolig/BoligEditorDialog.jsx";
const steps = [
  {
    title: "Bygg prosjektet",
    where: "Prosjektoversikt → Bygg nytt prosjekt",
    text: "Velg bygningstype. Legg inn bygg, oppganger, etasjer og antall boliger per etasje. Kontroller forhåndsvisningen før du oppretter.",
    recommend:
      "Start med riktig boligstruktur. Gi byggene navn du kjenner igjen ute på byggeplassen.",
    later:
      "Adresser og kontaktpersoner kan legges til senere. Du kan lagre oppsettet som kladd.",
    next: "Åpne prosjektet og kontroller boligene i byggbildet.",
    image: "bygg-prosjekt.webp",
    alt: "Eksempel fra prosjektbyggeren med valg av bygningstype.",
  },
  {
    title: "Lag grunnpakken",
    where: "Grunnpakker og tilvalgspakker → Grunnpakker",
    text: "Lag rom og avsnitt, for eksempel fliser, innredning og dusj. Legg inn varer, bilder, varenummer og antall som inngår i standardleveransen.",
    recommend:
      "Bygg én gjennomarbeidet grunnpakke før du fordeler den. Grunnpakken kan være uten salgssum når den inngår i hovedentreprisen.",
    later:
      "Tilvalg og individuelle unntak kan komme etterpå. Kontroller rominnholdet før bestilling.",
    next: "Lag tilvalgspakkene som skal være tilgjengelige.",
  },
  {
    title: "Lag tilvalg og fordel",
    where: "Grunnpakker og tilvalgspakker → Tilvalgspakker → Boligvalg",
    text: "Sett opp alternativ til standardvaren eller tillegg til grunnpakken. Fordel felles oppsett til flere boliger. Åpne én bolig når du skal gjøre et individuelt unntak.",
    recommend:
      "Bruk felles pakker for det som er likt. Kontroller både tillegg og eventuelt fratrekk når standardvarer erstattes.",
    later:
      "Beboerkontakt og deling av tilbud kan vente til innholdet er klart.",
    next: "Kontroller varevalg og antall i én eksempelbolig før du bruker samme oppsett på resten.",
  },
  {
    title: "Planlegg mange boliger samlet",
    where:
      "Byggbildet → Velg leiligheter til stammegruppe → Fremdrift og varsler",
    text: "Velg boliger som følger samme arbeid, også på forskjellige etasjer. Lagre en stammegruppe. I «Planlegg flere boliger» velger du gruppen, oppstart, aktiviteter og ansvarlige.",
    recommend:
      "Bruk 0 dager mellom boligstarter når stammen går samlet. Velg samtidig start for aktiviteter som kan skje samme dag. Se over planen før lagring.",
    later:
      "Enkeltboliger kan ha egne datoer. Gruppene bestemmes av deg; bolignummeret bestemmer ikke fremdriften.",
    next: "Kontroller Gantt-planen. Klikk en stolpe for detaljer, og bruk «Se over datoendringer» før du lagrer flytting.",
    image: "fremdrift.webp",
    alt: "Samlet Gantt-plan med flere aktiviteter og boliger på samme datoakse.",
  },
  {
    title: "Velg kontakt og beboerdialog",
    where: "Bolig → Leilighetsinformasjon / Beboerportal",
    text: "Legg til én kontaktperson per bolig. Klargjør portal og eventuelle tilbud når innholdet er kontrollert. Meldinger kan slås på for hele prosjektet eller bare enkelte boliger.",
    recommend:
      "Start med meldinger av. Aktiver dialog der det er nyttig, og avklar hvem som følger opp innboksen.",
    later:
      "Det er mulig å bruke prosjektet uten beboermeldinger. Når meldinger slås av, beholdes tidligere samtaler.",
    next: "Følg meldingsbrikken i byggbildet. «Lest» betyr at meldingen er sett; «Behandlet» betyr at oppfølgingen er avklart.",
    image: "byggoversikt.webp",
    alt: "Byggoversikt med boliger som kan åpnes og følges opp hver for seg.",
  },
  {
    title: "Bestill, utfør og dokumenter",
    where:
      "Bolig → Bestilling / Levering / Fremdrift og varsler / Ferdigstilling",
    text: "Kontroller varelinjene før bestilling. Registrer leveringer og faktisk utført arbeid separat. Fordel relevante sjekklister til flere boliger eller rom, og samle bilder, avvik og sluttdokumentasjon underveis.",
    recommend:
      "Bruk samme kontrolloppsett der arbeidet er likt. Velg bevisst hvilke kontroller som er påkrevde. Varemottak alene betyr ikke at arbeidet er utført.",
    later:
      "Uferdige kontroller og restpunkter forblir synlige. De skal ikke krysses av bare for å komme videre.",
    next: "Gå til ferdigstilling og gjennomgå åpne forhold før overtakelse.",
  },
  {
    title: "Vurder overtakelsen",
    where: "Ferdigstilling → Vurder åpne forhold og overtakelse",
    text: "Se manglende kontroller, avvik, uferdige aktiviteter, intern godkjenning og ubehandlede beboermeldinger i samme oversikt. Vurder om hvert forhold hindrer overtakelse eller skal følges opp.",
    recommend:
      "Gi hvert restpunkt en begrunnelse og oppfølgingsansvarlig. Vanlige forhold kan vurderes samlet; kritiske forhold må vurderes og bekreftes enkeltvis.",
    later:
      "Intern sluttkontroll kan fortsatt stå uferdig selv om en faktisk overtakelse er gjennomført. Vurderingen ferdigmelder ingen saker.",
    next: "Lagre bare vurderingen, eller velg «En overtakelse som er gjennomført» og oppgi faktisk dato og protokollreferanse.",
    image: "overtakelse.webp",
    alt: "Prosjektleders gjennomgang av åpne forhold før registrering av overtakelse.",
  },
  {
    title: "Lever dokumentasjon og følg opp",
    where: "Sjekklister og dokumentasjon → Samlet PDF og ZIP",
    text: "Ta ut dokumentasjonen per bolig, bygg eller prosjekt. PDF-en viser status og prosjektleders vurderinger. ZIP-en inneholder også de lagrede originalfilene og historikken. Ekstern FDV følger som lenker.",
    recommend:
      "Kontroller at dokumentasjonen svarer til det som faktisk er montert. Følg restpunktene til de er løst, også etter overtakelsen.",
    later:
      "Ny dokumentasjon eller nye saker etter overtakelsen vises som videre oppfølging. Registreringen av den gjennomførte overtakelsen beholdes.",
    next: "Bruk aktivitetenes frister og varsler for videre oppfølging. Nedlasting av dokumentasjon endrer ingen status.",
  },
];
export default function BoligStartGuide() {
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0),
    [image, setImage] = useState(false);
  const article = useRef(null);
  const choose = (i) => {
    setStep(i);
    setImage(false);
    requestAnimationFrame(() =>
      article.current?.scrollIntoView({ block: "start" }),
    );
  };
  const s = steps[step];
  return (
    <>
      <button
        type="button"
        className="bolig-start-guide-button"
        onClick={() => {
          setStep(0);
          setImage(false);
          setOpen(true);
        }}
      >
        A–Å-veiledning for Boligprosjekter
      </button>
      {open && (
        <Dialog
          title="A–Å-veiledning for Boligprosjekter"
          onClose={() => {
            setOpen(false);
            setImage(false);
          }}
        >
          <div className="bolig-start-guide">
            <p className="bolig-guide-intro">
              En god start sparer mange klikk senere. Følg den anbefalte
              rekkefølgen, og fyll på mer informasjon når du trenger den.
              Veiledningen lagrer eller endrer ikke prosjektet.
            </p>
            <nav aria-label="Steg i boligveiledningen">
              {steps.map((s, i) => (
                <button
                  type="button"
                  key={s.title}
                  aria-current={step === i ? "step" : undefined}
                  onClick={() => {
                    choose(i);
                  }}
                >
                  <span className="bolig-guide-step-number">{i + 1}</span>
                  <span className="bolig-guide-step-title">{s.title}</span>
                </button>
              ))}
            </nav>
            <article ref={article} key={step} aria-live="polite">
              <small>
                STEG {step + 1} AV {steps.length}
              </small>
              <h3>{s.title}</h3>
              <p className="bolig-guide-where">{s.where}</p>
              <p>{s.text}</p>
              {s.image && (
                <figure>
                  <button
                    type="button"
                    onClick={() => setImage(true)}
                    aria-label="Forstørr eksempelbildet"
                  >
                    <img
                      src={`/bolig/guide/${s.image}`}
                      alt={s.alt}
                      loading="lazy"
                    />
                  </button>
                  <figcaption>
                    Illustrasjon fra appen med fiktive eksempeldata. Trykk for
                    større bilde.
                  </figcaption>
                </figure>
              )}
              <div className="bolig-guide-recommend">
                <strong>Anbefalt løsning</strong>
                <p>{s.recommend}</p>
              </div>
              <div>
                <strong>Dette kan vente</strong>
                <p>{s.later}</p>
              </div>
              <div className="bolig-guide-next">
                <strong>Gjør dette etterpå</strong>
                <p>{s.next}</p>
              </div>
            </article>
            <footer>
              <button
                type="button"
                disabled={step === 0}
                onClick={() => {
                  choose(step - 1);
                }}
              >
                Forrige steg
              </button>
              <span>
                {step + 1} / {steps.length}
              </span>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    choose(step + 1);
                  }}
                >
                  Neste steg
                </button>
              ) : (
                <button type="button" onClick={() => setOpen(false)}>
                  Tilbake til prosjektet
                </button>
              )}
            </footer>
          </div>
          {image && (
            <Dialog
              title="Eksempel fra boligveiledningen"
              onClose={() => setImage(false)}
            >
              <img
                className="bolig-guide-full-image"
                src={`/bolig/guide/${s.image}`}
                alt={s.alt}
              />
            </Dialog>
          )}
        </Dialog>
      )}
    </>
  );
}
