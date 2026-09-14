import { readFileSync } from "node:fs";
import {
  mapSalesServerRowsToRequests,
  mergeSalesServerRowsIntoCache,
  shouldGateSalesCoreUntilServerCache,
} from "../src/modules/sales/services/salesServerCacheHydration.mjs";

const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) failures.push(message);
}

const wrapperPath = "src/modules/sales/SalesModule.jsx";
const wrapper = readFileSync(wrapperPath, "utf8");

const serverRow = {
  request_ref: "F-2026-0043",
  payload: {
    customer: "Test Demo",
    offerTitle: "Tilbud – Modernisering av bad",
    offerLines: Array.from({ length: 15 }, (_, index) => ({
      id: `line-${index + 1}`,
      description: `Linje ${index + 1}`,
      amount: "1000",
    })),
    offerOptions: Array.from({ length: 4 }, (_, index) => ({
      id: `option-${index + 1}`,
      title: `Opsjon ${index + 1}`,
      amount: "100",
    })),
  },
};

const mapped = mapSalesServerRowsToRequests([serverRow]);
requireCondition(mapped.length === 1, "Serverhydrering: serverrad ble ikke mappet til én Sales-sak.");
requireCondition(mapped[0]?.id === "F-2026-0043", "Serverhydrering: request_ref ble ikke bevart.");
requireCondition(mapped[0]?.offerLines?.length === 15, "Serverhydrering: 15 serverlinjer ble ikke bevart.");
requireCondition(mapped[0]?.offerOptions?.length === 4, "Serverhydrering: 4 serveropsjoner ble ikke bevart.");

const merged = mergeSalesServerRowsIntoCache(
  [serverRow],
  [
    {
      id: "F-2026-0043",
      customer: "Stale cache",
      offerLines: [],
      offerOptions: [],
    },
    {
      id: "LOCAL-ONLY-1",
      customer: "Ikke synkronisert ennå",
    },
  ]
);

const authoritative = merged.find((request) => request.id === "F-2026-0043");
requireCondition(
  authoritative?.offerLines?.length === 15 && authoritative?.offerOptions?.length === 4,
  "Serverhydrering: stale lokal cache kan fortsatt overstyre serverens eksisterende tilbud."
);
requireCondition(
  merged.some((request) => request.id === "LOCAL-ONLY-1"),
  "Serverhydrering: lokal-only sak ble kastet før den kan synkroniseres."
);

requireCondition(
  shouldGateSalesCoreUntilServerCache({
    integrationMode: "app",
    authUserId: "user-1",
    serverCacheReady: false,
  }),
  "Serverhydrering: app-modus kan mounte SalesCore før servercache er klar."
);
requireCondition(
  !shouldGateSalesCoreUntilServerCache({
    integrationMode: "app",
    authUserId: "user-1",
    serverCacheReady: true,
  }),
  "Serverhydrering: SalesCore forblir blokkert etter bekreftet servercache."
);
requireCondition(
  !shouldGateSalesCoreUntilServerCache({
    integrationMode: "preview",
    authUserId: "",
    serverCacheReady: false,
  }),
  "Serverhydrering: standalone preview ble feilaktig gjort avhengig av Supabase-gate."
);

requireText(
  wrapper,
  "primeSalesServerCacheBeforeCore",
  `${wrapperPath}: wrapperen primer ikke servercache før SalesModuleCore.`
);
requireText(
  wrapper,
  "mergeSalesServerRowsIntoCache",
  `${wrapperPath}: serverdata erstatter ikke stale cache kontrollert.`
);
requireText(
  wrapper,
  "shouldGateSalesCoreUntilServerCache",
  `${wrapperPath}: SalesModuleCore mangler eksplisitt serverhydrering-gate.`
);
requireText(
  wrapper,
  "Henter siste lagrede salgssaker",
  `${wrapperPath}: bruker får ingen trygg ventestatus mens serverdata hentes.`
);

if (failures.length) {
  console.error("❌ Expo ProffDok Sales server hydration check feilet:");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(
  "✅ Expo ProffDok Sales server hydration check OK – ny nettleser/stale cache må laste servertilbud før editor mountes"
);
