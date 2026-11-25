// Expo ProffDok – FASE 33B.3
// Samlet forhåndsvisning av enkel forbrukerkontrakt. Dokumentet bygger på
// låst kundeaksept og akseptert tilbud; det oppretter ingen ny tilbudshistorikk.

import { ExternalLink, ShieldCheck } from "lucide-react";
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";
import {
  AGREEMENT_CHANNELS,
  PRICE_FORMS,
  agreementChannelNeedsWithdrawalInfo,
  getAcceptedSalesOfferVersionNumber,
} from "../utils/salesContractModel.js";

function formatDate(value = "") {
  if (!value) return "Ikke angitt";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value = "") {
  if (!value) return "Ikke registrert";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function customerAddress(request = {}) {
  return [request.address, [request.postnr, request.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

function getAcceptedOptions(request = {}) {
  const acceptedPayload = request.acceptedPayload || {};
  if (Array.isArray(request.acceptedOptions) && request.acceptedOptions.length) {
    return request.acceptedOptions;
  }
  if (
    Array.isArray(acceptedPayload.selected_options) &&
    acceptedPayload.selected_options.length
  ) {
    return acceptedPayload.selected_options;
  }

  const selectedIds = new Set(
    [
      ...(Array.isArray(request.acceptedOptionIds) ? request.acceptedOptionIds : []),
      ...(Array.isArray(request.acceptedSelectedOptionIds)
        ? request.acceptedSelectedOptionIds
        : []),
      ...(Array.isArray(acceptedPayload.selected_option_ids)
        ? acceptedPayload.selected_option_ids
        : []),
    ].map((id) => String(id || ""))
  );
  if (!selectedIds.size) return [];

  const versionSnapshot = acceptedPayload.version_snapshot || {};
  const allOptions =
    (Array.isArray(versionSnapshot.options) && versionSnapshot.options.length
      ? versionSnapshot.options
      : Array.isArray(versionSnapshot.offerOptions) && versionSnapshot.offerOptions.length
        ? versionSnapshot.offerOptions
        : Array.isArray(request.offerOptions)
          ? request.offerOptions
          : []) || [];

  return allOptions.filter((option) => selectedIds.has(String(option?.id || "")));
}

function Summary({ label, value, strong = false }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: "11px 12px",
        border: "1px solid #d9e7eb",
        borderRadius: 10,
        background: "#f8fbfc",
      }}
    >
      <span style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>
        {label}
      </span>
      <strong
        style={{
          color: strong ? "#0b737b" : "#0f172a",
          fontSize: strong ? 16 : undefined,
        }}
      >
        {value || "Ikke registrert"}
      </strong>
    </div>
  );
}

function ContractSection({ number, title, children }) {
  return (
    <section>
      <h3 style={{ margin: "0 0 10px", color: "#183b46" }}>
        {number}. {title}
      </h3>
      {children}
    </section>
  );
}

function Paragraph({ children, last = false }) {
  return (
    <p
      style={{
        margin: last ? 0 : "0 0 9px",
        lineHeight: 1.62,
        color: "#334155",
      }}
    >
      {children}
    </p>
  );
}

export default function SalesContractDocument({ request, companyProfile, draft }) {
  const version = getAcceptedSalesOfferVersionNumber(request);
  const acceptedBy =
    request.acceptedBy ||
    request.acceptedPayload?.accepted_by ||
    request.acceptedPayload?.customer_name ||
    request.customer ||
    "Ikke registrert";
  const acceptedAt =
    request.acceptedAt ||
    request.acceptedPayload?.accepted_at ||
    request.acceptedPayload?.acceptedAt ||
    "";
  const requestRef = request.requestRef || request.request_ref || request.ref || "";
  const acceptedOptions = getAcceptedOptions(request);
  const acceptanceProof = request.acceptanceProofFile || request.acceptance_proof_file || null;
  const agreementLabel =
    AGREEMENT_CHANNELS.find((item) => item.value === draft.agreement_channel)?.label ||
    "Ikke valgt";
  const priceLabel =
    PRICE_FORMS.find((item) => item.value === draft.price_form)?.label ||
    "Ikke valgt";
  const durationWeeks = Number(draft.expected_duration_weeks || 0);
  const graceDays = Math.max(0, Number(draft.daily_penalty_grace_days || 0));

  return (
    <article
      style={{
        maxWidth: 860,
        margin: "0 auto",
        background: "#ffffff",
        border: "1px solid #d8e5e9",
        borderRadius: 16,
        boxShadow: "0 16px 42px rgba(15, 54, 64, .09)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "24px 26px",
          background: "linear-gradient(135deg, #eaf9fa 0%, #f8fcfd 100%)",
          borderBottom: "1px solid #d8e5e9",
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#0b737b", fontWeight: 900, fontSize: 13 }}>
            EXPO PROFFDOK
          </div>
          <h2 style={{ margin: "5px 0 3px", color: "#0f172a" }}>
            Enkel forbrukerkontrakt for håndverkertjenester
          </h2>
          <div style={{ color: "#52616b" }}>
            {requestRef ? `${requestRef} · ` : ""}Basert på akseptert tilbud
            {version ? ` v${version}` : ""}
          </div>
        </div>
        {companyProfile?.logoUrl ? (
          <img
            src={companyProfile.logoUrl}
            alt="Firmalogo"
            style={{ maxWidth: 160, maxHeight: 62, objectFit: "contain" }}
          />
        ) : null}
      </div>

      <div style={{ padding: "24px 26px", display: "grid", gap: 24 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            border: "1px solid #9fd6da",
            background: "#eefafb",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
              color: "#0b737b",
              fontWeight: 900,
              marginBottom: 11,
            }}
          >
            <ShieldCheck size={19} /> Kundeaksept – låst avtalegrunnlag
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
              gap: 9,
            }}
          >
            <Summary
              label="Akseptert tilbud"
              value={version ? `Versjon ${version}` : "Akseptert tilbud"}
            />
            <Summary label="Akseptert av" value={acceptedBy} />
            <Summary label="Akseptert" value={formatDateTime(acceptedAt)} />
            <Summary
              label="Avtalesum inkl. mva."
              value={formatNok(draft.price_incl_vat || 0)}
              strong
            />
          </div>

          {acceptedOptions.length ? (
            <div style={{ marginTop: 12 }}>
              <strong style={{ display: "block", marginBottom: 7, color: "#183b46" }}>
                Valgte opsjoner ved aksept
              </strong>
              <div style={{ display: "grid", gap: 7 }}>
                {acceptedOptions.map((option, index) => (
                  <div
                    key={option.id || `${option.title || "option"}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "9px 11px",
                      borderRadius: 9,
                      background: "#ffffff",
                      border: "1px solid #d6eaec",
                    }}
                  >
                    <span>
                      <strong>{option.title || "Valgt opsjon"}</strong>
                      {option.description ? (
                        <span style={{ display: "block", color: "#52616b", marginTop: 2 }}>
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <strong style={{ whiteSpace: "nowrap", color: "#0b737b" }}>
                      {formatNok(getOfferTotal([option]) * 1.25)} inkl. mva.
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ margin: "12px 0 0", color: "#52616b" }}>
              Ingen valgte opsjoner er registrert ved aksept.
            </p>
          )}

          {acceptanceProof?.url ? (
            <a
              href={acceptanceProof.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                gap: 7,
                alignItems: "center",
                marginTop: 12,
                color: "#0b737b",
                fontWeight: 900,
              }}
            >
              Åpne låst akseptbevis <ExternalLink size={15} />
            </a>
          ) : null}
        </div>

        <ContractSection number="1" title="Partene og prosjektet">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 10,
            }}
          >
            <Summary label="Utførende firma" value={companyProfile?.companyName} />
            <Summary label="Organisasjonsnummer" value={companyProfile?.orgNumber} />
            <Summary label="E-post firma" value={companyProfile?.email} />
            <Summary label="Telefon firma" value={companyProfile?.phone} />
            <Summary label="Kunde" value={request.customer} />
            <Summary label="E-post kunde" value={request.email} />
            <Summary label="Telefon kunde" value={request.phone} />
            <Summary
              label="Prosjektadresse"
              value={draft.project_address || customerAddress(request)}
            />
          </div>
        </ContractSection>

        <ContractSection number="2" title="Avtalegrunnlag og arbeidets omfang">
          <Paragraph>
            Det aksepterte tilbudet{version ? ` v${version}` : ""}, med kundens valgte
            opsjoner og de vedlegg som fulgte tilbudet, inngår i denne kontrakten i sin
            helhet. Kontrakten supplerer tilbudet med fremdrift, betaling og øvrige
            avtalepunkter; den endrer ikke det tilbudet kunden allerede har akseptert.
          </Paragraph>
          <Paragraph>
            Arbeidet skal utføres i samsvar med avtalt leveranse, gjeldende offentligrettslige
            krav som gjelder for arbeidet, relevante produktanvisninger og alminnelige krav
            til fagmessig utførelse.
          </Paragraph>
          {draft.included ? (
            <Paragraph><strong>Inkludert:</strong> {draft.included}</Paragraph>
          ) : null}
          {draft.excluded ? (
            <Paragraph><strong>Ikke inkludert:</strong> {draft.excluded}</Paragraph>
          ) : null}
          {draft.customer_supplied ? (
            <Paragraph last>
              <strong>Kundens egne leveranser:</strong> {draft.customer_supplied}
            </Paragraph>
          ) : null}
        </ContractSection>

        <ContractSection number="3" title="Pris, fremdrift og betaling">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Summary label="Prisform" value={priceLabel} />
            <Summary
              label="Avtalesum inkl. mva."
              value={formatNok(draft.price_incl_vat || 0)}
              strong
            />
            <Summary label="Avtalt oppstart" value={formatDate(draft.start_date)} />
            <Summary
              label="Forventet varighet"
              value={durationWeeks > 0 ? `${durationWeeks} uker` : "Ikke angitt"}
            />
            <Summary
              label="Beregnet forventet ferdigstillelse"
              value={formatDate(draft.expected_finish_date)}
            />
          </div>
          <Paragraph>
            Forventet ferdigstillelse er beregnet ut fra avtalt oppstart og forventet
            varighet. Dersom det oppstår dokumenterte forhold som etter avtalen eller loven
            gir rett til fristforlengelse, forskyves ferdigstillelsesfristen tilsvarende.
          </Paragraph>
          <Paragraph>
            Avtalesummen og prisformen følger det aksepterte tilbudet og denne kontrakten.
            Dersom prisformen er prisoverslag, høyeste pris eller regningsarbeid, gjelder de
            lovbestemte reglene for den valgte prisformen.
          </Paragraph>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {(draft.payment_plan || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px minmax(0,1fr)",
                  gap: 12,
                  padding: "11px 12px",
                  border: "1px solid #d9e7eb",
                  borderRadius: 10,
                }}
              >
                <strong style={{ color: "#0b737b" }}>{item.percent} %</strong>
                <div>
                  <strong style={{ display: "block", color: "#0f172a" }}>{item.title}</strong>
                  <span style={{ color: "#52616b" }}>{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </ContractSection>

        <ContractSection number="4" title="Endringer, tillegg og fradrag">
          <Paragraph>
            Endringer i arbeidets omfang, tillegg, fradrag og alternative løsninger skal så
            langt det er praktisk mulig avtales skriftlig før arbeidet utføres. Avklaringen
            bør angi hva som endres og eventuelle følger for pris og fremdrift.
          </Paragraph>
          <Paragraph last>
            Når Expo ProffDok brukes til prosjektet, skal slike endringer dokumenteres som
            egne tillegg eller fradrag. Den opprinnelige kundeaksepten og det aksepterte
            tilbudet skal ikke overskrives.
          </Paragraph>
        </ContractSection>

        <ContractSection number="5" title="Partenes ansvar og kundens medvirkning">
          <Paragraph>
            Utførende firma skal planlegge og gjennomføre sitt arbeid fagmessig og varsle
            kunden dersom det oppdages forhold som bør avklares før arbeidet fortsetter.
          </Paragraph>
          <Paragraph>
            Kunden skal gi nødvendig tilgang til arbeidsstedet, sørge for avtalte avklaringer
            og opplysninger i rimelig tid og informere om kjente forhold som kan påvirke
            utførelsen. Der det er nødvendig for arbeidet, skal tilgang til strøm, vann og
            andre avtalte fasiliteter være tilgjengelig.
          </Paragraph>
          <Paragraph last>
            Kundens egne produkter eller leveranser er kundens ansvar med mindre annet er
            uttrykkelig avtalt. Forsinkede kundevalg, kundens egne leveranser, manglende
            tilgang eller sene avklaringer kan påvirke fremdriften og skal dokumenteres når
            det får betydning for prosjektet.
          </Paragraph>
        </ContractSection>

        <ContractSection number="6" title="Skjulte og uforutsette forhold">
          <Paragraph>
            Forhold som ikke med rimelighet kunne avdekkes ved befaring eller på grunnlag av
            tilgjengelig informasjon, og som endrer forutsetningene for arbeidet, skal
            varsles og avklares med kunden. Nødvendige endringer i pris eller fremdrift skal
            avtales og dokumenteres før videre arbeid så langt situasjonen tillater det.
          </Paragraph>
          <Paragraph last>
            Denne bestemmelsen gir ikke utførende firma rett til å fravike kundens
            ufravikelige rettigheter etter håndverkertjenesteloven.
          </Paragraph>
        </ContractSection>

        <ContractSection number="7" title="Forsinkelse, fristforlengelse og mangler">
          <Paragraph>
            Partene skal varsle hverandre uten ugrunnet opphold dersom forhold oppstår som
            kan påvirke avtalt fremdrift eller forventet ferdigstillelse. Årsaken og forventet
            konsekvens for fremdriften skal så langt det er praktisk mulig dokumenteres.
          </Paragraph>
          <Paragraph>
            Dersom forsinkelsen skyldes forhold utførende firma svarer for, regnes dette som
            forsinkelse på håndverkerens side. Dersom forsinkelsen skyldes kunden, kundens egne
            valg eller leveranser, manglende tilgang, sene avklaringer eller andre forhold som
            etter avtalen eller loven gir rett til fristforlengelse, forskyves
            ferdigstillelsesfristen tilsvarende. Dagmulkt løper ikke for slik fristforlengelse.
          </Paragraph>
          {draft.daily_penalty_agreed ? (
            <Paragraph>
              Partene har avtalt dagmulkt. Dagmulkt kan tidligst begynne å løpe når gjeldende
              ferdigstillelsesfrist er overskredet og den avtalte tilleggsfristen på {graceDays}
              {" "}kalenderdager er utløpt. Dagmulkt gjelder bare forsinkelse utførende firma
              svarer for.
            </Paragraph>
          ) : null}
          <Paragraph last>
            Ved mangel gjelder partenes avtalte vilkår og de ufravikelige reglene i
            håndverkertjenesteloven. Kunden kan blant annet holde tilbake et nødvendig beløp,
            og utførende firma skal få anledning til å vurdere og rette en meldt mangel når
            vilkårene for retting er oppfylt.
          </Paragraph>
        </ContractSection>

        <ContractSection number="8" title="Overtagelse, dokumentasjon og eventuell garanti">
          <Paragraph>
            Når arbeidet er ferdigstilt, gjennomføres overtagelse etter prosjektets avtalte
            rutine. Eventuelle åpne punkter eller mangler dokumenteres og følges opp til de er
            avklart eller rettet.
          </Paragraph>
          <Paragraph last>
            Prosjektdokumentasjon, akseptert tilbud, kontrakt, senere avtalte endringer og
            eventuell Expo ProffDok-garanti oppbevares som separate historiske dokumenter.
            En eventuell tetthetsgaranti gjelder etter vilkårene i det særskilte
            garantidokumentet og erstatter ikke forbrukerens lovbestemte rettigheter.
          </Paragraph>
        </ContractSection>

        <ContractSection number="9" title="Avtaleform og angrerett">
          <Paragraph><strong>Avtalen er inngått:</strong> {agreementLabel}.</Paragraph>
          {agreementChannelNeedsWithdrawalInfo(draft.agreement_channel) ? (
            <Paragraph last>
              Der angrerettloven gjelder, skal kunden få lovpålagt informasjon om angreretten.
              {draft.early_start_requested
                ? " Kunden ønsker at arbeidet skal starte før eventuell angrefrist er utløpt og skal bekrefte dette uttrykkelig ved signering."
                : " Det er ikke registrert at kunden ønsker oppstart før en eventuell angrefrist er utløpt."}
            </Paragraph>
          ) : (
            <Paragraph last>
              Ingen særskilt anmodning om oppstart før en eventuell angrefrist er registrert.
            </Paragraph>
          )}
        </ContractSection>

        <ContractSection number="10" title="Særlige vilkår">
          {draft.daily_penalty_agreed ? (
            <>
              <Paragraph>
                <strong>Dagmulkt:</strong> {draft.daily_penalty_text || "Avtalt mellom partene."}
              </Paragraph>
              <Paragraph>
                <strong>Avtalt tilleggsfrist:</strong> {graceDays} kalenderdager etter
                gjeldende ferdigstillelsesfrist.
              </Paragraph>
            </>
          ) : (
            <Paragraph><strong>Dagmulkt:</strong> Ikke særskilt avtalt.</Paragraph>
          )}
          <Paragraph last>
            <strong>Andre særskilte vilkår:</strong>{" "}
            {draft.special_terms || "Ingen særskilte vilkår registrert."}
          </Paragraph>
        </ContractSection>

        <ContractSection number="11" title="Dokumenter som inngår i avtalen">
          <ol style={{ margin: 0, paddingLeft: 22, color: "#334155", lineHeight: 1.7 }}>
            <li>Denne signerte kontrakten.</li>
            <li>
              Kundens aksepterte tilbud{version ? ` v${version}` : ""}, med valgte opsjoner.
            </li>
            <li>
              Vedlegg og kundesynlig dokumentasjon som fulgte den aksepterte tilbudsversjonen.
            </li>
            <li>Senere skriftlig avtalte og dokumenterte endringer, tillegg og fradrag.</li>
          </ol>
          <p style={{ margin: "10px 0 0", color: "#52616b", lineHeight: 1.55 }}>
            Ved motstrid går en senere særskilt skriftlig avtale om det aktuelle forholdet
            foran eldre dokumentasjon. Ufravikelige forbrukerrettigheter gjelder uansett.
          </p>
        </ContractSection>

        <ContractSection number="12" title="Signering">
          <Paragraph>
            Ved signering bekrefter partene at de har lest kontrakten og at det aksepterte
            tilbudet med eventuelle valgte opsjoner inngår som avtalegrunnlag.
          </Paragraph>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: 12,
            }}
          >
            <Summary label="Utførende firma" value="Avventer signering" />
            <Summary label="Kunde" value="Avventer signering" />
          </div>
        </ContractSection>

        <section
          style={{
            paddingTop: 18,
            borderTop: "1px solid #d9e7eb",
            color: "#52616b",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          <strong style={{ display: "block", marginBottom: 5, color: "#183b46" }}>
            Om kontrakten
          </strong>
          Dette dokumentet er opprettet i Expo ProffDok som en enkel forbrukerkontrakt for
          håndverkertjenester og bygger på kundens aksepterte tilbud. Det er ikke en Standard
          Norge-/NS-blankett og er ikke godkjent av Forbrukerrådet. Ufravikelige rettigheter
          etter gjeldende forbrukerlovgivning gjelder uavhengig av kontrakten. Når begge
          parter har signert, låses og arkiveres kontrakten som en del av prosjektets
          avtalegrunnlag.
        </section>
      </div>
    </article>
  );
}
