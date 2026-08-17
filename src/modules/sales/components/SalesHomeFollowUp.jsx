// Expo ProffDok – FASE 28C2
// Henter firmascopede salgssaker til Startsiden og viser kun sendte tilbud
// som bør følges opp. Bruker eksisterende Sales-RPC/RLS og verifiserer
// eventuell kundeaksept før et tilbud vises. Ingen SQL-, Storage- eller e-postendring.

import { Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchSalesRequests,
  getSalesOfferByToken,
  resolveSalesCompanyScope,
} from "../services/salesSupabase.js";

const OFFER_FOLLOW_UP_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function getOfferFollowUpInfo(request) {
  if (
    request?.status !== "Tilbud" ||
    request?.acceptedAt ||
    !request?.offerEmailSentAt
  ) {
    return null;
  }

  const hasUnpublishedOfferChanges = Boolean(
    request?.offerLines?.length && !request?.sentOfferVersionId
  );

  if (hasUnpublishedOfferChanges) {
    return null;
  }

  const sentAt = new Date(request.offerEmailSentAt);

  if (Number.isNaN(sentAt.getTime())) {
    return null;
  }

  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - sentAt.getTime()) / DAY_MS)
  );

  if (ageInDays < OFFER_FOLLOW_UP_DAYS) {
    return null;
  }

  return {
    ageInDays,
    sentAt: sentAt.toISOString(),
    sentDate: sentAt.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

function requestFromRow(row = {}) {
  return {
    ...(row?.payload || {}),
    id: row?.request_ref || row?.payload?.id || "",
    status: row?.status || row?.payload?.status || "",
  };
}

async function customerHasAcceptedOffer(client, request) {
  if (request?.acceptedAt || request?.status === "Akseptert" || request?.status === "Aktivert") {
    return true;
  }

  if (!request?.publicToken) {
    return false;
  }

  try {
    const { data, error } = await getSalesOfferByToken(
      client,
      request.publicToken
    );

    if (error) {
      console.warn(
        `Kunne ikke verifisere kundeaksept for ${request.id || "tilbud"}`,
        error
      );
      return null;
    }

    return data?.offer?.status === "accepted";
  } catch (error) {
    console.warn(
      `Kunne ikke verifisere kundeaksept for ${request.id || "tilbud"}`,
      error
    );
    return null;
  }
}

export function useSalesHomeFollowUpData({
  supabaseClient = null,
  authUser = null,
  integrationMode = "app",
  enabled = true,
} = {}) {
  const [state, setState] = useState({
    items: [],
    loading: false,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadFollowUpOffers() {
      if (
        !enabled ||
        integrationMode !== "app" ||
        !supabaseClient ||
        !authUser?.id
      ) {
        if (!cancelled) {
          setState({ items: [], loading: false, error: "" });
        }
        return;
      }

      setState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      try {
        const { data: companyId, error: companyError } =
          await resolveSalesCompanyScope(supabaseClient);

        if (companyError || !companyId) {
          throw new Error(
            companyError?.message ||
              "Firmatilknytningen for tilbud kunne ikke bekreftes."
          );
        }

        const { data: rows, error: requestError } = await fetchSalesRequests(
          supabaseClient,
          companyId
        );

        if (requestError) {
          throw requestError;
        }

        const candidates = (rows || [])
          .filter((row) => !row?.archived_at)
          .map(requestFromRow)
          .map((request) => ({
            request,
            followUp: getOfferFollowUpInfo(request),
          }))
          .filter((entry) => entry.followUp);

        const verified = await Promise.all(
          candidates.map(async (entry) => ({
            ...entry,
            accepted: await customerHasAcceptedOffer(
              supabaseClient,
              entry.request
            ),
          }))
        );

        if (cancelled) return;

        const items = verified
          .filter((entry) => entry.accepted === false)
          .map(({ request, followUp }) => ({
            id: request.id,
            title: request.offerTitle || request.title || "Tilbud",
            customer: request.customer || "Kunde ikke oppgitt",
            address: request.address || "",
            reference: request.id || "",
            ageInDays: followUp.ageInDays,
            sentAt: followUp.sentAt,
            sentDate: followUp.sentDate,
          }))
          .sort(
            (a, b) =>
              b.ageInDays - a.ageInDays ||
              String(a.title).localeCompare(String(b.title), "nb")
          )
          .slice(0, 6);

        setState({
          items,
          loading: false,
          error: "",
        });
      } catch (error) {
        console.error("Kunne ikke hente tilbud som bør følges opp", error);

        if (!cancelled) {
          setState({
            items: [],
            loading: false,
            error:
              error?.message ||
              "Tilbudsoppfølging kunne ikke hentes akkurat nå.",
          });
        }
      }
    }

    void loadFollowUpOffers();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, enabled, integrationMode, supabaseClient]);

  return state;
}

export default function SalesHomeFollowUp({
  items = [],
  loading = false,
  error = "",
  onOpenRequest = null,
  compact = false,
}) {
  const visibleItems = useMemo(
    () => (Array.isArray(items) ? items : []).slice(0, compact ? 4 : 6),
    [compact, items]
  );

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section
        className="item"
        style={{
          marginTop: 16,
          borderColor: "#fde68a",
          background: "#fffbeb",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Tilbudsoppfølging</h3>
        <p className="note" style={{ marginBottom: 0 }}>
          Kunne ikke hente tilbud som bør følges opp. Åpne Befaring/Tilbud for
          å kontrollere sakene.
        </p>
      </section>
    );
  }

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section
      className="item"
      style={{
        marginTop: 16,
        borderColor: "#fed7aa",
        background: "#fffaf5",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Tilbud som bør følges opp</h3>
        <p className="note" style={{ margin: "5px 0 0" }}>
          Tilbud sendt på e-post for minst {OFFER_FOLLOW_UP_DAYS} dager siden
          uten registrert kundeaksept.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {visibleItems.map((item) => (
          <article
            key={item.id}
            style={{
              padding: compact ? "11px 12px" : "13px 14px",
              border: "1px solid #fed7aa",
              borderRadius: 14,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                <b style={{ display: "block", fontSize: compact ? 15 : 16 }}>
                  {item.title}
                </b>
                <small
                  className="note"
                  style={{ display: "block", marginTop: 3 }}
                >
                  {[item.customer, item.address, item.reference]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #fdba74",
                    background: "#ffedd5",
                    color: "#9a3412",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <Mail size={14} />
                  Sendt {item.sentDate} · {item.ageInDays}{" "}
                  {item.ageInDays === 1 ? "dag" : "dager"} siden
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenRequest?.(item.id)}
                style={{ whiteSpace: "nowrap" }}
              >
                Åpne tilbud
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
