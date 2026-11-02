import React, { useState, useRef } from "react";
import Dialog from "../bolig/BoligEditorDialog.jsx";
import BoligGuidePanel from "./BoligGuidePanel.jsx";
const steps = [
  {
    "title": "Bygg prosjektet",
    "where": "Prosjektoversikt → Bygg nytt prosjekt",
    "text": "Velg bygningstype. Legg inn bygg, oppganger, etasjer og antall boliger per etasje. Kontroller forhåndsvisningen før du oppretter.",
    "recommend": "Start med riktig boligstruktur. Gi byggene navn du kjenner igjen ute på byggeplassen.",
    "later": "Adresser og kontaktpersoner kan legges til senere. Du kan lagre oppsettet som kladd.",
    "next": "Avklar interne brukerroller og tilgang før du fordeler ansvar.",
    "image": "bygg-prosjekt-v2.webp",
    "alt": "Eksempel fra prosjektbyggeren med valg av bygningstype."
  },
  {
    "title": "Avklar interne roller",
    "where": "Systemadmin → Firmaer og prosjekter / Firmaadministrasjon → Boligprosjekter",
    "text": "Systemadmin aktiverer modulen for firmaet. Firmaadmin gir den enkelte ansatte Lesetilgang eller Prosjektledertilgang. En vanlig firmarolle gir ikke automatisk tilgang til Boligprosjekter. Eksterne samarbeidspartnere får egne lenker senere.",
    "recommend": "Avklar hvem som er prosjektleder og hvem som bare skal lese. Kontroller at riktig arbeidsfirma er valgt. HR er inkludert ved aktiv Bolig-tilgang, men innsyn i personalopplysninger følger egne HR-rettigheter.",
    "later": "UE-, leverandør- og beboertilgang kan vente til du har bestemt hva som skal deles.",
    "next": "Avklar hvem som skal lese prosjektets private kontrakter."
  },
  {
    "title": "Kontrakter og innsyn",
    "where": "Prosjekt → Kontrakter → Tilgang / Last opp dokument",
    "text": "Prosjektoppretteren med prosjektledertilgang starter det private kontraktsområdet. Under Tilgang velges navngitte personer som får lese eller administrere. Last opp originalen; bruk Ny versjon når samme dokument endres.",
    "recommend": "Behold signert kontrakt og beskrivelser som originaler. Vanlig Bolig-tilgang gir ikke innsyn i private kontrakter. Bruk tekstsøk og kontroller originalsidene. Full automatisk AI-kontroll av store kontrakter er fortsatt under utprøving.",
    "later": "Indeks og fakturering kan settes opp når kontraktsvilkårene er avklart. Private kontrakter skal ikke legges i vanlig FDV eller deles gjennom eksterne prosjektlenker.",
    "next": "Lag grunnpakken og avklar standardleveransen før du tilbyr tilvalg."
  },
  {
    "title": "Lag grunnpakken",
    "where": "Grunnpakker og tilvalgspakker → Grunnpakker",
    "text": "Lag rom og avsnitt, for eksempel fliser, innredning og dusj. Legg inn varer, bilder, varenummer og antall som inngår i standardleveransen.",
    "recommend": "Bygg én gjennomarbeidet grunnpakke først. Under «Klargjør boligprosjektet» kan du lagre en rommal med grunnpakker og bruke den på mange boliger. Grunnpakken kan være uten salgssum når den inngår i hovedentreprisen.",
    "later": "Tilvalg og individuelle unntak kan komme etterpå. Kontroller rominnholdet før bestilling.",
    "next": "Lag tilvalgspakkene som skal være tilgjengelige."
  },
  {
    "title": "Lag tilvalg og fordel",
    "where": "Grunnpakker og tilvalgspakker → Tilvalgspakker → Boligvalg",
    "text": "Sett opp alternativ til standardvaren eller tillegg til grunnpakken. Fordel felles oppsett til flere boliger. Åpne én bolig når du skal gjøre et individuelt unntak.",
    "recommend": "Prøv rommalen på én bolig før du fordeler den til resten. Forhåndsvisningen viser hva som legges til og hva som hoppes over. Eksisterende individuelle valg erstattes ikke stille. Kontroller tillegg og eventuelt fratrekk når standardvarer erstattes.",
    "later": "Beboerkontakt og deling av tilbud kan vente til innholdet er klart.",
    "next": "Kontroller pakkevalgene i én eksempelbolig, og fordel deretter sjekklister til riktig utvalg."
  },
  {
    "title": "Fordel sjekklister",
    "where": "Sjekklister og dokumentasjon → Fordel sjekklister",
    "text": "Velg publiserte firmamaler eller prosjektets egne maler. Velg boligene eller rommene som skal få listene, og se over fordelingen før du lagrer. Samme oppsett kan fordeles til mange boliger samtidig.",
    "recommend": "Velg bevisst hvilke sjekklister som er påkrevde. Åpne en eksempelbolig etter fordeling og kontroller innhold og plassering. Påkrevde uferdige kontroller stopper intern sluttgodkjenning; faktisk overtakelse vurderes separat av prosjektleder.",
    "later": "Utfylling, vedlegg og bilder legges inn når arbeidet utføres. Ikke ferdigmeld en kontroll bare for å komme videre.",
    "next": "Planlegg arbeidsrekkefølge og ansvarlige, og gi UE de sjekklistetilgangene de trenger."
  },
  {
    "title": "Planlegg mange boliger samlet",
    "where": "Byggbildet → Velg leiligheter til stammegruppe → Fremdrift og varsler",
    "text": "Velg boliger som følger samme arbeid, også på forskjellige etasjer. Lagre en stammegruppe. I «Planlegg flere boliger» velger du gruppen, oppstart, aktiviteter og ansvarlige.",
    "recommend": "Bruk 0 dager mellom boligstarter når stammen går samlet. Velg samtidig start for aktiviteter som kan skje samme dag. Se over planen før lagring.",
    "later": "Enkeltboliger kan ha egne datoer. Gruppene bestemmes av deg; bolignummeret bestemmer ikke fremdriften.",
    "next": "Kontroller Gantt-planen, datoene og ansvarlige. Sett opp faktisk bemanning hvis prosjektet trenger inn- og utregistrering.",
    "image": "fremdrift.webp",
    "alt": "Samlet Gantt-plan med flere aktiviteter og boliger på samme datoakse."
  },
  {
    "title": "Sett opp faktisk bemanning",
    "where": "Oppsett → Faktisk bemanning",
    "text": "Aktiver bemanningslisten når prosjektet skal bruke inn- og utregistrering. Prosjektleder kan registrere deltakere manuelt. Egne ansatte må være knyttet til prosjektet for å bruke sin prosjektinngang på Min side. UE bruker sin tildelte lenke.",
    "recommend": "Skill planlagt bemanning i fremdriften fra hvem som faktisk er inne på prosjektet. Kontroller hvem som er innlogget, og rett en glemt utregistrering med begrunnelse.",
    "later": "Bemanning kan stå av til prosjektet trenger den. Inn- og utregistrering erstatter ikke automatisk timeføringen.",
    "next": "Åpne Oversiktsliste ved tilsyn. Fyll ut byggeplass, virksomheter og personer, lagre og bekreft daglig kontroll. Listen kan brukes selv om inn- og utregistrering er av. Last ned PDF/CSV ved tilsyn. Gi deretter eksterne samarbeidspartnere tilgang til funksjonene de skal bruke."
  },
  {
    "title": "Gi UE og leverandører tilgang",
    "where": "Prosjekt → UE og leverandører → Gi tilgang",
    "text": "Fyll inn kontakt og bedrift. Velg funksjoner som fremdrift, sjekklister og bestillinger. Tilgangen gjelder alle aktive boliger i prosjektet, også nye; du trenger ikke velge dem enkeltvis. Opprett tilgangslenken når omfanget er kontrollert.",
    "recommend": "Gi UE utfylling av sjekklister med bilder og vedlegg når de skal dokumentere eget arbeid. Leverandører får normalt fremdrift og egne bestillinger uten priser. Kontroller mottaker og e-post før Send tilgangslenke. En opprettet lenke betyr ikke at den er sendt.",
    "later": "Flere kontakter kan legges til senere. Endre funksjoner for å justere innsyn, og trekk tilbake lenken når tilgangen skal stoppes.",
    "next": "Legg inn beboerkontakt og bestem hva som skal deles med beboeren."
  },
  {
    "title": "Velg kontakt og beboerdialog",
    "where": "Bolig → Leilighetsinformasjon / Beboerportal",
    "text": "Legg til én kontaktperson per bolig. Klargjør portal og eventuelle tilbud når innholdet er kontrollert. Meldinger kan slås på for hele prosjektet eller bare enkelte boliger.",
    "recommend": "Start med meldinger av. Aktiver dialog der det er nyttig, og avklar hvem som følger opp innboksen. Ved kontaktbytte stoppes gamle portal- og avtaleslenker. Kontroller delte dokumentlenker før du deler portalen med den nye kontakten.",
    "later": "Det er mulig å bruke prosjektet uten beboermeldinger. Når meldinger slås av, beholdes tidligere samtaler.",
    "next": "Kontroller boligvalgene og avtalene før du deler noe med beboeren.",
    "image": "byggoversikt.webp",
    "alt": "Byggoversikt med boliger som kan åpnes og følges opp hver for seg."
  },
  {
    "title": "Del avtaler med beboerne",
    "where": "Bolig → Beboerportal / Endringer og beboeraksept",
    "text": "Klargjør beboerportalen, kontroller kontakten og del bare de valgene og dokumentene beboeren trenger. Et innsendt boligvalg må gjennomgås før det brukes i avtalegrunnlaget. Kontroller varer, antall, pris og svarfrist før avtalen deles.",
    "recommend": "Se at lenken og mottakeren er riktig før utsending. Etter aksept brukes en endringsavtale for senere endringer. En privat hovedkontrakt skal ikke følge med i beboerportalen. Ved kontaktbytte må den gamle tilgangen stoppes og ny tilgang opprettes.",
    "later": "Du kan klargjøre innhold uten å sende det. Utsending og aksept skal være bevisste handlinger.",
    "next": "Kontroller det gjeldende varegrunnlaget før bestilling."
  },
  {
    "title": "Bestill og følg leveringer",
    "where": "Bolig → Bestilling og levering → Klargjør varebestilling",
    "text": "Kontroller varelinjer, antall og valgt bolig. Utelat varer som skal kjøpes andre steder. Lagre og fortsett klargjør utkastet. Se over leverandør, leveringsadresse og vedlegg før en bestilling sendes.",
    "recommend": "En lagret kladd er ikke sendt. Registrer faktisk mottatte varer separat, også delleveringer. Bruk Leveranser i bygget eller Leveranser i prosjektet for samlet oppfølging. Levering betyr ikke at arbeidet er utført.",
    "later": "Flere boliger kan bestilles og leveres på ulike tidspunkt. Endret eller utdatert varegrunnlag må avklares før du fortsetter.",
    "next": "Utfør arbeidet og dokumenter kontrollene i riktig bolig eller rom."
  },
  {
    "title": "Utfør og dokumenter sjekklistene",
    "where": "Bolig → Sjekklister og dokumentasjon",
    "text": "Åpne den pågående eller neste sjekklisten. Fyll ut punktene, legg til bilder og vedlegg og lagre. Last opp filene før du velger dem som dokumentasjon. Fullfør listen først når kontrollene faktisk er utført.",
    "recommend": "Bruk bilder og korte konkrete notater som viser hva som er kontrollert. En opplastet PDF er dokumentasjon, men fullfører ikke automatisk alle kontrollpunkter. UE med utfyllingstilgang bruker Mine sjekklister og vedlegg i sin lenke.",
    "later": "Pågående arbeid kan lagres underveis. Fullførte lister samles nederst og må gjenåpnes av prosjektleder før retting.",
    "next": "Følg opp åpne avvik, meldinger og aktiviteter med riktig ansvarlig og frist."
  },
  {
    "title": "Følg avvik, meldinger og frister",
    "where": "Byggoversikt → Beboerdialog / Bolig → Ferdigstilling → Se åpne forhold",
    "text": "Bruk meldingsmerket på fasaden eller Beboerportal-kortet for å finne samtalen. Lest betyr at meldingen er sett; behandlet betyr at oppfølgingen er avklart. Åpne forhold kan knyttes til arbeid under Oppfølging i fremdriftsplanen.",
    "recommend": "Gi det faktiske arbeidet en ansvarlig og en reell frist. Behold avvik og restpunkter åpne til de er fulgt opp. Kritiske forhold krever prosjektleders særskilte vurdering før en faktisk overtakelse registreres.",
    "later": "Vanlige restpunkter kan følges opp etter overtakelse når prosjektleder har vurdert dette. De ferdigmeldes ikke av overtakelsen.",
    "next": "Varsle beboerne når fremdriften krever informasjon om oppstart, befaring eller vannavstenging."
  },
  {
    "title": "Varsle beboerne",
    "where": "Fremdrift og varsler → Nytt beboervarsel",
    "text": "Velg hele prosjektet, et bygg, en oppgang eller bestemte boliger. Skriv innhold, tidspunkt og kontaktperson. Kontroller forhåndsvisningen. Lagre utkast sender ingenting; Last ned PDF / oppslag gir et papirvarsel.",
    "recommend": "Kontroller mottakerutvalget før Publiser til beboerne. Endret kontakt eller fremdrift kan kreve en oppdatert utgave. Når e-post er aktivert, skilles publisering, aksept hos e-posttjenesten og faktisk mottak. I Preview er utsending pauset.",
    "later": "Bruk PDF til oppslag der e-post ikke passer. Ikke send en prøve til ekte beboere uten avtalt mottaker og innhold.",
    "next": "Hold økonomi og dokumentasjon oppdatert mens boligene utføres."
  },
  {
    "title": "Følg kontraktsøkonomien",
    "where": "Kontrakter → Kontraktsøkonomi",
    "text": "Under Kontraktssum og vilkår velger du indeks, basismåned, reduksjonsfaktor og hvilke leveransedeler som reguleres. Fakturert og a konto brukes til periodens fakturering. Fakturadatoen styrer hvilken publisert indeks som kan brukes.",
    "recommend": "Lagre a konto og separat indeks i én handling. Fakturanummer kan fylles inn senere via Fakturaoversikt → Rediger, uten dobbeltelling. Oversikten skiller fakturert a konto fra fakturert indeks. For eldre datoer kan du måtte bekrefte indeksmåneden.",
    "later": "Appen registrerer og beregner; fakturaene må sendes og bokføres i ditt vanlige system. Fakturert betyr ikke betalt, og økonomien endrer ikke beboerprisene automatisk.",
    "next": "Gå til løpende overtakelse for boligen som faktisk skal overtas."
  },
  {
    "title": "Vurder overtakelsen",
    "where": "Byggoversikt → Løpende overtakelse → Ferdigstilling av bygg",
    "text": "Øverst i byggoversikten ser du hvor mange boliger i valgt bygg som gjenstår og er overtatt. Åpne boliglisten, velg en bolig og vurder åpne forhold. Kontroller, avvik, aktiviteter, intern godkjenning og ubehandlede meldinger samles her.",
    "recommend": "Gi hvert restpunkt en begrunnelse og oppfølgingsansvarlig. Vanlige forhold kan vurderes samlet; kritiske forhold må vurderes og bekreftes enkeltvis.",
    "later": "Intern sluttkontroll kan fortsatt stå uferdig selv om en faktisk overtakelse er gjennomført. Vurderingen ferdigmelder ingen saker.",
    "next": "Lagre bare vurderingen, eller velg «En overtakelse som er gjennomført» og oppgi faktisk dato og protokollreferanse.",
    "image": "overtakelse.webp",
    "alt": "Prosjektleders gjennomgang av åpne forhold før registrering av overtakelse."
  },
  {
    "title": "Lever dokumentasjon og følg opp",
    "where": "Sjekklister og dokumentasjon → Samlet PDF og ZIP",
    "text": "Ta ut dokumentasjonen per bolig, bygg eller prosjekt. PDF-en viser status og prosjektleders vurderinger. ZIP-en inneholder også de lagrede originalfilene og historikken. Ekstern FDV følger som lenker.",
    "recommend": "Kontroller at dokumentasjonen svarer til det som faktisk er montert. Åpne «Se åpne forhold» under Ferdigstilling og velg «Oppfølging i fremdriftsplanen». Koble saken til eksisterende arbeid eller opprett en aktivitet med ansvarlig og frist. Følg restpunktene til de er løst, også etter overtakelsen.",
    "later": "Ny dokumentasjon eller nye saker etter overtakelsen vises som videre oppfølging. Registreringen av den gjennomførte overtakelsen beholdes.",
    "next": "Bruk aktivitetenes frister og varsler for videre oppfølging. Nedlasting av dokumentasjon endrer ingen status."
  }
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
        className="bolig-start-guide-button bolig-guidance-trigger"
        onClick={() => {
          setStep(0);
          setImage(false);
          setOpen(true);
        }}
      >
        A–Å-veiledning for Boligprosjekter
      </button>
      {open && (
        <BoligGuidePanel open={open}
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
            <label className="bolig-guide-step-select">
              Velg steg
              <select aria-label="Velg steg i boligveiledningen" value={step}
                onChange={(event) => choose(Number(event.target.value))}>
                {steps.map((item, index) => <option key={item.title} value={index}>
                  {index + 1}. {item.title}
                </option>)}
              </select>
            </label>
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
        </BoligGuidePanel>
      )}
    </>
  );
}
