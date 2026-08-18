// Expo ProffDok – FASE 23D / FASE 28A1 / FASE 29B2 / FASE 29B3 / FASE 29B4 / FASE 29B5
// Samler Supabase-kall for Befaring / Tilbud / Aksept.
// FASE 29B4 lar kun systemadministrator bruke eksplisitt valgt Sales-supportfirma.
// Vanlige brukere beholder eksisterende firmascope uendret.
// FASE 29B5 lar kundesynlige PDF-vedlegg fra aksepterte tilbudslinjer og valgte opsjoner
// følge sikkert med til prosjektets Tilbud/kontrakt uten å kopiere selve Storage-filen.

import { createClient } from "@supabase/supabase-js";
import {
  LEGACY_PUBLIC_DOCUMENT_BUCKET,
  PRIVATE_DOCUMENT_BUCKET,
  buildPrivateDocumentAppUrl,
  buildPrivateSalesStoragePath,
  isPrivateOfferAttachmentLogicalPath,
  isPrivateSalesLogicalPath,
} from "../../documents/privateDocumentTools.js";

const SALES_SUPPORT_COMPANY_PARAM = "salesSupportCompany";

export function getSalesSupportCompanyId() {
  if (typeof window === "undefined") return "";
  try {
    return String(
      new URLSearchParams(window.location.search).get(SALES_SUPPORT_COMPANY_PARAM) || ""
    ).trim();
  } catch {
    return "";
  }
}

export function isSalesSupportMode() {
  return Boolean(getSalesSupportCompanyId());
}

export function createDefaultSalesSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
}

export function getSalesSession(client) {
  return client.auth.getSession();
}

export function fetchCurrentSalesUser(client) {
  return client.auth.getUser();
}

export function subscribeToSalesAuthChanges(client, callback) {
  if (!client?.auth?.onAuthStateChange) return null;
  const { data } = client.auth.onAuthStateChange(callback);
  return data?.subscription || null;
}

export function resolveSalesCompanyScope(client) {
  const supportCompanyId = getSalesSupportCompanyId();
  return supportCompanyId
    ? client.rpc("resolve_sales_support_company_scope", {
        requested_company_id: supportCompanyId,
      })
    : client.rpc("resolve_sales_company_scope");
}

export function listSalesSupportCompanies(client) {
  return client.rpc("list_sales_support_companies");
}

export function getSalesSupportCompanyProfile(client, companyId) {
  return client.rpc("get_sales_support_company_profile", {
    requested_company_id: companyId,
  });
}

const withPublicOfferAttachmentAccess = (item = {}, token = "") => {
  const attachment = item?.attachmentFile;
  const path = String(
    attachment?.path || attachment?.storagePath || attachment?.filePath || ""
  ).trim();

  if (!attachment || !path || !isPrivateOfferAttachmentLogicalPath(path)) {
    return item;
  }

  return {
    ...item,
    attachmentFile: {
      ...attachment,
      url: buildPrivateDocumentAppUrl({ path, offerToken: token }),
    },
  };
};

const enrichPublicOfferDocumentLinks = (payload, token = "") => {
  if (!payload || typeof payload !== "object") return payload;
  const version = payload?.version;
  if (!version || typeof version !== "object") return payload;

  return {
    ...payload,
    version: {
      ...version,
      lines: Array.isArray(version.lines)
        ? version.lines.map((item) => withPublicOfferAttachmentAccess(item, token))
        : version.lines,
      options: Array.isArray(version.options)
        ? version.options.map((item) => withPublicOfferAttachmentAccess(item, token))
        : version.options,
    },
  };
};

export async function getSalesOfferByToken(client, token) {
  const result = await client.rpc("get_sales_offer_by_token", { token });
  if (result?.error || !result?.data) return result;
  return {
    ...result,
    data: enrichPublicOfferDocumentLinks(result.data, token),
  };
}

export function acceptSalesOffer(client, { token, acceptedName, selectedOptions }) {
  return client.rpc("accept_sales_offer", {
    token,
    accepted_name: acceptedName,
    selected_options: selectedOptions,
  });
}

export function publishSalesOffer(client, payload) {
  const supportCompanyId = getSalesSupportCompanyId();
  return client.rpc("publish_sales_offer", {
    payload: supportCompanyId
      ? { ...payload, support_company_id: supportCompanyId }
      : payload,
  });
}

