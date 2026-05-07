// Generated complete main.jsx from the latest live source.
// Admin: old FDV-register UI removed; Produktmaster is now the active admin document register.
import React, * as ReactNS from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';
import { jsx, jsxs } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_client = { createRoot };
const import_supabase_js = { createClient };
const import_lucide_react = { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck };
const import_jsx_runtime = { jsx, jsxs };
  var supabase = (0, import_supabase_js.createClient)(
    "https://dqffxflaoyarbxyiyhop.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE"
  );
  var uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  var productSections = [
    { title: "Avretting / st\xF8peprodukter", items: ["Sopro VS582 Avretting", "Sopro 3.50 Avretting", "Sopro HF-S 563 Avretting", "Sopro FS 5\xAE Avretting", "Sopro RDS 960 - Ekspansjonsb\xE5nd", "Sopro Classic EM Hurtigst\xF8p", "Sopro RAM 3\xAE reparasjon og st\xF8pem\xF8rtel", "Sopro RS 462 reparasjonsm\xF8rtel", "Sopro Rapidur M5\xAE hurtigst\xF8p"] },
    { title: "Primer / forsterkningsduk", items: ["Sopro PG-X 1188", "Sopro EPG 1522 - 2 Komponent Epoxy primer", "Sopro HPS 673 - spesial primer ikke sugende", "Sopro GD 749 - primer sugende underlag", "Sopro SG 874 Dampsperre-Primer"] },
    { title: "Membransystem / tetting", items: ["Sopro FDK 1-K 1180 membranlim", "Sopro FDF 527 sm\xF8remembran lys gr\xE5", "Sopro DSF 623 RS - 1K sementbasert membran", "AEB 815 Tetteduk", "Sopro BBM 134 Slukmansjett", "Sopro FDB 524 selvklebende tetteb\xE5nd", "Sopro AEB 816 Tetteb\xE5nd", "Sopro AEB 821 Hj\xF8rnemansjett innerhj\xF8rne", "Sopro AEB 822 Hj\xF8rnemansjett ytterhj\xF8rne", "Sopro AEB 825 R\xF8rmansjett \xD810-24mm", "Sopro AEB 826 R\xF8rmansjett \xD832-55mm", "Sopro AEB 827 R\xF8rmansjett \xD875-110mm", "Sopro AEB 828 R\xF8rmansjett \xD8110-140mm"] },
    { title: "Limprodukter / festeprodukter", items: ["Sopro\u2019s No.1 400 Flislim", "Sopro\u2019s No.1 403 Silver Hurtig flislim", "Sopro FKM XL 444 St\xF8vredusert flislim", "Sopro FKM 5555 Hurtig flislim", "Sopro FF 450 - Sigefri flislim", "Soudal Fix All HT", "Soudal Fix All Turbo"] },
    { title: "Fugemasse / silikon", items: ["Sopro DFH Bruksklar fugemasse", "Sopro DFX epoxyfug", "Sopro DF 10\xAE Designfug", "Sopro FL plus Fugemasse", "Sopro Sanit\xE6r Silikon", "Sopro Ceramic Silikon"] }
  ];
  var surfaces = ["Veggflis 1", "Veggflis 2", "Veggflis 3", "Gulvflis 1", "Gulvflis 2", "Gulvflis 3", "Mosaikkfliser vegg", "Mosaikkfliser gulv", "Dekorfliser"];
  var imageCats = ["F\xF8r arbeid", "Underlag", "Avretting/st\xF8p", "Primer", "Membran", "Sluk og mansjetter", "R\xF8rgjennomf\xF8ringer", "Flislegging", "Fuging/silikon", "Ferdig resultat"];
  var roles = ["Eier / administrator", "Ansatt", "Underleverand\xF8r", "Kun lesetilgang"];
  var installCats = ["R\xF8rlegger", "T\xF8mrer/Snekker", "Maler", "Andre"];
  var accessRoleInfo = [
    { role: "Eier / administrator", text: "Full tilgang til prosjekt, rapport, firmaprofil, prosjektliste, deling og brukergodkjenning." },
    { role: "Ansatt", text: "Kan normalt opprette, endre og dokumentere prosjekter for firmaet." },
    { role: "Underleverand\xF8r", text: "Anbefales for fag som skal bidra med dokumentasjon, bilder, sjekklister eller utstyr p\xE5 prosjektet." },
    { role: "Kun lesetilgang", text: "Kunde/byggherre f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat." }
  ];
  var checklistTemplate = [
    {
      category: "Tildekning/forarbeid",
      items: [
        "Underlag kontrollert",
        "Fall kontrollert",
        "Sluk korrekt montert",
        "Terskel og h\xF8yder kontrollert"
      ]
    },
    {
      category: "Avretting / underlag",
      items: [
        "Det er avrettet p\xE5 tregulv/spon eller betong",
        "Alle sprekker og krakeleringer er fjernet",
        "Overflatestyrken er kontrollert med risspr\xF8ve",
        "Vedheft mellom r\xE5betong og pusslag er kontrollert med bankepr\xF8ve",
        "Underlaget er fritt for olje, fett, st\xF8v, skitt, m\xF8rtelrester, l\xF8s betong og lignende",
        "Trekk i rommet er kontrollert",
        "Gulvvarme er sl\xE5tt av",
        "Restfukt/RF er kontrollert iht. krav f\xF8r videre belegning/membran"
      ]
    },
    {
      category: "Primer / underlag",
      items: [
        "Riktig primer valgt",
        "Primer p\xE5f\xF8rt",
        "T\xF8rketid fulgt"
      ]
    },
    {
      category: "Membran / tetting",
      items: [
        "Membranl\xF8sning kontrollert",
        "Tetteb\xE5nd montert",
        "Slukmansjett montert",
        "R\xF8rmansjetter montert",
        "Trykktesting av membran",
        "Minimum 5 cm overlapp p\xE5 skj\xF8ter med tetningsduk/tetteb\xE5nd er kontrollert",
        "Riktig membrantykkelse p\xE5 vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
      ]
    },
    {
      category: "Flislegging / flislim",
      items: [
        "Fliser montert iht. plan",
        "Limdekning mellom fliser og underlag er kontrollert",
        "Stikkpr\xF8ve/slakting av flis er utf\xF8rt mens flislim fortsatt er v\xE5tt"
      ]
    },
    {
      category: "Fuging / silikon",
      items: [
        "Fugemasse er blandet/r\xF8rt opp med korrekt vanntilsetning iht. datablad",
        "Fugene er helt fylt opp f\xF8r rengj\xF8ring",
        "Fugene er jevne, glatte, ensartet og uten hull og sprekker etter rengj\xF8ring",
        "Fugesl\xF8r er vasket av med svamp og rent vann",
        "Silikon utf\xF8rt"
      ]
    },
    {
      category: "Sluttkontroll",
      items: [
        "Visuell kontroll utf\xF8rt",
        "Bilder tatt",
        "Dokumentasjon komplett"
      ]
    }
  ];
  var emptyTilbud = () => ({
    enabled: false,
    files: [],
    tillegg: "",
    fradrag: "",
    kommentar: ""
  });
  var emptyOvertagelse = () => ({
    enabled: false,
    dato: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    kommentar: "",
    signUtf\u00F8rende: "",
    signKunde: "",
    signUtf\u00F8rendeImage: "",
    signKundeImage: ""
  });
  var emptyProject = () => ({
    responsible: "",
    projectName: "",
    address: "",
    postnr: "",
    city: "",
    customer: "",
    customerEmail: "",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    notes: "",
    fall: "",
    fallDusj: "",
    fallUtenfor: "",
    sluk: "",
    terskel: "",
    membran: "",
    prosjekteringKommentar: "",
    prosjekteringPunkter: [],
    locked: false,
    status: "active",
    lockedAt: "",
    lockedBy: ""
  });
  var emptyProjectLog = () => ({
    enabled: false,
    draft: "",
    messages: [],
    lastReadByAdmin: "",
    lastReadByCustomer: ""
  });
  var normalizeProjectLog = (log = {}) => ({
    ...emptyProjectLog(),
    ...log || {},
    messages: Array.isArray(log?.messages) ? log.messages : []
  });
  var normalizeManualProductsBySection = (value = {}) => {
    const result = {};
    const addProduct = (section, product) => {
      const cleanSection = String(section || product?.section || product?.trade || "Andre produkter").trim() || "Andre produkter";
      const cleanProduct = {
        id: product?.id || uid(),
        name: product?.name || product?.product_name || "",
        fdvUrl: product?.fdvUrl || product?.fdv_url || "",
        comment: product?.comment || ""
      };
      result[cleanSection] = [...result[cleanSection] || [], cleanProduct];
    };
    if (Array.isArray(value)) {
      value.forEach((product) => addProduct(product?.section || product?.trade || "Andre produkter", product || {}));
      return result;
    }
    Object.entries(value || {}).forEach(([section, products]) => {
      if (Array.isArray(products)) {
        products.forEach((product) => addProduct(section, product || {}));
      }
    });
    return result;
  };
  function App() {
    const [tab, setTab] = (0, import_react.useState)("prosjekt");
    const [company, setCompany] = (0, import_react.useState)({ companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
    const [user, setUser] = (0, import_react.useState)({ name: "", email: "", role: "Eier / administrator" });
    const [project, setProject] = (0, import_react.useState)(emptyProject());
    const [checked, setChecked] = (0, import_react.useState)({});
    const [productDocs, setProductDocs] = (0, import_react.useState)({});
    const [manualProducts, setManualProducts] = (0, import_react.useState)({});
    const [other, setOther] = (0, import_react.useState)({});
    const [surf, setSurf] = (0, import_react.useState)({});
    const [photos, setPhotos] = (0, import_react.useState)([]);
    const [access, setAccess] = (0, import_react.useState)([]);
    const [inst, setInst] = (0, import_react.useState)([]);
    const [files, setFiles] = (0, import_react.useState)([]);
    const [checklist, setChecklist] = (0, import_react.useState)({});
    const [tilbud, setTilbud] = (0, import_react.useState)(emptyTilbud());
    const [overtagelse, setOvertagelse] = (0, import_react.useState)(emptyOvertagelse());
    const [chatUploadFile, setChatUploadFile] = (0, import_react.useState)(null);
    const [customerChatUploadFile, setCustomerChatUploadFile] = (0, import_react.useState)(null);
    const [projectLog, setProjectLog] = (0, import_react.useState)(emptyProjectLog());
    const [customerTab, setCustomerTab] = (0, import_react.useState)("rapport");
    const [internalNotes, setInternalNotes] = (0, import_react.useState)("");
    const [projects, setProjects] = (0, import_react.useState)([]);
    const [projectId, setProjectId] = (0, import_react.useState)(null);
    const [mobileCreatingProject, setMobileCreatingProject] = (0, import_react.useState)(false);
    const [authUser, setAuthUser] = (0, import_react.useState)(null);
    const [authEmail, setAuthEmail] = (0, import_react.useState)("");
    const [authPassword, setAuthPassword] = (0, import_react.useState)("");
    const [passwordRecovery, setPasswordRecovery] = (0, import_react.useState)(false);
    const [newPassword, setNewPassword] = (0, import_react.useState)("");
    const [newPasswordRepeat, setNewPasswordRepeat] = (0, import_react.useState)("");
    const [authLoading, setAuthLoading] = (0, import_react.useState)(true);
    const [profile, setProfile] = (0, import_react.useState)(null);
    const [profileLoading, setProfileLoading] = (0, import_react.useState)(false);
    const [adminUsers, setAdminUsers] = (0, import_react.useState)([]);
    const [adminLoading, setAdminLoading] = (0, import_react.useState)(false);
    const [projectSearch, setProjectSearch] = (0, import_react.useState)("");
    const [projectStatusFilter, setProjectStatusFilter] = (0, import_react.useState)("alle");
    const [projectUnreadOnly, setProjectUnreadOnly] = (0, import_react.useState)(false);
    const [fdvRegister, setFdvRegister] = (0, import_react.useState)([]);
    const [fdvLoading, setFdvLoading] = (0, import_react.useState)(false);
    const [productMaster, setProductMaster] = (0, import_react.useState)([]);
    const [productMasterLoading, setProductMasterLoading] = (0, import_react.useState)(false);
    const latestStateRef = (0, import_react.useRef)({});
    const lastChatMessageCountRef = (0, import_react.useRef)(0);
    const lastChatRefreshAtRef = (0, import_react.useRef)(0);
    (0, import_react.useEffect)(() => {
      latestStateRef.current = {
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        projectLog,
        internalNotes
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog, internalNotes]);
    (0, import_react.useEffect)(() => {
      const savedEmail = window.localStorage.getItem("expoProffDokAuthEmail");
      if (savedEmail) setAuthEmail(savedEmail);
    }, []);
    const selected = (0, import_react.useMemo)(() => productSections.flatMap((s) => s.items.filter((i) => checked[i]).map((i) => ({
      section: s.title,
      item: i,
      fdvUrl: productDocs[i]?.fdvUrl || "",
      databladUrl: productDocs[i]?.databladUrl || "",
      dopUrl: productDocs[i]?.dopUrl || "",
      epdUrl: productDocs[i]?.epdUrl || "",
      sikkerhetsdatabladUrl: productDocs[i]?.sikkerhetsdatabladUrl || "",
      documentFileUrl: productDocs[i]?.documentFileUrl || "",
      comment: productDocs[i]?.comment || ""
    }))), [checked, productDocs]);
    const manualProductsBySection = (0, import_react.useMemo)(() => normalizeManualProductsBySection(manualProducts), [manualProducts]);
    const getManualProductsForSection = (section) => manualProductsBySection[section] || [];
    const manualSelected = (0, import_react.useMemo)(() => {
      return Object.entries(manualProductsBySection || {}).flatMap(
        ([section, products]) => (products || []).filter((p) => hasValue(p.name) || hasValue(p.fdvUrl) || hasValue(p.comment)).map((p) => ({ ...p, section }))
      );
    }, [manualProductsBySection]);
    const fdvRegisterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (fdvRegister || []).forEach((row) => {
        if (row?.product_name) map[row.product_name] = row;
      });
      return map;
    }, [fdvRegister]);
    const productMasterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (productMaster || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    }, [productMaster]);
    const productMasterStats = (0, import_react.useMemo)(() => {
      const rows = productMaster || [];
      const withDocs = rows.filter((row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].some(hasValue)).length;
      const appMatches = rows.filter((row) => row?.used_in_app_standard_list || hasValue(row?.app_match_name)).length;
      return { total: rows.length, withDocs, appMatches };
    }, [productMaster]);
    const name = company.companyName || "Expo Proffsenter";
    const urlParams = new URLSearchParams(window.location.search);
    const accessMode = urlParams.get("access") || urlParams.get("role") || (urlParams.has("project") ? "kunde" : "");
    const isAdminProjectLink = urlParams.has("project") && accessMode === "admin";
    const isUnderleverandorView = urlParams.has("project") && accessMode === "underleverandor";
    const isReadOnly = urlParams.has("project") && !isUnderleverandorView && !isAdminProjectLink;
    const isAdminUser = !!authUser && (profile?.is_admin === true || profile?.role === "admin" || authUser.email === "kenneth@ringside.no" || !!company.email && authUser.email === company.email);
    const projectIsLocked = (p = project) => p?.locked === true || p?.locked === "true" || p?.status === "locked" || p?.status === "Avsluttet";
    const applyLockState = (baseProject, sourceProject = {}) => ({
      ...baseProject,
      locked: projectIsLocked(sourceProject),
      status: projectIsLocked(sourceProject) ? "locked" : sourceProject.status || baseProject.status || "active",
      lockedAt: sourceProject.lockedAt || "",
      lockedBy: sourceProject.lockedBy || ""
    });
    const isProjectLocked = projectIsLocked(project);
    const projectHasOvertagelse = (o = overtagelse) => !!o?.enabled || hasValue(o?.dato) || hasValue(o?.kommentar) || hasValue(o?.signUtf\u00F8rende) || hasValue(o?.signKunde) || hasValue(o?.signUtf\u00F8rendeImage) || hasValue(o?.signKundeImage);
    const projectStatusInfo = (p = project, o = overtagelse) => {
      const locked = projectIsLocked(p);
      if (locked && projectHasOvertagelse(o)) return { label: "Ferdigstilt", icon: "\u2705", tone: "done" };
      if (locked) return { label: "Avsluttet / l\xE5st", icon: "\u{1F512}", tone: "locked" };
      if (p?.projectName || p?.address || p?.customer || projectHasOvertagelse(o)) return { label: "P\xE5g\xE5r", icon: "\u{1F7E1}", tone: "progress" };
      return { label: "\xC5pen", icon: "\u{1F7E2}", tone: "open" };
    };
    const currentStatus = projectStatusInfo(project, overtagelse);
    const statusStyle = (tone) => ({
      background: tone === "done" ? "#ecfdf5" : tone === "locked" ? "#f8fafc" : tone === "progress" ? "#fffbeb" : "#eff6ff",
      color: tone === "done" ? "#065f46" : tone === "locked" ? "#334155" : tone === "progress" ? "#92400e" : "#075985"
    });
    const chatMessages = projectLog?.messages || [];
    const customerChatCount = chatMessages.filter((m) => m.role === "kunde").length;
    const totalChatCount = chatMessages.length;
    const latestChatMessage = chatMessages.length ? chatMessages[chatMessages.length - 1] : null;
    const lastReadByAdmin = projectLog?.lastReadByAdmin || "";
    const lastReadByCustomer = projectLog?.lastReadByCustomer || "";
    const unreadForAdmin = chatMessages.filter((m) => m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin)).length;
    const unreadForCustomer = chatMessages.filter((m) => m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer)).length;
    const rowIsLocked = (row) => row?.locked === true || row?.locked === "true" || projectIsLocked(row?.data?.project || {});
    const projectFromRow = (row, fallbackProject = project) => {
      const dataProject = row?.data?.project || {};
      const lockedValue = rowIsLocked(row);
      return {
        ...emptyProject(),
        ...dataProject,
        ...fallbackProject,
        locked: lockedValue,
        status: lockedValue ? "locked" : dataProject.status || fallbackProject.status || "active",
        lockedAt: row?.locked_at || dataProject.lockedAt || fallbackProject.lockedAt || "",
        lockedBy: row?.locked_by || dataProject.lockedBy || fallbackProject.lockedBy || ""
      };
    };
    const dataFromRow = (row, fallbackData = {}) => ({
      ...row?.data || fallbackData || {},
      project: projectFromRow(row, (row?.data || fallbackData || {}).project || emptyProject())
    });
    const projectListRows = (0, import_react.useMemo)(() => {
      return (projects || []).map((row) => {
        const data = row.data || {};
        const listProject = projectFromRow(row, data.project || {});
        const listStatus = projectStatusInfo(listProject, data.overtagelse || {});
        const listLog = normalizeProjectLog(data.projectLog);
        const messages = listLog.messages || [];
        const unreadForAdminInList = messages.filter((m) => m.role === "kunde" && (!listLog.lastReadByAdmin || (m.created || "") > listLog.lastReadByAdmin)).length;
        const latestMessage = messages.length ? messages[messages.length - 1] : null;
        const photoImages = Array.isArray(data.photos) ? data.photos.filter((photo) => photo?.url).map((photo) => ({
          url: photo.url,
          label: photo.cat || photo.name || "Prosjektbilde",
          source: "Bilder"
        })) : [];
        const checklistImages = [];
        Object.entries(data.checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).forEach((photo) => {
              if (photo?.url) checklistImages.push({
                url: photo.url,
                label: `${category} \xB7 ${item}`,
                source: "Sjekkliste"
              });
            });
          });
        });
        const installImages = [];
        (Array.isArray(data.inst) ? data.inst : []).forEach((entry) => {
          (entry?.photos || []).forEach((photo) => {
            if (photo?.url) installImages.push({
              url: photo.url,
              label: entry.name || entry.category || photo.name || "Fag/utstyr",
              source: "Fag/utstyr"
            });
          });
        });
        const chatImages = messages.filter((message) => message?.imageUrl).map((message) => ({
          url: message.imageUrl,
          label: message.imageName || message.text || "Chatbilde",
          source: "Chat"
        }));
        const allProjectImages = [...photoImages, ...checklistImages, ...installImages, ...chatImages];
        const imageSummary = {
          total: allProjectImages.length,
          photos: photoImages.length,
          checklist: checklistImages.length,
          install: installImages.length,
          chat: chatImages.length,
          previews: allProjectImages.slice(0, 4)
        };
        const searchable = [
          row.title,
          listProject.projectName,
          listProject.customer,
          listProject.address,
          listProject.city,
          listProject.postnr,
          listProject.customerEmail,
          listProject.responsible
        ].filter(Boolean).join(" ").toLowerCase();
        return { row, listProject, listStatus, listLog, unreadForAdminInList, latestMessage, imageSummary, searchable };
      });
    }, [projects]);
    const filteredProjectListRows = (0, import_react.useMemo)(() => {
      const term = (projectSearch || "").trim().toLowerCase();
      return projectListRows.filter((item) => {
        if (term && !item.searchable.includes(term)) return false;
        if (projectUnreadOnly && item.unreadForAdminInList <= 0) return false;
        if (projectStatusFilter !== "alle" && item.listStatus.tone !== projectStatusFilter) return false;
        return true;
      });
    }, [projectListRows, projectSearch, projectStatusFilter, projectUnreadOnly]);
    const activeMobileProjectRows = (0, import_react.useMemo)(() => {
      return filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked");
    }, [filteredProjectListRows]);
    const projectListStats = (0, import_react.useMemo)(() => {
      const total = projectListRows.length;
      const unread = projectListRows.reduce((sum, item) => sum + item.unreadForAdminInList, 0);
      const active = projectListRows.filter((item) => item.listStatus.tone === "progress" || item.listStatus.tone === "open").length;
      const finished = projectListRows.filter((item) => item.listStatus.tone === "done" || item.listStatus.tone === "locked").length;
      return { total, unread, active, finished, visible: filteredProjectListRows.length };
    }, [projectListRows, filteredProjectListRows]);
    const tabs = [
      ["prosjekt", "Prosjekt"],
      ["firma", "Firmaprofil"],
      ["prosjektering", "Prosjektering"],
      ["produkter", "Produkter"],
      ["overflater", "Overflater"],
      ["bilder", "Bilder"],
      ["tilgang", "Tilgang"],
      ["installasjoner", "Fag/utstyr"],
      ["sjekklister", "Sjekklister"],
      ["tilbud", "Tilbud/kontrakt"],
      ["overtagelse", "Overtagelse"],
      ["chat", unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount})` : "Chat"],
      ["internt", "Interne notater"],
      ["prosjektliste", "Prosjektliste"],
      ["rapport", "Rapport"],
      ...isAdminUser && !isReadOnly ? [["admin", "Admin"]] : []
    ];
    const currentTabIndex = tabs.findIndex(([id]) => id === tab);
    const previousTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
    const nextTab = currentTabIndex >= 0 && currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;
    const goToTab = (id) => {
      if (!id) return;
      setTab(id);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };
    const packData = () => ({ company, user, project, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog, internalNotes });
    const unpackData = (data, preserveDraft = false) => {
      setCompany(data.company || { companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
      setUser(data.user || { name: "", email: "", role: "Eier / administrator" });
      setProject({ ...emptyProject(), ...data.project || {} });
      setChecked(data.checked || {});
      setProductDocs(data.productDocs || {});
      if (Array.isArray(data.manualProducts)) {
        const migratedManual = {};
        data.manualProducts.forEach((p) => {
          const section = p.trade || "Andre produkter";
          migratedManual[section] = [...migratedManual[section] || [], { ...p, trade: void 0 }];
        });
        setManualProducts(migratedManual);
      } else {
        setManualProducts(data.manualProducts || {});
      }
      setOther(data.other || {});
      setSurf(data.surf || {});
      setPhotos(data.photos || []);
      setAccess(data.access || []);
      setInst(data.inst || []);
      setFiles(data.files || []);
      setChecklist(data.checklist || {});
      setTilbud(data.tilbud || emptyTilbud());
      setOvertagelse(data.overtagelse || emptyOvertagelse());
      const incomingLog = normalizeProjectLog(data.projectLog);
      setProjectLog((prev) => ({
        ...incomingLog,
        draft: preserveDraft ? prev?.draft || "" : incomingLog.draft || ""
      }));
      setInternalNotes(data.internalNotes || "");
    };
    const loadProjects = async (currentUser = authUser, notify = false) => {
      if (!currentUser) {
        setProjects([]);
        if (notify) alert("Du m\xE5 v\xE6re logget inn for \xE5 hente prosjektliste.");
        return;
      }
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", currentUser.id).order("updated_at", { ascending: false });
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente prosjektliste: " + error.message);
      }
      setProjects(data || []);
      if (notify) alert(`Prosjektliste oppdatert. Fant ${(data || []).length} prosjekt${(data || []).length === 1 ? "" : "er"}.`);
    };
    const openProjectById = async (id, targetTab = "rapport") => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error || !data) {
        console.error(error);
        return alert("Kunne ikke \xE5pne prosjekt: " + (error?.message || "Fant ikke prosjekt"));
      }
      unpackData(dataFromRow(data));
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setTab(targetTab);
    };
    const refreshProjectFromCloud = async (silent = false, fullRefresh = false) => {
      if (!projectId) return;
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error || !data) {
        console.error(error);
        if (!silent) alert("Kunne ikke oppdatere prosjektdata: " + (error?.message || "Fant ikke prosjekt"));
        return;
      }
      const cloudData = dataFromRow(data);
      const incomingLog = normalizeProjectLog(cloudData.projectLog);
      const isChatRefresh = !fullRefresh && (silent || tab === "chat" || customerTab === "chat" || isReadOnly);
      if (isChatRefresh) {
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => {
          const currentDraft = prev?.draft || "";
          const currentCount = (prev?.messages || []).length;
          if (incomingCount > currentCount && !silent) {
          }
          return {
            ...incomingLog,
            draft: currentDraft
          };
        });
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(data.id);
        if (!silent) alert("Chat oppdatert.");
        return;
      }
      unpackData(cloudData, true);
      lastChatMessageCountRef.current = (incomingLog.messages || []).length;
      lastChatRefreshAtRef.current = Date.now();
      setProjectId(data.id);
      if (!silent) alert("Prosjektdata oppdatert.");
    };
    const applyProfile = (row) => {
      if (!row) return;
      setProfile(row);
      setCompany((c) => ({
        ...c,
        companyName: row.company_name || c.companyName || "Expo Proffsenter",
        orgNumber: row.org_number || "",
        address: row.address || "",
        phone: row.phone || "",
        email: row.email || "",
        website: row.website || "",
        logoUrl: row.logo_url || c.logoUrl || ""
      }));
    };
    const ensureProfile = async (sessionUser) => {
      if (!sessionUser) return null;
      setProfileLoading(true);
      let { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle();
      if (error) {
        console.error(error);
        alert("Kunne ikke hente brukerprofil: " + error.message);
        setProfileLoading(false);
        return null;
      }
      if (!data) {
        const { data: inserted, error: insertError } = await supabase.from("profiles").insert({ id: sessionUser.id, email: sessionUser.email, approved: false }).select("*").single();
        if (insertError) {
          console.error(insertError);
          alert("Kunne ikke opprette brukerprofil: " + insertError.message);
          setProfileLoading(false);
          return null;
        }
        data = inserted;
      }
      applyProfile(data);
      setProfileLoading(false);
      return data;
    };
    const handleAuthUser = async (sessionUser) => {
      setAuthUser(sessionUser);
      if (!sessionUser) {
        setProjects([]);
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      const row = await ensureProfile(sessionUser);
      if (row?.approved) loadProjects(sessionUser);
    };
    (0, import_react.useEffect)(() => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const id = params.get("project");
      const isRecoveryLink = params.get("type") === "recovery" || hashParams.get("type") === "recovery";
      if (isRecoveryLink) {
        setPasswordRecovery(true);
      }
      if (id && !isRecoveryLink) {
        openProjectById(id);
        if ((params.get("access") || params.get("role")) === "underleverandor") setTab("produkter");
        if ((params.get("access") || params.get("role")) !== "admin") {
          setAuthLoading(false);
          return;
        }
      }
      supabase.auth.getSession().then(({ data }) => {
        handleAuthUser(data.session?.user || null).finally(() => setAuthLoading(false));
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }
        handleAuthUser(session?.user || null);
      });
      return () => listener.subscription.unsubscribe();
    }, []);
    (0, import_react.useEffect)(() => {
      if (!projectId) return;
      const chatVisible = isReadOnly || tab === "chat" || customerTab === "chat";
      if (!chatVisible) return;
      let cancelled = false;
      const applyChatData = (row) => {
        if (!row || cancelled) return;
        const cloudData = dataFromRow(row);
        const incomingLog = normalizeProjectLog(cloudData.projectLog);
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => ({
          ...incomingLog,
          draft: prev?.draft || ""
        }));
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(row.id);
      };
      const channel = supabase.channel(`project-chat-${projectId}`).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => applyChatData(payload.new)
      ).subscribe();
      refreshProjectFromCloud(true);
      const timer = window.setInterval(() => {
        refreshProjectFromCloud(true);
      }, 5e3);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        supabase.removeChannel(channel);
      };
    }, [projectId, isReadOnly, tab, customerTab]);
    (0, import_react.useEffect)(() => {
      if (!isReadOnly) {
        loadFdvRegister(false);
        loadProductMaster(false);
      }
    }, [isReadOnly]);
    const createNewProject = () => {
      const hasContent = projectId || project.projectName || project.address || project.postnr || project.city || project.customer || project.customerEmail || project.notes || project.fall || project.fallDusj || project.fallUtenfor || project.sluk || project.terskel || project.membran || project.prosjekteringKommentar || (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).length || Object.keys(checked || {}).length || Object.keys(productDocs || {}).length || (Array.isArray(manualProducts) ? manualProducts.length : Object.values(manualProducts || {}).some((list) => (list || []).length)) || Object.keys(other || {}).length || Object.keys(surf || {}).length || (photos || []).length || (access || []).length || (inst || []).length || (files || []).length || Object.keys(checklist || {}).length || tilbud.enabled || tilbud.tillegg || tilbud.fradrag || tilbud.kommentar || (tilbud.files || []).length || overtagelse.enabled || overtagelse.kommentar || overtagelse.signUtf\u00F8rende || overtagelse.signKunde || overtagelse.signUtf\u00F8rendeImage || overtagelse.signKundeImage || projectLog.enabled || projectLog.draft || (projectLog.messages || []).length || internalNotes;
      if (hasContent && !window.confirm("Starte nytt prosjekt? Ulagrede endringer vil g\xE5 tapt.")) return;
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setMobileCreatingProject(true);
      setTab("prosjekt");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };
    const addProsjekteringPunkt = () => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: [
          ...Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : [],
          { id: uid(), title: "", value: "" }
        ]
      }));
    };
    const updateProsjekteringPunkt = (id, patch) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).map(
          (point) => point.id === id ? { ...point, ...patch } : point
        )
      }));
    };
    const removeProsjekteringPunkt = (id) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).filter((point) => point.id !== id)
      }));
    };
    const updateProductDoc = (productName, patch) => {
      setProductDocs((prev) => ({
        ...prev,
        [productName]: {
          ...prev[productName] || {},
          ...patch
        }
      }));
    };
    const toggleProductChecked = (productName, isChecked) => {
      setChecked((prev) => ({ ...prev, [productName]: isChecked }));
      if (!isChecked) return;
      const masterRow = productMasterByProduct[productName];
      const registerRow = fdvRegisterByProduct[productName];
      const autoDocs = {
        fdvUrl: masterRow?.fdv_url || registerRow?.fdv_url || masterRow?.datablad_url || "",
        databladUrl: masterRow?.datablad_url || "",
        dopUrl: masterRow?.dop_url || "",
        epdUrl: masterRow?.epd_url || "",
        sikkerhetsdatabladUrl: masterRow?.sikkerhetsdatablad_url || "",
        documentFileUrl: masterRow?.document_file_url || "",
        fdvSource: masterRow ? "product-master" : registerRow ? "admin-register" : ""
      };
      if (!Object.values(autoDocs).some(hasValue)) return;
      setProductDocs((prev) => {
        const current = prev[productName] || {};
        return {
          ...prev,
          [productName]: {
            ...current,
            fdvUrl: hasValue(current.fdvUrl) ? current.fdvUrl : autoDocs.fdvUrl,
            databladUrl: hasValue(current.databladUrl) ? current.databladUrl : autoDocs.databladUrl,
            dopUrl: hasValue(current.dopUrl) ? current.dopUrl : autoDocs.dopUrl,
            epdUrl: hasValue(current.epdUrl) ? current.epdUrl : autoDocs.epdUrl,
            sikkerhetsdatabladUrl: hasValue(current.sikkerhetsdatabladUrl) ? current.sikkerhetsdatabladUrl : autoDocs.sikkerhetsdatabladUrl,
            documentFileUrl: hasValue(current.documentFileUrl) ? current.documentFileUrl : autoDocs.documentFileUrl,
            fdvSource: current.fdvSource || autoDocs.fdvSource
          }
        };
      });
    };
    const addManualProduct = (section) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: [
            ...normalized[section] || [],
            { id: uid(), name: "", fdvUrl: "", comment: "" }
          ]
        };
      });
    };
    const updateManualProduct = (section, id, patch) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).map((p) => p.id === id ? { ...p, ...patch } : p)
        };
      });
    };
    const removeManualProduct = (section, id) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).filter((p) => p.id !== id)
        };
      });
    };
    const markChatAsRead = async (reader = "admin") => {
      if (!projectId) return;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const key = reader === "customer" ? "lastReadByCustomer" : "lastReadByAdmin";
      let nextLogForSave = null;
      setProjectLog((prev) => {
        const normalized = normalizeProjectLog(prev);
        nextLogForSave = { ...normalized, [key]: timestamp };
        return nextLogForSave;
      });
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          if (fetchError) console.warn("Kunne ikke markere chat som lest:", fetchError.message);
          return;
        }
        const existingData = dataFromRow(existing);
        const existingLog = normalizeProjectLog(existingData.projectLog);
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          projectLog: {
            ...existingLog,
            [key]: timestamp,
            draft: ""
          }
        }));
        const { error } = await supabase.from("projects").update({
          data: cleanData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (error) console.warn("Kunne ikke markere chat som lest:", error.message);
      } catch (error) {
        console.warn("Kunne ikke markere chat som lest:", error);
      }
    };
    const notifyChatMessage = async ({ toEmail, direction, message }) => {
      if (!toEmail || !message?.text) return;
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail,
            direction,
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: project.customerEmail || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: message.by || "Ukjent",
            message: message.text,
            projectLink: projectId ? makeProjectLink(projectId, direction === "to_owner" ? "admin" : "kunde") : ""
          }
        });
        if (error) {
          console.warn("E-postvarsling kunne ikke sendes:", error.message);
        }
      } catch (error) {
        console.warn("E-postvarsling kunne ikke sendes:", error);
      }
    };
    const ownerNotificationEmail = () => user.email || authUser?.email || company.email || profile?.email || "";
    const addProjectLogMessage = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r chatmelding med bilde kan lagres p\xE5 prosjektet.");
      const text = (projectLog.draft || "").trim();
      if (!text && !chatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (chatUploadFile) {
        uploadedImage = await uploadChatImage(chatUploadFile, projectId, "admin");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: user.name || authUser?.email || "Utf\xF8rende",
        role: "utf\xF8rende",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. L\xE5s opp prosjektet f\xF8rst.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByAdmin: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        project: { ...emptyProject(), ...existingData.project || {}, ...project },
        projectLog: updatedLog,
        internalNotes
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre chatmelding p\xE5 prosjektet: " + error.message);
      }
      setChatUploadFile(null);
      const fileInput = document.getElementById("admin-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: project.customerEmail,
        direction: "to_customer",
        message
      });
      alert(project.customerEmail ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til kunde." : "\u2714 Melding lagret p\xE5 prosjektet. Legg inn kunde e-post for e-postvarsling.");
    };
    const removeProjectLogMessage = (id) => {
      setProjectLog((prev) => ({
        ...prev,
        messages: (prev.messages || []).filter((m) => m.id !== id)
      }));
    };
    const saveCustomerChatMessage = async () => {
      if (!projectId) return alert("Prosjektet mangler ID.");
      const text = (projectLog.draft || "").trim();
      if (!text && !customerChatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (customerChatUploadFile) {
        uploadedImage = await uploadChatImage(customerChatUploadFile, projectId, "kunde");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: project.customer || "Kunde",
        role: "kunde",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByCustomer: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre melding: " + error.message);
      }
      setCustomerChatUploadFile(null);
      const fileInput = document.getElementById("customer-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: ownerNotificationEmail(),
        direction: "to_owner",
        message
      });
      alert(ownerNotificationEmail() ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til utf\xF8rende." : "\u2714 Melding sendt og lagret p\xE5 prosjektet.");
    };
    const saveProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const snapshot = {
        ...latestStateRef.current || {},
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        projectLog,
        internalNotes
      };
      const makeCleanData = (projectOverride = snapshot.project, projectLogOverride = snapshot.projectLog) => JSON.parse(JSON.stringify({
        company: snapshot.company,
        user: snapshot.user,
        project: { ...emptyProject(), ...projectOverride },
        checked: snapshot.checked,
        productDocs: snapshot.productDocs,
        manualProducts: snapshot.manualProducts,
        other: snapshot.other,
        surf: snapshot.surf,
        photos: snapshot.photos,
        access: snapshot.access,
        inst: snapshot.inst,
        files: snapshot.files,
        checklist: snapshot.checklist,
        tilbud: snapshot.tilbud,
        overtagelse: snapshot.overtagelse,
        projectLog: projectLogOverride,
        internalNotes: snapshot.internalNotes
      }));
      if (projectId) {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError) {
          console.error(fetchError);
          return alert("Kunne ikke kontrollere prosjektstatus: " + fetchError.message);
        }
        if (!existing) {
          return alert("Fant ikke prosjektet. \xC5pne prosjektet p\xE5 nytt fra prosjektlisten.");
        }
        const existingProject = projectFromRow(existing, existing?.data?.project || {});
        if (rowIsLocked(existing) || isProjectLocked) {
          const lockedProject = existingProject;
          setProject(lockedProject);
          return alert("Prosjektet er l\xE5st. L\xE5s opp prosjektet f\xF8r du lagrer endringer.");
        }
        const saveProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const saveProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const cleanData = makeCleanData(saveProjectData, saveProjectLog);
        const payload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: existing.user_id || authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        let updatedRow = null;
        const updateResult = await supabase.from("projects").update(payload).eq("id", projectId).select("*").maybeSingle();
        if (updateResult.error) {
          console.error(updateResult.error);
          return alert("Kunne ikke oppdatere prosjekt i sky: " + updateResult.error.message);
        }
        updatedRow = updateResult.data || null;
        if (!updatedRow) {
          const verifyResult = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (verifyResult.error) {
            console.error(verifyResult.error);
          } else {
            updatedRow = verifyResult.data || null;
          }
        }
        const matchesSavedProject = (row) => {
          const saved = row?.data?.project || {};
          return (saved.projectName || "") === (saveProjectData.projectName || "") && (saved.address || "") === (saveProjectData.address || "") && (saved.postnr || "") === (saveProjectData.postnr || "") && (saved.city || "") === (saveProjectData.city || "") && (saved.customer || "") === (saveProjectData.customer || "") && (saved.customerEmail || "") === (saveProjectData.customerEmail || "") && (saved.notes || "") === (saveProjectData.notes || "");
        };
        if (updatedRow && matchesSavedProject(updatedRow)) {
          unpackData(dataFromRow(updatedRow), false);
          setProjectId(updatedRow.id);
          await loadProjects(authUser);
          return alert("\u2714 Prosjekt oppdatert og bekreftet lagret");
        }
        const shouldCopy = window.confirm(
          "Prosjektet ble ikke oppdatert i gammel rad. Dette skyldes sannsynligvis Supabase-policy/eierskap p\xE5 gamle prosjekter.\n\nVil du lagre dette som en ny oppdatert kopi n\xE5, slik at endringene ikke g\xE5r tapt?"
        );
        if (!shouldCopy) {
          setProject(saveProjectData);
          setProjectLog(saveProjectLog);
          latestStateRef.current = { ...snapshot, project: saveProjectData, projectLog: saveProjectLog };
          return alert("Endringene st\xE5r fortsatt p\xE5 skjermen, men er ikke bekreftet lagret i Supabase.");
        }
        const copyPayload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data: copyRow, error: copyError } = await supabase.from("projects").insert(copyPayload).select().single();
        if (copyError) {
          console.error(copyError);
          return alert("Kunne ikke lagre kopi heller: " + copyError.message);
        }
        setProjectId(copyRow.id);
        unpackData(dataFromRow(copyRow), false);
        await loadProjects(authUser);
        return alert("\u2714 Gammel rad kunne ikke oppdateres, men prosjektet er lagret som ny oppdatert kopi.");
      } else {
        const newProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const newProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const payload = {
          title: newProjectData.projectName || newProjectData.address || "Uten navn",
          data: makeCleanData(newProjectData, newProjectLog),
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data, error } = await supabase.from("projects").insert(payload).select().single();
        if (error) {
          console.error(error);
          return alert("Kunne ikke lagre i sky: " + error.message);
        }
        setProjectId(data.id);
        setMobileCreatingProject(false);
        unpackData(dataFromRow(data), false);
        alert("\u2714 Prosjekt lagret");
      }
      loadProjects(authUser);
    };
    const saveSharedProject = async () => {
      if (!projectId) return alert("Prosjektet mangler ID og kan ikke lagres fra delingslink.");
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke kontrollere prosjektstatus f\xF8r lagring: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      const existingProject = projectFromRow(existing, existing.data?.project || {});
      if (rowIsLocked(existing) || isProjectLocked) {
        const lockedProject = existingProject;
        setProject(lockedProject);
        return alert("Prosjektet er l\xE5st og kan ikke endres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const safeProject = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: safeProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: safeProject.projectName || safeProject.address || "Uten navn",
        data: cleanData,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre fra delingslink. Sjekk Supabase-policy for delt tilgang: " + error.message);
      }
      setProject(safeProject);
      alert("\u2714 Bidrag lagret p\xE5 prosjektet " + (/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO"));
    };
    const setProjectLockedState = async (locked) => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 endre prosjektstatus.");
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r det kan l\xE5ses eller l\xE5ses opp.");
      const message = locked ? "Vil du avslutte og l\xE5se prosjektet? Ingen kan lagre endringer f\xF8r prosjektet l\xE5ses opp igjen." : "Vil du l\xE5se opp prosjektet slik at endringer kan lagres igjen?";
      if (!window.confirm(message)) return;
      const { data, error } = await supabase.rpc("set_project_lock", {
        p_project_id: projectId,
        p_locked: !!locked,
        p_locked_by: authUser.email || user.email || user.name || "Ukjent"
      });
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere prosjektstatus: " + error.message);
      }
      const updatedRow = Array.isArray(data) ? data[0] : data;
      if (!updatedRow) {
        return alert("Prosjektstatus ble ikke oppdatert. \xC5pne prosjektet p\xE5 nytt og pr\xF8v igjen.");
      }
      const updatedData = dataFromRow(updatedRow, updatedRow.data || packData());
      unpackData(updatedData);
      alert(locked ? "\u{1F512} Prosjektet er avsluttet og l\xE5st." : "\u{1F513} Prosjektet er l\xE5st opp igjen.");
      loadProjects(authUser);
    };
    const saveAsNewProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const unlockedProject = { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" };
      const payload = { title: unlockedProject.projectName || unlockedProject.address || "Uten navn", data: { company, user, project: unlockedProject, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog, internalNotes }, user_id: authUser.id, share_enabled: true, locked: false, locked_at: null, locked_by: "", updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre som nytt prosjekt: " + error.message);
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      alert("\u2714 Kopi lagret");
      loadProjects(authUser);
    };
    const deleteProject = async (id) => {
      if (!window.confirm("Er du sikker p\xE5 at du vil slette prosjektet?")) return;
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 slette prosjekt.");
      const { data, error } = await supabase.from("projects").delete().eq("id", id).select("id");
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette prosjekt: " + error.message);
      }
      if (!data || data.length === 0) {
        return alert("Prosjektet ble ikke slettet. Det skyldes sannsynligvis tilgang/eierskap p\xE5 gammel prosjektrad i Supabase.");
      }
      setProjects((prev) => (prev || []).filter((p) => p.id !== id));
      if (id === projectId) {
        setProjectId(null);
        setMobileCreatingProject(false);
        setTab("prosjekt");
      }
      await loadProjects(authUser);
      alert("Prosjekt slettet.");
    };
    const saveProjectForLink = async () => {
      if (projectId) return projectId;
      if (!authUser) {
        alert("Du m\xE5 v\xE6re logget inn for \xE5 lage delingslink.");
        return null;
      }
      const newProjectData = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: newProjectData,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: newProjectData.projectName || newProjectData.address || "Uten navn",
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        alert("Kunne ikke lagre prosjekt f\xF8r deling: " + error.message);
        return null;
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setProject(newProjectData);
      loadProjects(authUser);
      return data.id;
    };
    const makeProjectLink = (id, role = "kunde") => {
      if (role === "admin") {
        return `${window.location.origin}${window.location.pathname}?project=${id}&role=admin`;
      }
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      return roleParam === "underleverandor" ? `${window.location.origin}${window.location.pathname}?project=${id}&access=underleverandor` : `${window.location.origin}${window.location.pathname}?project=${id}&role=kunde`;
    };
    const copyLinkToClipboard = async (link, successMessage) => {
      try {
        await navigator.clipboard.writeText(link);
        alert(successMessage);
      } catch {
        prompt("Kopier denne linken:", link);
      }
    };
    const shareProject = async () => {
      const id = await saveProjectForLink();
      if (!id) return;
      await copyLinkToClipboard(makeProjectLink(id, "kunde"), "Kundelink kopiert.");
    };
    const copyAccessLink = async (role = "kunde") => {
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      await copyLinkToClipboard(
        makeProjectLink(id, role),
        roleParam === "underleverandor" ? "Underentrepren\xF8r-link kopiert." : "Kundelink kopiert."
      );
    };
    const completeOvertagelseAndLock = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r overtagelse kan fullf\xF8res.");
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 fullf\xF8re overtagelse.");
      const utf\u00F8rendeSigned = hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signUtf\u00F8rendeImage);
      const kundeSigned = hasValue(overtagelse.signKunde) || hasValue(overtagelse.signKundeImage);
      if (!utf\u00F8rendeSigned || !kundeSigned) {
        return alert("B\xE5de utf\xF8rende og kunde m\xE5 signere f\xF8r overtagelse kan fullf\xF8res.");
      }
      const completedOvertagelse = {
        ...emptyOvertagelse(),
        ...overtagelse,
        enabled: true,
        dato: overtagelse.dato || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse: completedOvertagelse,
        projectLog,
        internalNotes
      }));
      const { error: saveError } = await supabase.from("projects").update({
        data: cleanData,
        title: project.projectName || project.address || "Uten navn",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).eq("user_id", authUser.id);
      if (saveError) {
        console.error(saveError);
        return alert("Kunne ikke lagre overtagelse f\xF8r l\xE5sing: " + saveError.message);
      }
      setOvertagelse(completedOvertagelse);
      await setProjectLockedState(true);
    };
    const uploadLogo = async (file) => {
      if (!authUser || !file) return;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `logos/${authUser.id}/${Date.now()}-${cleanName}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) return alert("Kunne ikke laste opp logo: " + error.message);
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setCompany((c) => ({ ...c, logoUrl: data.publicUrl }));
      alert("Logo lastet opp. Husk \xE5 trykke Lagre firmaprofil.");
    };
    const saveProfile = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn.");
      const payload = {
        id: authUser.id,
        email: company.email || authUser.email,
        company_name: company.companyName || "",
        org_number: company.orgNumber || "",
        address: company.address || "",
        phone: company.phone || "",
        website: company.website || "",
        logo_url: company.logoUrl || ""
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
      if (error) return alert("Kunne ikke lagre firmaprofil: " + error.message);
      const row = { ...profile || {}, ...payload };
      applyProfile(row);
      alert("Firmaprofil lagret");
    };
    const loadAdminUsers = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      setAdminLoading(true);
      const { data, error } = await supabase.from("profiles").select("id,email,approved,company_name,created_at").order("created_at", { ascending: false });
      setAdminLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente brukere. Sjekk at Supabase-policy tillater admin \xE5 lese profiles.");
      }
      setAdminUsers(data || []);
    };
    const approveAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke godkjenne bruker: " + error.message);
      }
      alert("Bruker er godkjent.");
      loadAdminUsers();
    };
    const revokeAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du fjerne godkjenning for denne brukeren?")) return;
      const { error } = await supabase.from("profiles").update({ approved: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke fjerne godkjenning: " + error.message);
      }
      alert("Godkjenning er fjernet.");
      loadAdminUsers();
    };
    const loadFdvRegister = async (notify = false) => {
      setFdvLoading(true);
      const { data, error } = await supabase.from("fdv_register").select("*").order("section", { ascending: true }).order("product_name", { ascending: true });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente FDV-register. Kj\xF8r SQL-oppsettet f\xF8rst og sjekk Supabase-policy: " + error.message);
      }
      setFdvRegister(data || []);
      if (notify) alert(`FDV-register oppdatert. Fant ${(data || []).length} produkter.`);
    };
    const seedFdvRegister = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!window.confirm("Vil du legge inn alle standardproduktene i FDV-registeret? Eksisterende produkter oppdateres ikke, men manglende produkter legges til.")) return;
      setFdvLoading(true);
      const rows = productSections.flatMap((section) => section.items.map((productName) => ({
        section: section.title,
        product_name: productName,
        fdv_url: "",
        comment: "",
        active: true,
        updated_by: authUser?.email || ""
      })));
      const { error } = await supabase.from("fdv_register").upsert(rows, { onConflict: "product_name" });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette standardprodukter i FDV-register: " + error.message);
      }
      await loadFdvRegister(false);
      alert("FDV-register er klargjort med standardprodukter.");
    };
    const saveFdvRegisterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!row?.product_name) return alert("Produktnavn mangler.");
      const payload = {
        section: row.section || "",
        product_name: row.product_name,
        fdv_url: row.fdv_url || "",
        comment: row.comment || "",
        active: row.active !== false,
        updated_by: authUser?.email || ""
      };
      const { data, error } = await supabase.from("fdv_register").upsert(payload, { onConflict: "product_name" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre FDV-produkt: " + error.message);
      }
      setFdvRegister((prev) => {
        const exists = (prev || []).some((x) => x.product_name === data.product_name);
        return exists ? prev.map((x) => x.product_name === data.product_name ? data : x) : [...prev || [], data].sort((a, b) => `${a.section}${a.product_name}`.localeCompare(`${b.section}${b.product_name}`));
      });
      alert("FDV-produkt lagret.");
    };
    const updateFdvRegisterLocal = (productName, patch) => {
      setFdvRegister((prev) => {
        const list = prev || [];
        const exists = list.some((row) => row.product_name === productName);
        if (!exists) return [...list, { product_name: productName, section: patch.section || "", fdv_url: "", comment: "", active: true, ...patch }];
        return list.map((row) => row.product_name === productName ? { ...row, ...patch } : row);
      });
    };
    const loadProductMaster = async (notify = false) => {
      setProductMasterLoading(true);
      const { data, error } = await supabase.from("product_document_master").select("*").order("category", { ascending: true }).order("product_family", { ascending: true }).order("product_name", { ascending: true });
      setProductMasterLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktmaster:", error.message);
        if (notify) alert("Kunne ikke hente produktmaster. Sjekk at SQL-filen er kj\xF8rt i Supabase: " + error.message);
        return;
      }
      setProductMaster(data || []);
      if (notify) alert(`Produktmaster oppdatert. Fant ${(data || []).length} produkter/varianter.`);
    };
    const updateProductMasterLocal = (productNo, patch) => {
      setProductMaster((prev) => (prev || []).map((row) => row.product_no === productNo ? { ...row, ...patch } : row));
    };
    const saveProductMasterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!row?.product_no) return alert("Varenummer mangler.");
      const payload = {
        fdv_url: row.fdv_url || "",
        datablad_url: row.datablad_url || "",
        dop_url: row.dop_url || "",
        epd_url: row.epd_url || "",
        sikkerhetsdatablad_url: row.sikkerhetsdatablad_url || "",
        document_file_url: row.document_file_url || "",
        comment: row.comment || "",
        active: row.active !== false
      };
      const { data, error } = await supabase.from("product_document_master").update(payload).eq("product_no", row.product_no).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre produktmaster-rad: " + error.message);
      }
      setProductMaster((prev) => (prev || []).map((x) => x.product_no === data.product_no ? data : x));
      alert("Produktdokumentasjon lagret.");
    };
    const signIn = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke logge inn: " + error.message);
    };
    const signUp = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke opprette bruker: " + error.message);
      alert("Bruker opprettet. Kontoen m\xE5 godkjennes f\xF8r appen kan brukes.");
    };
    const resetPassword = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail) return alert("Skriv inn e-postadressen din f\xF8rst.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: "https://expo-proffdok.vercel.app"
      });
      if (error) return alert("Kunne ikke sende tilbakestilling: " + error.message);
      alert("E-post for tilbakestilling av passord er sendt. Sjekk innboksen din.");
    };
    const completePasswordReset = async () => {
      if (!newPassword || !newPasswordRepeat) return alert("Skriv inn nytt passord to ganger.");
      if (newPassword !== newPasswordRepeat) return alert("Passordene er ikke like.");
      if (newPassword.length < 6) return alert("Passordet m\xE5 v\xE6re minst 6 tegn.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return alert("Kunne ikke oppdatere passord: " + error.message);
      setNewPassword("");
      setNewPasswordRepeat("");
      setPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      await supabase.auth.signOut();
      setAuthUser(null);
      setProfile(null);
      setProjects([]);
      setTab("prosjekt");
      alert("Passordet er oppdatert. Logg inn p\xE5 nytt.");
    };
    const signOut = async () => {
      await supabase.auth.signOut();
      setProjectId(null);
      setMobileCreatingProject(false);
      setProjects([]);
      setProfile(null);
      setTab("prosjekt");
    };
    const printReport = () => {
      setTab("rapport");
      setTimeout(() => window.print(), 400);
    };
    const uploadImages = async (fileList, folder = "photos") => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${folder}/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp bilde: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({ id: uid(), url: data.publicUrl, path, name: file.name });
      }
      return uploaded;
    };
    const addPhoto = async (cat, fl) => {
      const imgs = await uploadImages(fl, "photos");
      setPhotos((p) => [...p, ...imgs.map((img) => ({
        ...img,
        cat,
        comment: "",
        created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
      }))]);
    };
    const setChecklistValue = (category, item, patch) => {
      setChecklist((prev) => ({
        ...prev,
        [category]: {
          ...prev[category] || {},
          [item]: {
            ...prev[category]?.[item] || {},
            ...patch
          }
        }
      }));
    };
    const addChecklistPhoto = async (category, item, fl) => {
      const imgs = await uploadImages(fl, "sjekklister");
      if (!imgs.length) return;
      setChecklist((prev) => ({
        ...prev,
        [category]: {
          ...prev[category] || {},
          [item]: {
            ...prev[category]?.[item] || {},
            photos: [...prev[category]?.[item]?.photos || [], ...imgs]
          }
        }
      }));
    };
    const addFiles = (fl) => setFiles((p) => [...p, ...Array.from(fl || []).map((f) => ({
      id: uid(),
      name: f.name,
      url: URL.createObjectURL(f),
      by: user.name || "Ukjent",
      created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
    }))]);
    const uploadTilbudFiles = async (fileList) => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `tilbud-kontrakt/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          url: data.publicUrl,
          path,
          name: file.name,
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) {
        setTilbud((t) => ({ ...emptyTilbud(), ...t, files: [...t.files || [], ...uploaded] }));
      }
    };
    if (authLoading && !isReadOnly && !isUnderleverandorView) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Laster..." }) }) }) });
    }
    if (passwordRecovery && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sett nytt passord" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sett nytt passord", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Skriv inn et nytt passord. Det kan ikke v\xE6re det samme som forrige passord." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Nytt passord",
                type: "password",
                value: newPassword,
                onChange: setNewPassword,
                autoComplete: "new-password"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Gjenta nytt passord",
                type: "password",
                value: newPasswordRepeat,
                onChange: setNewPasswordRepeat,
                autoComplete: "new-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") completePasswordReset();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completePasswordReset, children: "Lagre nytt passord" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: async () => {
              setPasswordRecovery(false);
              setNewPassword("");
              setNewPasswordRepeat("");
              window.history.replaceState({}, document.title, window.location.pathname);
              await supabase.auth.signOut();
              setAuthUser(null);
              setProfile(null);
            }, children: "Avbryt og g\xE5 til innlogging" })
          ] })
        ] }) })
      ] });
    }
    if (isUnderleverandorView) {
      const limitedTabs = [["produkter", "Produkter"], ["overflater", "Overflater"], ["bilder", "Bilder"], ["installasjoner", "Fag/utstyr"], ["sjekklister", "Sjekklister"]];
      if (!projectId && !(project.projectName || project.address)) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster prosjekt..." })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster prosjekt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter prosjektdata..." }) }) })
        ] });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Underentrepren\xF8r-tilgang \xB7 ",
                project.projectName || project.address || "Prosjekt"
              ] })
            ] }),
            isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", disabled: true, children: "\u{1F512} Prosjekt l\xE5st" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveSharedProject, children: "Lagre bidrag" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: limitedTabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Begrenset tilgang", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Du har tilgang til \xE5 se produkter, overflater, bilder, fag/utstyr og sjekklister p\xE5 dette prosjektet. Du kan legge inn bilder, sjekklistepunkter, fag/utstyr og kommentarer. Prosjektinfo, prosjektering, rapport, tilbud/kontrakt og admin er skjult." }),
            isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er avsluttet og l\xE5st. Nye endringer kan ikke lagres." })
          ] }),
          tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: productSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av produkter som er brukt. N\xE5r et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte p\xE5 produktet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: s.items.map((i) => {
              const doc = productDocs[i] || {};
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
                ] }),
                checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
                  ] }),
                  doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                  doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
                ] })
              ] }, i);
            }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                "Andre produkter i ",
                s.title
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Legg til annet produkt"
              ] }),
              getManualProductsForSection(s.title).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
              getManualProductsForSection(s.title).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
              ] }, p.id))
            ] })
          ] }, s.title)) }),
          tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
          tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
                " ",
                c
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde eller velg fra galleri" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
            ] }, c)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
          ] }),
          tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Underentrepren\xF8r", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til post"
            ] }),
            inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp bilder",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                  const imgs = await uploadImages(e.target.files, "installasjoner");
                  setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
                } })
              ] }),
              (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                "\u{1F4F7} ",
                (x.photos || []).length,
                " bilder lagt til"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lagt inn av ",
                x.by,
                " \xB7 ",
                x.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
            ] }, x.id))
          ] }),
          tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ChecklistEditor,
              {
                checklist,
                setChecklistValue,
                addChecklistPhoto,
                addFiles,
                files,
                setFiles
              }
            )
          ] })
        ] })
      ] });
    }
    if (!authUser && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Logg inn for \xE5 se dine prosjekter" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: authEmail, onChange: setAuthEmail, autoComplete: "email" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Passord",
                type: "password",
                value: authPassword,
                onChange: setAuthPassword,
                autoComplete: "current-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") signIn();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: signIn, children: "Logg inn" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signUp, children: "Opprett bruker" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: resetPassword, children: "Glemt passord?" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "E-post huskes p\xE5 denne enheten. Passord lagres ikke i appen, men nettleseren/Supabase kan holde deg innlogget trygt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Delingslenker fungerer fortsatt uten innlogging." })
        ] }) })
      ] });
    }
    if (!isReadOnly && (profileLoading || authUser && !profile)) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster brukerprofil..." })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter brukerprofil..." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile && !profile.approved) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Venter p\xE5 godkjenning" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Konto venter p\xE5 godkjenning", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Brukeren ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser.email }),
            " er registrert, men m\xE5 godkjennes av administrator f\xF8r appen kan brukes."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            "Fyll gjerne inn firmaprofilen under. Administrator kan deretter godkjenne deg i Supabase ved \xE5 sette ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "approved = true" }),
            " i tabellen ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "profiles" }),
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email || authUser.email, onChange: (v) => setCompany({ ...company, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website || "", onChange: (v) => setCompany({ ...company, website: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "16px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp firmalogo",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
          ] })
        ] }) })
      ] });
    }
    if (isReadOnly) {
      const hasTilbudContent = hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Kundetilgang" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Rapport, tilbud/kontrakt og chat",
                totalChatCount ? ` \xB7 ${totalChatCount} melding${totalChatCount === 1 ? "" : "er"}` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => window.print(), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
              " Lag PDF / skriv ut"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "rapport" ? "on" : "", onClick: () => setCustomerTab("rapport"), children: "Rapport" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: customerTab === "chat" ? "on" : "", onClick: () => setCustomerTab("chat"), children: [
              "Chat",
              unreadForCustomer > 0 ? ` (${unreadForCustomer} ulest)` : totalChatCount ? ` (${totalChatCount})` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "tilbud" ? "on" : "", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          customerTab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerReport, { company, name, project, selected, manualProducts: manualSelected, other, surf, photos, inst, files, checklist, tilbud, overtagelse, projectLog }),
          customerTab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForCustomer > 0 ? `Chat (${unreadForCustomer} ulest)` : totalChatCount ? `Chat (${totalChatCount})` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan kunde sende sp\xF8rsm\xE5l eller beskjeder direkte inn p\xE5 prosjektet. Chatten oppdateres automatisk live, og utf\xF8rende varsles p\xE5 e-post n\xE5r e-postvarsling er satt opp." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding fra kunde", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
                "\u{1F4F7} Last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    id: "customer-chat-image-input",
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => setCustomerChatUploadFile(e.target.files?.[0] || null)
                  }
                ),
                customerChatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                  "Valgt: ",
                  customerChatUploadFile.name
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveCustomerChatMessage, children: "Send melding" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForCustomer === 0, onClick: () => markChatAsRead("customer"), children: "Marker alle som lest" })
            ] }),
            (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
            (projectLog.messages || []).slice().reverse().map((m) => {
              const isUnread = m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("customer"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  m.by || "Ukjent",
                  " ",
                  m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                  m.role === "kunde" ? !lastReadByAdmin || (m.created || "") > lastReadByAdmin ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : isUnread ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
                m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "img",
                    {
                      src: m.imageUrl,
                      alt: m.imageName || "Chat bilde",
                      style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                    }
                  ) }),
                  m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
                ] })
              ] }, m.id);
            })
          ] }),
          customerTab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            !hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen tilbud eller kontrakt er delt p\xE5 dette prosjektet enn\xE5." }),
            hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
              ] }),
              (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
                (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", children: f.name }) }, f.id))
              ] })
            ] })
          ] })
        ] })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
      .mobileNav { display: none; }
      .mobileNavPanel { background:#ffffff; border:1px solid #dbe7ec; border-radius:18px; padding:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
      .mobileNavTop { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .mobileNavTitle { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .mobileNavTitle b { font-size:14px; color:#0f172a; }
      .mobileNavTitle small { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .mobileNavSelectWrap { position:relative; }
      .mobileNav select { width:100%; min-height:52px; border-radius:14px; font-size:17px; font-weight:800; padding:12px 44px 12px 14px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; appearance:auto; }
      .mobileNavQuick { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .mobileNavQuick button { width:100%; min-height:44px; justify-content:center; }
      .mobileNavStatus { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .mobileNavPill { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:12px; font-weight:800; color:#334155; }
      .mobileSectionChips { display:none; }
      .projectListHeaderCards { margin-bottom:16px; }
      .projectListToolbar { display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 16px; }
      .projectListCard { position:relative; overflow:hidden; }
      .projectListCardTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
      .projectListBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .projectListMetaCards { margin-top:12px; }
      .projectListActions { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .projectImageStrip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px 4px; margin-top:10px; scrollbar-width:thin; }
      .projectImageThumb { flex:0 0 76px; width:76px; }
      .projectImageThumb img { width:76px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #dbe7ec; background:#f8fafc; display:block; }
      .projectImageThumb small { display:block; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; }
      .projectImageCounts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .projectMiniBadge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; border:1px solid #dbe7ec; background:#f8fafc; font-size:12px; font-weight:700; }
      @media screen and (max-width: 700px) {
        header nav { display: none !important; }
        .mobileNav { display: block !important; }
        .mobileNav { padding:0 12px 12px !important; }
        .mobileNavPanel { border-radius:16px; padding:10px; }
        .mobileNavTop { margin-bottom:8px; }
        .mobileNav select { min-height:54px; font-size:16px; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:1fr 1fr; gap:8px; }
        .projectListHeaderCards .tile { min-height:auto; padding:10px !important; }
        .projectListHeaderCards .tile b { font-size:20px; }
        .projectListToolbar { position:sticky; top:0; z-index:5; background:#ffffff; border:1px solid #dbe7ec; border-radius:16px; padding:10px; box-shadow:0 8px 22px rgba(15,23,42,0.08); }
        .projectListToolbar button { flex:1 1 100%; width:100%; justify-content:center; }
        .projectListCard { padding:14px !important; border-radius:18px; }
        .projectListCardTop { display:block; }
        .projectListBadges { justify-content:flex-start; margin-top:10px; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListMetaCards .tile { padding:10px !important; min-height:auto; }
        .projectListActions { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListActions button { width:100%; justify-content:center; }
        .projectImageThumb { flex-basis:84px; width:84px; }
        .projectImageThumb img { width:84px; height:64px; }
      }


      /* Mobile-first redesign v1 */
      .bottomAppNav { display:none; }
      @media screen and (max-width: 700px) {
        body { -webkit-text-size-adjust:100%; }
        header { position:sticky; top:0; z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(14px); border-bottom:1px solid #e2edf2; }
        header .head { padding:8px 12px !important; gap:8px !important; align-items:center !important; }
        header .head > div:first-child { width:122px !important; height:42px !important; flex:0 0 122px !important; }
        header .head h1 { font-size:18px !important; line-height:1.1 !important; margin:0 !important; }
        header .head p { font-size:12px !important; margin:2px 0 0 !important; max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        header .head > button { display:none !important; }
        header .head > button:nth-of-type(2), header .head > button:nth-of-type(3) { display:inline-flex !important; min-height:34px !important; padding:7px 10px !important; font-size:12px !important; border-radius:12px !important; }
        main { padding:10px 10px calc(150px + env(safe-area-inset-bottom)) !important; }
        section { padding:14px !important; border-radius:18px !important; margin:10px auto !important; }
        section h2 { font-size:19px !important; margin-bottom:10px !important; gap:6px !important; }
        .mobileNav { padding:0 10px 8px !important; }
        .mobileNavPanel { box-shadow:none !important; border-radius:14px !important; padding:9px !important; }
        .mobileNavTop { display:flex !important; margin-bottom:6px !important; }
        .mobileNavTitle b { font-size:12px !important; letter-spacing:.02em; text-transform:uppercase; color:#64748b !important; }
        .mobileNavTitle small { font-size:13px !important; color:#0f172a !important; font-weight:800; }
        .mobileNavStatus, .mobileNavQuick { display:none !important; }
        .mobileNav select { min-height:44px !important; font-size:17px !important; border-radius:13px !important; padding:9px 12px !important; background:#f8fafc !important; }
        .mobileSectionChips { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; margin-top:8px; }
        .mobileSectionChips button { min-height:36px !important; padding:6px 5px !important; border-radius:12px !important; font-size:12px !important; font-weight:900 !important; }
        .bottomAppNav { position:fixed; left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom)); z-index:50; display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; padding:7px; border:1px solid #dbe7ec; border-radius:20px; background:rgba(255,255,255,0.98); box-shadow:0 12px 34px rgba(15,23,42,0.16); backdrop-filter:blur(14px); }
        .bottomAppNav button { min-height:44px !important; padding:5px 3px !important; border-radius:14px !important; font-size:12px !important; font-weight:900 !important; display:flex !important; flex-direction:column !important; gap:1px !important; align-items:center !important; justify-content:center !important; line-height:1.05 !important; }
        .bottomAppNav button span:first-child { font-size:16px; line-height:1; }
        .bottomAppNav button.active { background:#082f3a !important; color:#fff !important; border-color:#082f3a !important; }
        .grid { grid-template-columns:1fr !important; gap:10px !important; }
        label span { font-size:12px !important; }
        input, textarea, select { min-height:42px !important; font-size:16px !important; border-radius:12px !important; }
        textarea { min-height:86px !important; }
        button, .upload { min-height:42px !important; border-radius:14px !important; padding:9px 12px !important; font-size:14px !important; }
        .cards { gap:8px !important; }
        .tile { padding:10px !important; border-radius:16px !important; min-height:auto !important; }
        .tile b { font-size:16px !important; }
        .tile span { font-size:12px !important; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)) !important; gap:6px !important; overflow:visible !important; }
        .projectListHeaderCards .tile { padding:8px 6px !important; text-align:center !important; }
        .projectListHeaderCards .tile b { font-size:18px !important; }
        .projectListHeaderCards .tile span { font-size:10px !important; line-height:1.1 !important; }
        .projectListToolbar { position:static !important; display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; padding:0 !important; border:0 !important; box-shadow:none !important; background:transparent !important; margin:8px 0 10px !important; }
        .projectListToolbar button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .projectListCard { padding:12px !important; border-radius:20px !important; margin:10px 0 !important; }
        .projectListCardTop { display:block !important; }
        .projectListCardTop b[style] { font-size:17px !important; line-height:1.15 !important; display:block; }
        .projectListCardTop p { font-size:14px !important; margin:4px 0 0 !important; }
        .projectListCardTop small { font-size:12px !important; }
        .projectListBadges { justify-content:flex-start !important; gap:6px !important; margin-top:8px !important; }
        .statusBadge, .projectMiniBadge { font-size:11px !important; padding:4px 7px !important; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; margin-top:8px !important; }
        .projectListMetaCards .tile { padding:8px !important; }
        .projectListMetaCards .tile:nth-child(3) { display:none !important; }
        .projectImageCounts { gap:5px !important; margin-top:8px !important; }
        .projectImageStrip { gap:6px !important; padding:6px 0 0 !important; margin-top:4px !important; }
        .projectImageThumb { flex:0 0 58px !important; width:58px !important; }
        .projectImageThumb img { width:58px !important; height:46px !important; border-radius:10px !important; }
        .projectImageThumb small { font-size:9px !important; }
        .projectImageThumb[style] { height:46px !important; min-width:58px !important; font-size:12px !important; }
        .projectListActions { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; margin-top:10px !important; }
        .projectListActions button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .note { font-size:13px !important; line-height:1.35 !important; }
        .photos { grid-template-columns:repeat(2, minmax(0,1fr)) !important; gap:8px !important; }
        .photo { border-radius:14px !important; padding:8px !important; }
        .photo img { border-radius:12px !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0; }

        /* Mobile readability tuning v2 */
        section h2 { font-size:21px !important; line-height:1.22 !important; }
        h3 { font-size:18px !important; line-height:1.25 !important; }
        p, small, .out p, .item p { line-height:1.45 !important; }
        .note { font-size:14px !important; line-height:1.48 !important; }
        label span { font-size:13px !important; line-height:1.3 !important; }
        input, textarea, select { font-size:17px !important; line-height:1.35 !important; }
        button, .upload { font-size:15px !important; font-weight:800 !important; line-height:1.2 !important; }
        .bottomAppNav button { font-size:12px !important; }
        .bottomAppNav button span:first-child { font-size:20px !important; }
        .projectListCardTop b[style] { font-size:19px !important; line-height:1.24 !important; }
        .projectListCardTop p { font-size:15px !important; line-height:1.35 !important; }
        .projectListCardTop small { font-size:13px !important; line-height:1.35 !important; }
        .statusBadge, .projectMiniBadge { font-size:12.5px !important; line-height:1.15 !important; padding:6px 9px !important; }
        .projectListMetaCards .tile b { font-size:13px !important; line-height:1.2 !important; }
        .projectListMetaCards .tile span { font-size:12.5px !important; line-height:1.28 !important; }
        .projectListHeaderCards .tile b { font-size:20px !important; }
        .projectListHeaderCards .tile span { font-size:11.5px !important; line-height:1.18 !important; }
        .projectListToolbar button, .projectListActions button { font-size:13.5px !important; min-height:42px !important; }
        .tile b { font-size:17px !important; line-height:1.2 !important; }
        .tile span { font-size:13px !important; line-height:1.3 !important; }
        .check span { font-size:15px !important; }
        .checklistHeader b { font-size:15.5px !important; line-height:1.3 !important; }
        .checklistStatusButtons button { font-size:13px !important; }
        .photo b { font-size:14px !important; line-height:1.25 !important; }
        .photo small { font-size:12px !important; line-height:1.25 !important; }
        .projectImageThumb small { font-size:10.5px !important; line-height:1.15 !important; }
      }


      /* Mobile navigation cleanup v2: no fixed chrome on small screens */
      @media screen and (max-width: 700px) {
        header { position:static !important; top:auto !important; z-index:auto !important; backdrop-filter:none !important; border-bottom:0 !important; }
        main { padding:10px 10px 28px !important; }
        .bottomAppNav { display:none !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0 !important; }
        .mobileNav { padding:0 10px 10px !important; }
        .mobileNavPanel { position:static !important; border-radius:16px !important; padding:10px !important; margin-bottom:8px !important; }
        .mobileNavTop { display:flex !important; align-items:flex-start !important; margin-bottom:8px !important; }
        .mobileNavTitle b { font-size:13px !important; letter-spacing:.04em !important; text-transform:uppercase !important; color:#64748b !important; }
        .mobileNavTitle small { font-size:18px !important; font-weight:900 !important; color:#0f172a !important; }
        .mobileNav select { min-height:46px !important; font-size:18px !important; font-weight:900 !important; }
        .mobileNavQuick { display:none !important; }
        .mobileNavStatus { display:grid !important; grid-template-columns:repeat(4, minmax(0, 1fr)) !important; gap:6px !important; margin-top:8px !important; }
        .mobileNavStatus .mobileNavPill { justify-content:center !important; min-height:38px !important; font-size:13px !important; padding:7px 6px !important; border-radius:14px !important; }
        .mobileNavStatus .mobileNavPill:nth-child(n+5) { display:none !important; }
        section { scroll-margin-top:12px !important; }
        .projectListToolbar { position:static !important; }
      }


      /* Mobile project chooser v5 - desktop-safe */
      .mobileProjectChooser,
      .mobileCurrentProjectBar { display:none !important; }
      .desktopOnlyWhenNoProject { display:block !important; }
      @media screen and (min-width: 701px) {
        .mobileProjectChooser,
        .mobileCurrentProjectBar { display:none !important; }
        .desktopOnlyWhenNoProject { display:block !important; }
      }
      @media screen and (max-width: 700px) {
        .mobileProjectChooser { display:block !important; }
        .mobileCurrentProjectBar { display:block !important; }
        .desktopOnlyWhenNoProject { display:none !important; }
        .mobileProjectChooser { padding:16px !important; border-radius:22px !important; background:#fff !important; border:1px solid #dbe7ec !important; box-shadow:0 12px 30px rgba(15,23,42,0.08) !important; }
        .mobileProjectChooser h2 { font-size:24px !important; line-height:1.15 !important; margin-bottom:8px !important; }
        .mobileProjectChooserIntro { color:#64748b; font-size:15px; line-height:1.45; margin:0 0 14px; }
        .mobileProjectChooserActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .mobileProjectChooserActions button { width:100% !important; min-height:46px !important; justify-content:center !important; }
        .mobileProjectList { display:grid; gap:10px; margin-top:14px; }
        .mobileProjectPickCard { border:1px solid #dbe7ec; border-radius:18px; padding:12px; background:#f8fafc; }
        .mobileProjectPickCardTop { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .mobileProjectPickCard b { font-size:17px; line-height:1.25; color:#0f172a; }
        .mobileProjectPickCard small { display:block; color:#64748b; font-size:13px; line-height:1.35; margin-top:3px; }
        .mobileProjectPickStatus { white-space:nowrap; font-size:12px; font-weight:900; border:1px solid #dbe7ec; border-radius:999px; padding:5px 8px; background:#fff; }
        .mobileProjectPickActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px; margin-top:10px; }
        .mobileProjectPickActions button { min-height:42px !important; padding:7px 6px !important; font-size:13px !important; border-radius:13px !important; width:100% !important; }
        .mobileCurrentProjectBar { margin:0 10px 10px !important; padding:12px !important; border:1px solid #dbe7ec !important; background:#ffffff !important; border-radius:18px !important; }
        .mobileCurrentProjectBar b { display:block; font-size:13px; text-transform:uppercase; color:#64748b; letter-spacing:.04em; margin-bottom:4px; }
        .mobileCurrentProjectBar span { display:block; font-size:17px; font-weight:900; color:#0f172a; line-height:1.25; }
        .mobileCurrentProjectActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .mobileCurrentProjectActions button { min-height:44px !important; font-size:14px !important; }
      }


      /* Mobile UX fase 4: feltapp-sjekklister */
      .checklistSummaryCard {
        border:1px solid #dbe7ec;
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        margin:12px 0 16px;
      }
      .checklistSummaryCard b { font-size:18px; color:#0f172a; }
      .checklistSummaryCard p { margin:4px 0 10px; color:#64748b; }
      .checklistProgress { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
      .checklistProgress span { display:block; height:100%; border-radius:999px; background:#082f3a; transition:width .2s ease; }
      .checklistSummaryBadges { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .checklistSummaryBadges span { display:inline-flex; align-items:center; gap:4px; padding:6px 9px; border-radius:999px; border:1px solid #dbe7ec; background:#fff; font-size:13px; font-weight:800; color:#334155; }
      .checklistSummaryActions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .checklistAccordion { display:grid; gap:12px; }
      .checklistGroup { padding:0 !important; overflow:hidden; border-radius:18px !important; }
      .checklistGroupHeader { width:100%; border:0 !important; background:#ffffff !important; color:#0f172a !important; box-shadow:none !important; display:grid !important; grid-template-columns:auto minmax(0,1fr) auto !important; align-items:center !important; gap:10px !important; padding:14px !important; text-align:left !important; min-height:64px !important; cursor:pointer; }
      .checklistGroupCaret { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:18px; font-weight:900; }
      .checklistGroupTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistGroupTitle b { font-size:18px; line-height:1.2; }
      .checklistGroupTitle small { color:#64748b; font-weight:700; }
      .checklistGroupBadge { white-space:nowrap; border:1px solid #dbe7ec; border-radius:999px; padding:6px 9px; font-size:12px; font-weight:900; background:#f8fafc; }
      .checklistGroupBadge-done { background:#ecfdf5; color:#065f46; border-color:#bbf7d0; }
      .checklistGroupBadge-avvik { background:#fef2f2; color:#991b1b; border-color:#fecaca; }
      .checklistGroupBadge-progress { background:#fffbeb; color:#92400e; border-color:#fde68a; }
      .checklistGroupBadge-missing { background:#f8fafc; color:#475569; }
      .checklistGroupBody { padding:0 14px 14px; display:grid; gap:10px; }
      .checklistPoint { border:1px solid #dbe7ec; background:#fff; border-radius:16px; padding:12px; }
      .checklistPoint-avvik { border-color:#fecaca; background:#fff7f7; }
      .checklistPoint-done { border-color:#bbf7d0; }
      .checklistPointTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistPointTitle small { color:#64748b; font-weight:700; }
      @media screen and (max-width:700px) {
        .checklistSummaryCard { padding:12px !important; border-radius:16px !important; margin:10px 0 12px !important; }
        .checklistSummaryCard b { font-size:17px !important; }
        .checklistSummaryBadges { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryBadges span { justify-content:center !important; font-size:12.5px !important; padding:7px 6px !important; }
        .checklistSummaryActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryActions button { width:100% !important; font-size:13px !important; }
        .checklistGroupHeader { grid-template-columns:auto 1fr !important; padding:12px !important; min-height:64px !important; gap:8px !important; align-items:start !important; }
        .checklistGroupCaret { width:34px !important; height:34px !important; font-size:20px !important; margin-top:1px !important; }
        .checklistGroupBadge { grid-column:2 !important; justify-self:start !important; margin-top:4px !important; max-width:100% !important; white-space:normal !important; }
        .checklistGroupTitle b { font-size:16.5px !important; }
        .checklistGroupTitle small { font-size:12.5px !important; }
        .checklistGroupBadge { font-size:11.5px !important; padding:5px 7px !important; }
        .checklistGroupBody { padding:0 10px 10px !important; gap:8px !important; }
        .checklistPoint { padding:10px !important; border-radius:15px !important; }
        .checklistHeader { display:grid !important; gap:8px !important; }
        .checklistStatusButtons { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; }
        .checklistStatusButtons button { width:100% !important; min-height:40px !important; padding:7px 4px !important; font-size:12.5px !important; }
        .checklistUpload { width:100% !important; justify-content:center !important; margin-top:8px !important; }
      }


      /* iPhone Safari safe-area: avoid bottom browser toolbar */
      @media screen and (max-width:700px) {
        .bottomPrevNext {
          padding-bottom:calc(110px + env(safe-area-inset-bottom)) !important;
          margin-bottom:0 !important;
        }
        main {
          padding-bottom:calc(120px + env(safe-area-inset-bottom)) !important;
        }
      }

      /* Mobile UX fase 3: sticky feltapp-meny */
      .mobileFieldBar { display:none; }
      @media screen and (max-width: 700px) {
        .mobileNav { display:none !important; }
        .mobileCurrentProjectBar { display:none !important; }
        .mobileFieldBar {
          display:block !important;
          position:sticky;
          top:0;
          z-index:60;
          padding:8px 10px 9px;
          background:rgba(248,250,252,0.96);
          backdrop-filter:blur(14px);
          border-bottom:1px solid #dbe7ec;
          box-shadow:0 8px 22px rgba(15,23,42,0.08);
        }
        .mobileFieldBarInner {
          max-width:1180px;
          margin:0 auto;
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          align-items:center;
        }
        .mobileProjectLine {
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          min-width:0;
        }
        .mobileProjectLineText { min-width:0; }
        .mobileProjectLineText b {
          display:block;
          font-size:11px;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:#64748b;
          line-height:1.1;
        }
        .mobileProjectLineText span {
          display:block;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:70vw;
          line-height:1.25;
        }
        .mobileFieldBar select {
          width:100%;
          min-height:44px !important;
          border-radius:14px !important;
          font-size:16px !important;
          font-weight:900 !important;
          background:#fff !important;
          border:1px solid #cbd5e1 !important;
          padding:8px 12px !important;
        }
        section { scroll-margin-top:106px !important; }
        main { padding-top:10px !important; }
      }

    ` }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: projectId ? `${currentStatus.icon} ${currentStatus.label}` : authUser?.email || name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: createNewProject, children: "+ Nytt prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: projectId ? "Oppdater prosjekt" : "Lagre" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveAsNewProject, children: "Lagre kopi" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: printReport, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
            " Lag PDF / skriv ut"
          ] }),
          projectId && (isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(false), children: "\u{1F513} L\xE5s opp prosjekt" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(true), children: "\u{1F512} Avslutt prosjekt" }))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNav", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavPanel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTop", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Meny" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tabs.find(([id]) => id === tab)?.[1] || "Velg side" })
            ] }),
            projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileNavPill", children: [
              currentStatus.icon,
              " ",
              currentStatus.label
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNavSelectWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg side", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, id)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileSectionChips", "aria-label": "Hurtigvalg seksjoner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "produkter" ? "" : "secondary", onClick: () => goToTab("produkter"), children: "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "sjekklister" ? "" : "secondary", onClick: () => goToTab("sjekklister"), children: "Sjekklister" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "tilbud" ? "" : "secondary", onClick: () => goToTab("tilbud"), children: "Tilbud" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "overtagelse" ? "" : "secondary", onClick: () => goToTab("overtagelse"), children: "Overtag." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavQuick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: !previousTab, onClick: () => previousTab && goToTab(previousTab[0]), children: "\u2190 Forrige" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !nextTab, onClick: () => nextTab && goToTab(nextTab[0]), children: "Neste \u2192" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavStatus", children: [
            unreadForAdmin > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "\u{1F4AC} ",
              unreadForAdmin,
              " ulest"
            ] }),
            totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "Chat: ",
              totalChatCount
            ] })
          ] })
        ] }) })
      ] }),
      projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileFieldBar", "aria-label": "Mobil arbeidsmeny", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileFieldBarInner", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLine", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLineText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
            setProjectId(null);
            setTab("prosjekt");
          }, children: "Bytt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg seksjon", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, "mobile-field-" + id)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
        !projectId && !mobileCreatingProject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "mobileProjectChooser", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hvilket prosjekt vil du jobbe i?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mobileProjectChooserIntro", children: "Velg aktivt prosjekt f\xF8rst. Avsluttede prosjekter ligger i prosjektlisten/arkivet." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "S\xF8k etter prosjekt, kunde eller adresse", value: projectSearch, onChange: setProjectSearch }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectChooserActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProjects(authUser, true), children: "Oppdater liste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
              createNewProject();
              setTab("prosjekt");
            }, children: "+ Nytt prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectList", children: [
            activeMobileProjectRows.slice(0, 8).map(({ row: p, listProject, listStatus, unreadForAdminInList }) => {
              const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCard", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCardTop", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || listProject.projectName || "Uten navn" }),
                    listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      "Kunde: ",
                      listProject.customer
                    ] }),
                    locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: locationLine }),
                    unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#991b1b", fontWeight: 900 }, children: [
                      "\u{1F4AC} ",
                      unreadForAdminInList,
                      " ulest fra kunde"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickStatus", children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickActions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(p.id, "prosjekt"), children: "\xC5pne" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "Bilder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "Sjekklister" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "Chat" })
                ] })
              ] }, `mobile-pick-${p.id}`);
            }),
            projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen prosjekter hentet enn\xE5. Trykk Oppdater liste." }),
            projects.length > 0 && activeMobileProjectRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen aktive prosjekter matcher s\xF8ket. Avsluttede prosjekter finnes fortsatt i prosjektlisten/arkivet." })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectBar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
              setProjectId(null);
              setTab("prosjekt");
            }, children: "Bytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("bilder"), children: "G\xE5 til bilder" })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: `${currentStatus.icon} Prosjektstatus: ${currentStatus.label}`, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, marginBottom: "10px", border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.icon }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.label })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? `Prosjektet ble l\xE5st${project.lockedAt ? " " + new Date(project.lockedAt).toLocaleString("no-NO") : ""}${project.lockedBy ? " av " + project.lockedBy : ""}. L\xE5s opp prosjektet hvis du trenger \xE5 gj\xF8re endringer.` : "Prosjektet er \xE5pent for endringer. N\xE5r prosjektet er ferdig og overlevert kan det avsluttes og l\xE5ses." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Overtagelse er registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u{1F4AC} Chat: ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt",
            customerChatCount > 0 ? ` \xB7 ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest` : "",
            latestChatMessage?.created ? ` \xB7 siste ${new Date(latestChatMessage.created).toLocaleString("no-NO")}` : "",
            "."
          ] })
        ] }),
        tab === "prosjekt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: !projectId && !mobileCreatingProject ? "desktopOnlyWhenNoProject" : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Prosjektinformasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Prosjektansvarlig", value: project.responsible, onChange: (v) => setProject({ ...project, responsible: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato", type: "date", value: project.date, onChange: (v) => setProject({ ...project, date: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn p\xE5 prosjekt", value: project.projectName, onChange: (v) => setProject({ ...project, projectName: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: project.address, onChange: (v) => setProject({ ...project, address: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Postnr.", value: project.postnr || "", onChange: (v) => setProject({ ...project, postnr: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Poststed / by", value: project.city || "", onChange: (v) => setProject({ ...project, city: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde", value: project.customer, onChange: (v) => setProject({ ...project, customer: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde e-post", type: "email", value: project.customerEmail || "", onChange: (v) => setProject({ ...project, customerEmail: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Notater", value: project.notes, onChange: (v) => setProject({ ...project, notes: v }) })
        ] }) }) }),
        tab === "firma" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firmaprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Firmaprofilen lagres p\xE5 brukeren din og brukes automatisk i prosjekter og rapporter." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "two", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "logoBox", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp firmalogo",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
              ] }),
              company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setCompany({ ...company, logoUrl: "" }), children: "Fjern logo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email, onChange: (v) => setCompany({ ...company, email: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website, onChange: (v) => setCompany({ ...company, website: v }) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" })
        ] }),
        tab === "innlogging" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging og brukerprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Du er logget inn som ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser?.email }),
            ". Prosjektlisten viser kun dine prosjekter. Delingslenker kan fortsatt \xE5pnes av kunde uten innlogging."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn", value: user.name, onChange: (v) => setUser({ ...user, name: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post i rapport", value: user.email, onChange: (v) => setUser({ ...user, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: user.role, options: roles, onChange: (v) => setUser({ ...user, role: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }),
        tab === "prosjektering" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektering", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Angi fall som forholdstall, for eksempel 1:50 i dusjsone og 1:100 utenfor dusjsone." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall i dusjsone", value: project.fallDusj || "", onChange: (v) => setProject({ ...project, fallDusj: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall utenfor dusjsone / v\xE5tsone", value: project.fallUtenfor || "", onChange: (v) => setProject({ ...project, fallUtenfor: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Slukplassering", value: project.sluk, onChange: (v) => setProject({ ...project, sluk: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Terskelh\xF8yde", value: project.terskel, onChange: (v) => setProject({ ...project, terskel: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Membranl\xF8sning", value: project.membran, onChange: (v) => setProject({ ...project, membran: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / avvik", value: project.prosjekteringKommentar, onChange: (v) => setProject({ ...project, prosjekteringKommentar: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne prosjekteringspunkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne punkter som skal f\xF8lge prosjektet og vises i rapporten hvis de er fylt ut." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: addProsjekteringPunkt, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til punkt"
            ] }),
            (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Punkt / tittel", value: point.title || "", onChange: (v) => updateProsjekteringPunkt(point.id, { title: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Verdi / beskrivelse", value: point.value || "", onChange: (v) => updateProsjekteringPunkt(point.id, { value: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProsjekteringPunkt(point.id), children: "Fjern punkt" })
            ] }, point.id))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
            " Last opp tegning / bilde",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto("Prosjektering", e.target.files) })
          ] })
        ] }),
        tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: productSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av produkter som er brukt. N\xE5r et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte p\xE5 produktet." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: s.items.map((i) => {
            const doc = productDocs[i] || {};
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
              ] }),
              checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
                ] }),
                doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
              ] })
            ] }, i);
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
              "Andre produkter i ",
              s.title
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til annet produkt"
            ] }),
            getManualProductsForSection(s.title).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
            getManualProductsForSection(s.title).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
            ] }, p.id))
          ] })
        ] }, s.title)) }),
        tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
        tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
              " ",
              c
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde eller velg fra galleri" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
          ] }, c)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
        ] }),
        tab === "tilgang" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilgang og deling", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Administrer tilgang til prosjektet. Kunde f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat. Underentrepren\xF8rer kan bidra med dokumentasjon via egen tilgang." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: accessRoleInfo.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.role }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.text })
          ] }, r.role)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverand\xF8r" }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til person/firma"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Del med kunde" })
          ] }),
          access.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen ekstra tilganger er lagt til enn\xE5." }),
          access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: accessRoleInfo.find((r) => r.role === a.role)?.text || "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Del med denne personen" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
            ] })
          ] }, a.id))
        ] }),
        tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Ukjent", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
            " Legg til post"
          ] }),
          inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp bilder",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                const imgs = await uploadImages(e.target.files, "installasjoner");
                setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
              } })
            ] }),
            (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "\u{1F4F7} ",
              (x.photos || []).length,
              " bilder lagt til"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
            ] }, p.id)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
              "Lagt inn av ",
              x.by,
              " \xB7 ",
              x.created
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
          ] }, x.id))
        ] }),
        tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ChecklistEditor,
            {
              checklist,
              setChecklistValue,
              addChecklistPhoto,
              addFiles,
              files,
              setFiles
            }
          )
        ] }),
        tab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her legger du inn tilbud, kontrakt og avtaleendringer. Kunde f\xE5r se dette i kundelinken n\xE5r det finnes innhold eller vedlegg. Huk av hvis sammendraget ogs\xE5 skal med i vanlig rapport/PDF." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, kommentar: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!tilbud.enabled,
                  onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med sammendrag i rapport" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp tilbud, kontrakt eller andre avtaledokumenter. Vedleggene lagres p\xE5 prosjektet og vises i kundelinken. Underentrepren\xF8r har ikke tilgang til tilbud/kontrakt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp tilbud / kontrakt",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => uploadTilbudFiles(e.target.files) })
            ] }),
            (tilbud.files || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen tilbud eller kontrakter er lastet opp enn\xE5." }),
            (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lastet opp av ",
                f.by || "Ukjent",
                " \xB7 ",
                f.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", children: "\xC5pne" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setTilbud({ ...emptyTilbud(), ...tilbud, files: (tilbud.files || []).filter((x) => x.id !== f.id) }), children: "Fjern" })
            ] }, f.id))
          ] })
        ] }),
        tab === "overtagelse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overtagelse og signering", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk denne ved sluttbefaring og overlevering. N\xE5r begge signaturer er fylt ut kan prosjektet fullf\xF8res og l\xE5ses." }),
          isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er l\xE5st. Overtagelsen kan vises i rapporten, men endringer krever at prosjektet l\xE5ses opp." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u2705 Overtagelse registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato for overtagelse", type: "date", value: overtagelse.dato || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, dato: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!overtagelse.enabled,
                  onChange: (e) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med overtagelse i rapport" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / merknader fra sluttbefaring", value: overtagelse.kommentar || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, kommentar: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Signaturer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Signer direkte p\xE5 skjermen med finger p\xE5 telefon eller mus p\xE5 PC. Navn kan fylles ut i tillegg for tydelig dokumentasjon." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn utf\xF8rende", value: overtagelse.signUtf\u00F8rende || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rende: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn kunde", value: overtagelse.signKunde || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKunde: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur utf\xF8rende",
                    value: overtagelse.signUtf\u00F8rendeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rendeImage: v })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur kunde",
                    value: overtagelse.signKundeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKundeImage: v })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: "Lagre overtagelse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completeOvertagelseAndLock, disabled: isProjectLocked, children: "Fullf\xF8r overtagelse og l\xE5s prosjekt" })
          ] })
        ] }),
        tab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount} meldinger)` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Chatten oppdateres automatisk live. Nye kundemeldinger st\xE5r som ulest til du svarer, klikker p\xE5 meldingen eller trykker Marker alle som lest. Skrivefeltet beholdes ved refresh." }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
            "\u{1F4AC} Det finnes ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt i chatten",
            customerChatCount > 0 ? `, hvorav ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest fra kunde` : " \xB7 alt er lest",
            "."
          ] }),
          !hasValue(project.customerEmail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { fontWeight: 700 }, children: "\u26A0\uFE0F Legg inn kunde e-post i Prosjektinformasjon for at kunde skal f\xE5 e-postvarsling ved nye chatmeldinger." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                checked: !!projectLog.enabled,
                onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med chat i rapport" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
              "\u{1F4F7} Last opp bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  id: "admin-chat-image-input",
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
                }
              ),
              chatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Valgt: ",
                chatUploadFile.name
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addProjectLogMessage, children: "Send melding" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForAdmin === 0, onClick: () => markChatAsRead("admin"), children: "Marker alle som lest" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })), children: "T\xF8m skrivefelt" })
          ] }),
          (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
          (projectLog.messages || []).slice().reverse().map((m) => {
            const isUnread = m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("admin"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                m.by || "Ukjent",
                " ",
                m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                m.role === "kunde" ? isUnread ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : !lastReadByCustomer || (m.created || "") > lastReadByCustomer ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
              m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "img",
                  {
                    src: m.imageUrl,
                    alt: m.imageName || "Chat bilde",
                    style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                  }
                ) }),
                m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: (e) => {
                e.stopPropagation();
                removeProjectLogMessage(m.id);
              }, children: "Fjern melding" })
            ] }, m.id);
          })
        ] }),
        tab === "internt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Interne notater", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette feltet er kun internt. Det vises ikke i kundelink og tas ikke med i rapport." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Interne notater", value: internalNotes || "", onChange: setInternalNotes }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveProject, children: "Lagre interne notater" }) })
        ] }),
        tab === "prosjektliste" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektliste", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.total }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prosjekter totalt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.visible }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Vises med filter" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Uleste kundemeldinger" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xC5pne / p\xE5g\xE5ende" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "S\xF8k i prosjektliste", value: projectSearch, onChange: setProjectSearch }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Statusfilter", value: projectStatusFilter, onChange: setProjectStatusFilter, options: ["alle", "open", "progress", "done", "locked"] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListToolbar", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => loadProjects(authUser, true), children: "Oppdater liste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((v) => !v), children: projectUnreadOnly ? "Vis alle prosjekter" : "Vis kun uleste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
              setProjectSearch("");
              setProjectStatusFilter("alle");
              setProjectUnreadOnly(false);
            }, children: "Nullstill filter" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Statusfilter: open = \xE5pen, progress = p\xE5g\xE5r, done = ferdigstilt, locked = avsluttet/l\xE5st." }),
          projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter hentet enn\xE5." }),
          projects.length > 0 && filteredProjectListRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter matcher s\xF8ket eller filteret." }),
          filteredProjectListRows.map(({ row: p, listProject, listStatus, unreadForAdminInList, latestMessage, imageSummary }) => {
            const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListCard", style: unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fff7f7" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListCardTop", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { fontSize: "18px" }, children: p.title || listProject.projectName || "Uten navn" }),
                  listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
                    " ",
                    listProject.customer
                  ] }),
                  locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: locationLine })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListBadges", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${listStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", width: "fit-content", ...statusStyle(listStatus.tone) }, children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content" }, children: [
                    "\u{1F4AC} ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "\u{1F4F7} ",
                    imageSummary.total,
                    " bilder"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListMetaCards", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Oppdatert" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(p.updated_at || p.created_at).toLocaleString("no-NO") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Chat" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: latestMessage?.created ? `Siste: ${new Date(latestMessage.created).toLocaleString("no-NO")}` : "Ingen meldinger" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ansvarlig" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listProject.responsible || "Ikke fylt ut" })
                ] })
              ] }),
              imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", children: [
                  imageSummary.photos > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "\u{1F4C1} Bilder: ",
                    imageSummary.photos
                  ] }),
                  imageSummary.checklist > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "\u2705 Sjekkliste: ",
                    imageSummary.checklist
                  ] }),
                  imageSummary.install > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "\u{1F9F0} Fag/utstyr: ",
                    imageSummary.install
                  ] }),
                  imageSummary.chat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "\u{1F4AC} Chat: ",
                    imageSummary.chat
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageStrip", "aria-label": "Bildeoversikt for prosjekt", children: [
                  imageSummary.previews.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: img.url, alt: img.label || img.source || "Prosjektbilde" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: img.source })
                  ] }, `${p.id}-img-${index}`)),
                  imageSummary.total > imageSummary.previews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", style: { display: "flex", alignItems: "center", justifyContent: "center", height: "58px", border: "1px dashed #c7d6dd", borderRadius: "12px", background: "#f8fafc", fontWeight: 800 }, children: [
                    "+",
                    imageSummary.total - imageSummary.previews.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListActions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => openProjectById(p.id), children: "\u{1F4C2} \xC5pne" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "\u{1F4AC} Chat" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deleteProject(p.id), children: "\u{1F5D1}\uFE0F Slett" })
              ] })
            ] }, p.id);
          })
        ] }),
        tab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, { company, name, project, selected, manualProducts: manualSelected, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }),
        tab === "admin" && isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Admin", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan administrator godkjenne brukere og vedlikeholde felles FDV-register. FDV-linker fra registeret fylles automatisk inn n\xE5r et standardprodukt krysses av i et prosjekt, men kan fortsatt overstyres manuelt per prosjekt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukergodkjenning" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Forutsetter at Supabase-policy tillater admin \xE5 lese og oppdatere profiles." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: loadAdminUsers, children: adminLoading ? "Henter brukere..." : "Oppdater brukerliste" }),
            adminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere hentet enn\xE5. Trykk Oppdater brukerliste." }),
            adminUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                u.company_name ? `Firma: ${u.company_name} \xB7 ` : "",
                "Status: ",
                u.approved ? "Godkjent" : "Venter p\xE5 godkjenning"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                !u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => approveAdminUser(u.id), children: "Godkjenn bruker" }),
                u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => revokeAdminUser(u.id), children: "Fjern godkjenning" })
              ] })
            ] }, u.id))
          ] }),
/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Admin Produktmaster" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er produktdatabasen fra prisfilen, uten priser. Legg inn FDV, datablad, DOP, EPD og sikkerhetsdatablad her. N\xE5r et standardprodukt velges i prosjektet, henter appen dokumentlinker automatisk fra denne masteren." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.total }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Produkter/varianter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.appMatches }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Koblet mot app" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.withDocs }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Med dokumenter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterLoading ? "..." : "OK" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProductMaster(true), children: productMasterLoading ? "Henter produktmaster..." : "Oppdater produktmaster" }) }),
            (productMaster || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter funnet i produktmaster. Kj\xF8r SQL-filen fra flisLAB-importen f\xF8rst." }),
            (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.product_name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                row.product_no,
                " \xB7 ",
                row.category || "Uten kategori",
                row.app_match_name ? ` \xB7 App: ${row.app_match_name}` : ""
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: row.fdv_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { fdv_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: row.datablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { datablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: row.dop_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { dop_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: row.epd_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { epd_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: row.sikkerhetsdatablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { sikkerhetsdatablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Vedlagt dokument / samlet PDF", value: row.document_file_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { document_file_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: row.comment || "", onChange: (v) => updateProductMasterLocal(row.product_no, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => saveProductMasterRow(row), children: "Lagre dokumenter" }),
                row.updated_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Sist oppdatert: ",
                  new Date(row.updated_at).toLocaleString("no-NO")
                ] })
              ] })
            ] }, "pm-" + row.product_no))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomAppNav", "aria-label": "Hovednavigasjon mobil", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjektliste" ? "active" : "secondary", onClick: () => goToTab("prosjektliste"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C1}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Liste" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjekt" ? "active" : "secondary", onClick: () => goToTab("prosjekt"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u270F\uFE0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Info" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "chat" ? "active" : "secondary", onClick: () => goToTab("chat"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4AC}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin}` : "Chat" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "bilder" ? "active" : "secondary", onClick: () => goToTab("bilder"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4F7}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foto" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "rapport" ? "active" : "secondary", onClick: () => goToTab("rapport"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C4}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDF" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomPrevNext", style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        maxWidth: "1180px",
        margin: "18px auto 28px",
        padding: "0 18px",
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "secondary",
            disabled: !previousTab,
            onClick: () => previousTab && goToTab(previousTab[0]),
            style: { flex: "1 1 150px" },
            children: [
              "\u2190 Forrige",
              previousTab ? `: ${previousTab[1]}` : ""
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => nextTab && goToTab(nextTab[0]),
            disabled: !nextTab,
            style: { flex: "1 1 150px" },
            children: [
              "Neste",
              nextTab ? `: ${nextTab[1]}` : "",
              " \u2192"
            ]
          }
        )
      ] })
    ] });
  }
  async function uploadChatImage(file, projectId = "uten-prosjekt", sender = "chat") {
    if (!file) return null;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
    const safeProjectId = String(projectId || "uten-prosjekt").replace(/[^a-zA-Z0-9._-]/g, "-");
    const safeSender = String(sender || "chat").replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `${safeProjectId}/${safeSender}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from("chat-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error(error);
      alert("Kunne ikke laste opp bilde: " + error.message);
      return null;
    }
    const { data: publicData } = supabase.storage.from("chat-images").getPublicUrl(data.path);
    return {
      imageUrl: publicData.publicUrl,
      imageName: file.name,
      imagePath: data.path
    };
  }
  function Brand({ logo, name }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "260px", height: "80px", overflow: "hidden", display: "flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo ? logo : "/expo-logo.png", alt: name || "Expo Proffsenter", style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } }) });
  }
  function Section({ title, icon, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
        icon,
        title
      ] }),
      children
    ] });
  }
  function Grid({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid", children });
  }
  function Input({ label, value, onChange, type = "text", onKeyDown, autoComplete }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, value, autoComplete, onKeyDown, onChange: (e) => onChange(e.target.value) })
    ] });
  }
  function Textarea({ label, value, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { value, onChange: (e) => onChange(e.target.value) })
    ] });
  }
  function Select({ label, value, onChange, options }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o)) })
    ] });
  }
  function PhotoGrid({ photos, setPhotos }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.cat }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.created }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "Kommentar", value: p.comment, onChange: (e) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, comment: e.target.value } : x)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "secondary", onClick: () => setPhotos(photos.filter((x) => x.id !== p.id)), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 16 }),
        " Fjern"
      ] })
    ] }, p.id)) });
  }
  function ChecklistEditor({ checklist, setChecklistValue, addChecklistPhoto, addFiles, files, setFiles }) {
    const [openCategories, setOpenCategories] = import_react.default.useState(() => ({ [checklistTemplate[0]?.category || ""]: true }));
    const groupStats = (group) => {
      const total = group.items.length;
      const done = group.items.filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      const deviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Avvik").length;
      const photos = group.items.reduce((sum, item) => sum + (checklist?.[group.category]?.[item]?.photos || []).length, 0);
      return { total, done, missing: Math.max(0, total - done), deviations, photos };
    };
    const totalStats = checklistTemplate.reduce((acc, group) => {
      const stats = groupStats(group);
      acc.total += stats.total;
      acc.done += stats.done;
      acc.missing += stats.missing;
      acc.deviations += stats.deviations;
      acc.photos += stats.photos;
      return acc;
    }, { total: 0, done: 0, missing: 0, deviations: 0, photos: 0 });
    const percent = totalStats.total ? Math.round(totalStats.done / totalStats.total * 100) : 0;
    const toggleCategory = (category) => setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    const expandAll = () => setOpenCategories(Object.fromEntries(checklistTemplate.map((group) => [group.category, true])));
    const collapseDone = () => setOpenCategories(Object.fromEntries(checklistTemplate.map((group) => {
      const stats = groupStats(group);
      return [group.category, stats.missing > 0 || stats.deviations > 0];
    })));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryCard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sjekklistefremdrift" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            totalStats.done,
            " av ",
            totalStats.total,
            " punkter vurdert \xB7 ",
            percent,
            "% ferdig"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.done,
            " utfylt"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26AA ",
            totalStats.missing,
            " mangler"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26A0\uFE0F ",
            totalStats.deviations,
            " avvik"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u{1F4F7} ",
            totalStats.photos,
            " bilder"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: expandAll, children: "\xC5pne alle" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: collapseDone, children: "Vis det som gjenst\xE5r" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList checklistAccordion", children: checklistTemplate.map((group) => {
        const stats = groupStats(group);
        const isOpen = openCategories[group.category] !== false;
        const groupTone = stats.deviations > 0 ? "avvik" : stats.missing === 0 ? "done" : stats.done > 0 ? "progress" : "missing";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `item checklistGroup checklistGroup-${groupTone}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "checklistGroupHeader", onClick: () => toggleCategory(group.category), "aria-expanded": isOpen, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "checklistGroupCaret", "aria-hidden": "true", children: isOpen ? "\u25BE" : "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "checklistGroupTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: group.category }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                stats.done,
                "/",
                stats.total,
                " utfylt",
                stats.deviations ? ` \xB7 ${stats.deviations} avvik` : "",
                stats.photos ? ` \xB7 ${stats.photos} bilder` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `checklistGroupBadge checklistGroupBadge-${groupTone}`, children: stats.deviations > 0 ? "\u26A0\uFE0F Avvik" : stats.missing === 0 ? "\u2705 Ferdig" : stats.done > 0 ? "\u{1F7E1} P\xE5g\xE5r" : "\u26AA Mangler" })
          ] }),
          isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistGroupBody", children: group.items.map((item) => {
            const value = checklist[group.category]?.[item] || {};
            const pointTone = value.status === "Avvik" ? "avvik" : value.status ? "done" : "missing";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `checklistPoint checklistPoint-${pointTone}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                    value.status || "Ikke vurdert",
                    (value.photos || []).length > 0 ? ` \xB7 \u{1F4F7} ${(value.photos || []).length} bilder` : ""
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistStatusButtons", children: ["Ok", "Ikke aktuelt", "Avvik"].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: value.status === status ? "" : "secondary",
                    onClick: () => setChecklistValue(group.category, item, { status }),
                    children: status
                  },
                  status
                )) })
              ] }),
              (value.status || value.comment || (value.photos || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Textarea,
                {
                  label: "Kommentar",
                  value: value.comment || "",
                  onChange: (v) => setChecklistValue(group.category, item, { comment: v })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Ta bilde / last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addChecklistPhoto(group.category, item, e.target.files) })
              ] }),
              (value.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos checklistPhotos", children: value.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) })
            ] }, item);
          }) })
        ] }, group.category);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Opplastede sjekklister / vedlegg fra andre fag", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
          " Last opp sjekkliste / vedlegg",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => addFiles(e.target.files) })
        ] }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
            "Lastet opp av ",
            f.by,
            " \xB7 ",
            f.created
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", children: "\xC5pne" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setFiles(files.filter((x) => x.id !== f.id)), children: "Fjern" })
        ] }, f.id))
      ] })
    ] });
  }
  function ChecklistReportSection({ checklist }) {
    const rows = [];
    Object.entries(checklist || {}).forEach(([category, items]) => {
      Object.entries(items || {}).forEach(([item, value]) => {
        if (value?.status || value?.comment || (value?.photos || []).length) {
          rows.push({ category, item, ...value });
        }
      });
    });
    if (!rows.length) return null;
    const deviations = rows.filter((r) => r.status === "Avvik");
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekkliste" }),
      [...new Set(rows.map((r) => r.category))].map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: category }),
        rows.filter((r) => r.category === category).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.item }),
            " \u2014 ",
            r.status || "Ikke vurdert"
          ] }),
          r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.comment }),
          (r.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: r.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || r.item }) }, p.id)) })
        ] }, r.category + r.item))
      ] }, category)),
      deviations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Avviksliste" }),
        deviations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            r.category,
            " / ",
            r.item,
            ":"
          ] }),
          " ",
          r.comment || "Avvik registrert"
        ] }, "avvik-" + r.category + r.item))
      ] })
    ] });
  }
  function Report({ company, name, project, selected, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = { Prosjektansvarlig: project.responsible, Prosjektnavn: project.projectName, Adresse: project.address, "Postnr.": project.postnr, "Poststed / by": project.city, Kunde: project.customer, "Kunde e-post": project.customerEmail, Dato: project.date, Status: project.locked ? "Avsluttet / l\xE5st" : "Aktivt", Notater: project.notes };
    const cats = [...new Set(photos.map((p) => p.cat))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: name }),
            company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.address }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] }),
            company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.phone }),
            company.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.email }),
            company.website && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.website })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "FDV-rapport / Prosjektdokumentasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: Object.entries(projectFields).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: v || "Ikke fylt ut" })
        ] }, k)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall i dusjsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallDusj || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall utenfor dusjsone / v\xE5tsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallUtenfor || "Ikke oppgitt" })
          ] }),
          project.fall && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall mot sluk" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fall })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Slukplassering" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.sluk || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Terskelh\xF8yde" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.terskel || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membran" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.membran || "Ikke oppgitt" })
          ] })
        ] }),
        (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || "Eget punkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.value || "Ikke oppgitt" })
        ] }, p.id || p.title)),
        project.prosjekteringKommentar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kommentar / avvik" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.prosjekteringKommentar })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.fdvUrl, target: "_blank", children: "\xC5pne FDV" }) }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.databladUrl, target: "_blank", children: "\xC5pne datablad" }) }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.dopUrl, target: "_blank", children: "\xC5pne DOP" }) }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.epdUrl, target: "_blank", children: "\xC5pne EPD" }) }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.sikkerhetsdatabladUrl, target: "_blank", children: "\xC5pne sikkerhetsdatablad" }) }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.documentFileUrl, target: "_blank", children: "\xC5pne vedlagt dokument" }) })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.fdvUrl, target: "_blank", children: "\xC5pne FDV" }) }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.databladUrl, target: "_blank", children: "\xC5pne datablad" }) }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.dopUrl, target: "_blank", children: "\xC5pne DOP" }) }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.epdUrl, target: "_blank", children: "\xC5pne EPD" }) }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.sikkerhetsdatabladUrl, target: "_blank", children: "\xC5pne sikkerhetsdatablad" }) }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.documentFileUrl, target: "_blank", children: "\xC5pne vedlagt dokument" }) })
        ] }, p.id)),
        Object.entries(other).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater" }),
        Object.entries(surf).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            i.category,
            ":"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            i.name,
            " ",
            i.qty && `\xB7 ${i.qty}`,
            " ",
            i.supplier && `\xB7 ${i.supplier}`,
            " ",
            i.desc && ` \u2014 ${i.desc}`
          ] }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: i.fdvUrl, target: "_blank", children: "\xC5pne FDV/datablad" }) })
        ] }, i.id))
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjekttilgang" }),
        access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          a.name || a.email,
          " \u2014 ",
          a.role
        ] }, a.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", { children: "Levert av Expo Proffsenter" })
    ] });
  }
  function hasValue(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function InfoCard({ label, value }) {
    if (!hasValue(value)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: value })
    ] });
  }
  function SignatureCard({ label, name, image }) {
    if (!hasValue(name) && !hasValue(image)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: name }),
      image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: image, alt: label, style: { width: "100%", maxWidth: "360px", height: "120px", objectFit: "contain", background: "#fff", border: "1px solid #dbe7ec", borderRadius: "12px", marginTop: "8px" } })
    ] });
  }
  function SignaturePad({ label, value, onChange }) {
    const canvasRef = import_react.default.useRef(null);
    const drawingRef = import_react.default.useRef(false);
    const hasDrawnRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(180 * ratio));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
          ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        img.src = value;
        hasDrawnRef.current = true;
      } else {
        hasDrawnRef.current = false;
      }
    }, [value]);
    const getPoint = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0] || event.changedTouches?.[0];
      const source = touch || event;
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top
      };
    };
    const start = (event) => {
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      drawingRef.current = true;
      hasDrawnRef.current = true;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      drawingRef.current = false;
      const canvas = canvasRef.current;
      if (hasDrawnRef.current) onChange(canvas.toDataURL("image/png"));
    };
    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, 180);
      hasDrawnRef.current = false;
      onChange("");
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "canvas",
        {
          ref: canvasRef,
          style: { width: "100%", height: "180px", background: "#fff", border: "1px solid #c7d6dd", borderRadius: "14px", touchAction: "none", display: "block", marginTop: "10px" },
          onMouseDown: start,
          onMouseMove: move,
          onMouseUp: end,
          onMouseLeave: end,
          onTouchStart: start,
          onTouchMove: move,
          onTouchEnd: end
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: clear, children: "T\xF8m signatur" }) })
    ] });
  }
  function CustomerReport({ company, name, project, selected, manualProducts, other, surf, photos, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = [
      ["Prosjektansvarlig", project.responsible],
      ["Prosjektnavn", project.projectName],
      ["Adresse", project.address],
      ["Postnr.", project.postnr],
      ["Poststed / by", project.city],
      ["Kunde", project.customer],
      ["Kunde e-post", project.customerEmail],
      ["Dato", project.date],
      ["Status", project.locked ? "Avsluttet / l\xE5st" : "Aktivt"],
      ["Notater", project.notes]
    ];
    const prosjektering = [
      ["Fall i dusjsone", project.fallDusj],
      ["Fall utenfor dusjsone / v\xE5tsone", project.fallUtenfor],
      ...hasValue(project.fall) ? [["Fall mot sluk", project.fall]] : [],
      ["Slukplassering", project.sluk],
      ["Terskelh\xF8yde", project.terskel],
      ["Membranl\xF8sning", project.membran],
      ...(Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [p.title || "Eget punkt", p.value]),
      ["Kommentar / avvik", project.prosjekteringKommentar]
    ];
    const surfaceRows = Object.entries(surf || {}).filter(([, v]) => hasValue(v));
    const otherRows = Object.entries(other || {}).filter(([, v]) => hasValue(v));
    const photoCats = [...new Set((photos || []).map((p) => p.cat).filter(Boolean))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: project.projectName || "FDV-rapport / Prosjektdokumentasjon" }),
            project.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.address }),
            project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
              " ",
              project.customer
            ] }),
            company.companyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utf\xF8rende:" }),
              " ",
              company.companyName
            ] }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: projectFields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      prosjektering.some(([, v]) => hasValue(v)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: prosjektering.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      (selected.length > 0 || (manualProducts || []).length > 0 || otherRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.fdvUrl, target: "_blank", children: "\xC5pne FDV/datablad" }) })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: p.fdvUrl, target: "_blank", children: "\xC5pne FDV/datablad" }) })
        ] }, p.id)),
        otherRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      surfaceRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaceRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: k, value: v }, k)) })
      ] }),
      (photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        photoCats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.cat || "Dokumentasjonsbilde" }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      (inst || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: i.category || "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: [i.name, i.qty, i.supplier, i.desc].filter(Boolean).join(" \xB7 ") }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: i.fdvUrl, target: "_blank", children: "\xC5pne FDV/datablad" }) }),
          (i.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: i.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || "Bilde" }) }, p.id)) })
        ] }, i.id))
      ] }),
      (hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { id: "kunde-tilbud", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      (files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", { children: "Levert av Expo Proffsenter" })
    ] });
  }
  (0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
