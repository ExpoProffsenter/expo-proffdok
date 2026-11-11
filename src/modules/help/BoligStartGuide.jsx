import React, { useState, useRef } from "react";
import Dialog from "../bolig/BoligEditorDialog.jsx";
import BoligGuidePanel from "./BoligGuidePanel.jsx";
import {BOLIG_WORKFLOW as steps} from './boligWorkflow.mjs';
export default function BoligStartGuide({returnLabel}={}) {
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
        <BoligGuidePanel open={open} returnLabel={returnLabel}
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