export function fetchSalesRequests(client, companyId) {
  return client
    .from("sales_requests")
    .select("request_ref,payload,status,archived_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });
}

export function upsertSalesRequests(client, rows) {
  return client
    .from("sales_requests")
    .upsert(rows, { onConflict: "company_id,request_ref" });
}

export function fetchSalesOfferTemplates(client, companyId) {
  return client
    .from("sales_offer_templates")
    .select("id,company_id,name,payload,created_by,created_at,updated_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });
}

export function insertSalesOfferTemplate(
  client,
  { companyId, name, payload, createdBy }
) {
  return client
    .from("sales_offer_templates")
    .insert({
      company_id: companyId,
      name,
      payload,
      created_by: createdBy,
    })
    .select("id,company_id,name,payload,created_by,created_at,updated_at")
    .single();
}

export function deleteSalesOfferTemplate(client, templateId, companyId) {
  return client
    .from("sales_offer_templates")
    .delete()
    .eq("id", templateId)
    .eq("company_id", companyId);
}

export function fetchProjectsByIds(client, projectIds) {
  return client.from("projects").select("id").in("id", projectIds);
}

export function fetchProjectById(client, projectId) {
  return client.from("projects").select("id").eq("id", projectId).maybeSingle();
}

export function fetchProjectsByOwner(client, userId) {
  return client.from("projects").select("id,data").eq("user_id", userId);
}

const documentReferenceKey = (file = {}) => {
  const path = String(
    file?.path || file?.storagePath || file?.filePath || ""
  ).trim();
  if (path) return `path:${path}`;

  const url = String(file?.url || file?.href || "").trim();
  if (url) return `url:${url}`;

  return `fallback:${String(file?.name || "").trim()}:${Number(file?.size || 0)}`;
};

const projectBoundSalesDocument = (file = {}, projectId = "") => {
  const path = String(
    file?.path || file?.storagePath || file?.filePath || ""
  ).trim();
  const isPrivateSalesDocument =
    path &&
    (isPrivateSalesLogicalPath(path) || isPrivateOfferAttachmentLogicalPath(path));

  if (!isPrivateSalesDocument || !projectId) return file;

  return {
    ...file,
    url: buildPrivateDocumentAppUrl({
      path,
      projectId,
      role: "kunde",
    }),
  };
};

const collectAcceptedOfferAttachments = (payload = {}, projectId = "") => {
  const groups = [
    {
      sourceType: "line",
      items: Array.isArray(payload?.acceptedOfferLines)
        ? payload.acceptedOfferLines
        : [],
    },
    {
      sourceType: "option",
      items: Array.isArray(payload?.acceptedOptions)
        ? payload.acceptedOptions
        : [],
    },
  ];
  const collected = [];

  for (const group of groups) {
    for (const item of group.items) {
      const attachment = item?.attachmentFile;
      if (!attachment || attachment?.customerVisible === false) continue;

      const path = String(
        attachment?.path || attachment?.storagePath || attachment?.filePath || ""
      ).trim();
      const url = String(attachment?.url || attachment?.href || "").trim();
      if (!path && !url) continue;

      collected.push(
        projectBoundSalesDocument(
          {
            ...attachment,
            id:
              attachment.id ||
              globalThis.crypto?.randomUUID?.() ||
              `accepted-attachment-${Date.now()}-${Math.random()}`,
            documentType: "accepted-offer-attachment",
            acceptedOfferAttachment: true,
            acceptedOfferSourceType: group.sourceType,
            acceptedOfferSourceId: String(item?.id || ""),
            acceptedOfferSourceLabel: String(
              item?.title || item?.description || item?.mainPostTitle || ""
            ).trim(),
          },
          projectId
        )
      );
    }
  }

  return collected;
};

const mergeProjectAgreementFiles = (
  existingFiles = [],
  acceptedAttachments = [],
  projectId = ""
) => {
  const seen = new Set();
  const merged = [];

  for (const sourceFile of [
    ...(Array.isArray(existingFiles) ? existingFiles : []),
    ...(Array.isArray(acceptedAttachments) ? acceptedAttachments : []),
  ]) {
    if (!sourceFile) continue;

    const file = projectBoundSalesDocument(
      {
        ...sourceFile,
        id:
          sourceFile.id ||
          globalThis.crypto?.randomUUID?.() ||
          `agreement-file-${Date.now()}-${Math.random()}`,
      },
      projectId
    );
    const key = documentReferenceKey(file);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(file);
  }

  return merged;
};

async function enrichSalesProjectAgreementFiles(client, projectRow = {}) {
  const projectId = String(projectRow?.id || "").trim();
  const requestRef = String(
    projectRow?.data?.project?.salesOrigin?.requestRef || ""
  ).trim();

  if (!projectId || !requestRef) return projectRow;

  const { data: companyScopeId, error: scopeError } =
    await resolveSalesCompanyScope(client);
  if (scopeError) throw scopeError;
  if (!companyScopeId) {
    throw new Error("Kunne ikke fastslå firma ved prosjektaktivering.");
  }

  const { data: salesRequest, error: requestError } = await client
    .from("sales_requests")
    .select("payload")
    .eq("company_id", companyScopeId)
    .eq("request_ref", requestRef)
    .maybeSingle();

  if (requestError) throw requestError;
  if (!salesRequest?.payload) {
    throw new Error("Fant ikke akseptdata for salgssaken ved prosjektaktivering.");
  }

  const expectedVersionId = String(
    projectRow?.data?.project?.salesOrigin?.acceptedOfferVersionId || ""
  ).trim();
  const storedVersionId = String(
    salesRequest.payload?.acceptedOfferVersionId || ""
  ).trim();

  if (
    expectedVersionId &&
    storedVersionId &&
    expectedVersionId !== storedVersionId
  ) {
    throw new Error(
      "Akseptert tilbudsversjon stemmer ikke med prosjektgrunnlaget. Oppdater saken før aktivering."
    );
  }

  const acceptedAttachments = collectAcceptedOfferAttachments(
    salesRequest.payload,
    projectId
  );
  const existingFiles = Array.isArray(projectRow?.data?.tilbud?.files)
    ? projectRow.data.tilbud.files
    : [];
  const nextFiles = mergeProjectAgreementFiles(
    existingFiles,
    acceptedAttachments,
    projectId
  );

  return {
    ...projectRow,
    data: {
      ...(projectRow.data || {}),
      tilbud: {
        ...(projectRow?.data?.tilbud || {}),
        files: nextFiles,
      },
    },
  };
}

export async function createSalesProject(client, projectRow) {
  if (isSalesSupportMode()) {
    return {
      data: null,
      error: new Error(
        "Prosjektaktivering er sperret i Sales-supportmodus. Gå tilbake til eget firma før prosjektet aktiveres."
      ),
    };
  }

  try {
    const enrichedProjectRow = await enrichSalesProjectAgreementFiles(
      client,
      projectRow
    );
    return client
      .from("projects")
      .insert(enrichedProjectRow)
      .select("id")
      .single();
  } catch (error) {
    return { data: null, error };
  }
}

export function fetchProfileById(client, userId, profileSelect) {
  return client
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle();
}

export function fetchProfileByEmail(client, email, profileSelect) {
  return client
    .from("profiles")
    .select(profileSelect)
    .ilike("email", email)
    .maybeSingle();
}

const shouldUsePrivateSalesStorage = (bucket, path) =>
  bucket === LEGACY_PUBLIC_DOCUMENT_BUCKET &&
  (isPrivateSalesLogicalPath(path) || isPrivateOfferAttachmentLogicalPath(path));

async function resolvePrivateSalesStoragePath(client, bucket, path) {
  if (!shouldUsePrivateSalesStorage(bucket, path)) return "";

  const { data: companyScopeId, error } = await resolveSalesCompanyScope(client);
  if (error) throw error;
  if (!companyScopeId) {
    throw new Error("Kunne ikke fastslå firma for privat dokumentlagring.");
  }

  const privatePath = buildPrivateSalesStoragePath({
    companyScopeId,
    logicalPath: path,
  });
  if (!privatePath) {
    throw new Error("Kunne ikke bygge sikker Storage-path for dokumentet.");
  }
  return privatePath;
}

export async function uploadStorageFile(client, bucket, path, file, options) {
  if (!shouldUsePrivateSalesStorage(bucket, path)) {
    return client.storage.from(bucket).upload(path, file, options);
  }

  try {
    const privatePath = await resolvePrivateSalesStoragePath(client, bucket, path);
    return client.storage.from(PRIVATE_DOCUMENT_BUCKET).upload(privatePath, file, options);
  } catch (error) {
    return { data: null, error };
  }
}

export function downloadStorageFile(client, bucket, path) {
  return client.storage.from(bucket).download(path);
}

export function createStorageSignedUrl(client, bucket, path, expiresIn) {
  return client.storage.from(bucket).createSignedUrl(path, expiresIn);
}

export function getStoragePublicUrl(client, bucket, path) {
  if (shouldUsePrivateSalesStorage(bucket, path)) {
    return {
      data: {
        publicUrl: buildPrivateDocumentAppUrl({ path }),
      },
    };
  }
  return client.storage.from(bucket).getPublicUrl(path);
}

export async function removeStorageFiles(client, bucket, paths) {
  const safePaths = Array.isArray(paths) ? paths.filter(Boolean) : [];
  if (!safePaths.length) return { data: [], error: null };

  const privateLogicalPaths = safePaths.filter((path) =>
    shouldUsePrivateSalesStorage(bucket, path)
  );
  const ordinaryPaths = safePaths.filter(
    (path) => !shouldUsePrivateSalesStorage(bucket, path)
  );
  const removed = [];

  try {
    if (privateLogicalPaths.length) {
      const privatePaths = [];
      for (const logicalPath of privateLogicalPaths) {
        privatePaths.push(
          await resolvePrivateSalesStoragePath(client, bucket, logicalPath)
        );
      }
      const { data, error } = await client.storage
        .from(PRIVATE_DOCUMENT_BUCKET)
        .remove(privatePaths);
      if (error) return { data: null, error };
      if (Array.isArray(data)) removed.push(...data);
    }

    if (ordinaryPaths.length) {
      const { data, error } = await client.storage.from(bucket).remove(ordinaryPaths);
      if (error) return { data: null, error };
      if (Array.isArray(data)) removed.push(...data);
    }

    return { data: removed, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function invokeSmartWorker(client, payload) {
  return client.functions.invoke("smart-worker", { body: payload });
}
