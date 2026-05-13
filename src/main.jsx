[...]
  var uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  [...]
  var emptyTilbud = () => ({
    [...]
  });
  var emptyOvertagelse = () => ({
    [...]
  });
  var emptyProject = () => ({
    [...]
  });
  var emptyProjectLog = () => ({
    [...]
  });
  var normalizeProjectLog = (log = {}) => ({
    [...]
  });
  var normalizeManualProductsBySection = (value = {}) => {
    const result = {};
    const addProduct = (section, product) => {
      [...]
    };
    [...]
  };
  function App() {
    [...]
    const openImageLightboxFromClick = (event) => {
      [...]
    };
    [...]
    const getManualProductsForSection = (section) => manualProductsBySection[section] || [];
    [...]
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        [...]
      };
    [...]
    const projectIsLocked = (p = project) => p?.locked === true || p?.locked === "true" || p?.status === "locked" || p?.status === "Avsluttet";
    const applyLockState = (baseProject, sourceProject = {}) => ({
      [...]
    });
    const isProjectLocked = projectIsLocked(project);
    const projectHasOvertagelse = (o = overtagelse) => !!o?.enabled || hasValue(o?.dato) || hasValue(o?.kommentar) || hasValue(o?.signUtf\u00F8rende) || hasValue(o?.signKunde) || hasValue(o?.signUtf\u[...]
    const projectStatusInfo = (p = project, o = overtagelse) => {
      [...]
    };
    const currentStatus = projectStatusInfo(project, overtagelse);
    const statusStyle = (tone) => ({
      background: tone === "done" ? "#ecfdf5" : tone === "locked" ? "#f8fafc" : tone === "progress" ? "#fffbeb" : "#eff6ff",
      color: tone === "done" ? "#065f46" : tone === "locked" ? "#334155" : tone === "progress" ? "#92400e" : "#075985"
    });
    [...]
    const rowIsLocked = (row) => row?.locked === true || row?.locked === "true" || projectIsLocked(row?.data?.project || {});
    const projectFromRow = (row, fallbackProject = project) => {
      [...]
    };
    const dataFromRow = (row, fallbackData = {}) => ({
      ...row?.data || fallbackData || {},
      project: projectFromRow(row, (row?.data || fallbackData || {}).project || emptyProject())
    });
    [...]
    const goToTab = (id) => {
      [...]
    };
    const packData = () => ({ company, user, project, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog, internalNotes });
    const unpackData = (data, preserveDraft = false) => {
      [...]
    };
    const loadProjects = async (currentUser = authUser, notify = false) => {
      [...]
    };
    const openProjectById = async (id, targetTab = "rapport") => {
      [...]
    };
    const refreshProjectFromCloud = async (silent = false, fullRefresh = false) => {
      [...]
    };
    const applyProfile = (row) => {
      [...]
    };
    const ensureProfile = async (sessionUser) => {
      [...]
    };
    const handleAuthUser = async (sessionUser) => {
      [...]
    };
    [...]
      const applyChatData = (row) => {
        [...]
      };
    [...]
    const createNewProject = () => {
      [...]
    };
    const addProsjekteringPunkt = () => {
      [...]
    };
    const updateProsjekteringPunkt = (id, patch) => {
      [...]
    };
    const removeProsjekteringPunkt = (id) => {
      [...]
    };
    const updateProductDoc = (productName, patch) => {
      [...]
    };
    const toggleProductChecked = (productName, isChecked) => {
      [...]
    };
    const addManualProduct = (section) => {
      [...]
    };
    const updateManualProduct = (section, id, patch) => {
      [...]
    };
    const removeManualProduct = (section, id) => {
      [...]
    };
    const markChatAsRead = async (reader = "admin") => {
      [...]
    };
    const notifyChatMessage = async ({ toEmail, direction, message }) => {
      [...]
    };
    const ownerNotificationEmail = () => user.email || authUser?.email || company.email || profile?.email || "";
    const addProjectLogMessage = async () => {
      [...]
    };
    const removeProjectLogMessage = (id) => {
      [...]
    };
    const saveCustomerChatMessage = async () => {
      [...]
    };
    const saveProject = async () => {
      [...]
      const makeCleanData = (projectOverride = snapshot.project, projectLogOverride = snapshot.projectLog) => JSON.parse(JSON.stringify({
        [...]
      }));
      [...]
        const matchesSavedProject = (row) => {
          const saved = row?.data?.project || {};
          return (saved.projectName || "") === (saveProjectData.projectName || "") && (saved.address || "") === (saveProjectData.address || "") && (saved.postnr || "") === (saveProjectData.postnr || "[...]
        };
      [...]
    };
    const saveSharedProject = async () => {
      [...]
    };
    const setProjectLockedState = async (locked) => {
      [...]
    };
    const saveAsNewProject = async () => {
      [...]
    };
    const deleteProject = async (id) => {
      [...]
    };
    const saveProjectForLink = async () => {
      [...]
    };
    const makeProjectLink = (id, role = "kunde") => {
      [...]
    };
    const copyLinkToClipboard = async (link, successMessage) => {
      [...]
    };
    const shareProject = async () => {
      [...]
    };
    const copyAccessLink = async (role = "kunde") => {
      [...]
    };
    const completeOvertagelseAndLock = async () => {
      [...]
    };
    const uploadLogo = async (file) => {
      [...]
    };
    const saveProfile = async () => {
      [...]
    };
    const loadAdminUsers = async () => {
      [...]
    };
    const approveAdminUser = async (id) => {
      [...]
    };
    const revokeAdminUser = async (id) => {
      [...]
    };
    const loadFdvRegister = async (notify = false) => {
      [...]
    };
    const seedFdvRegister = async () => {
      [...]
    };
    const saveFdvRegisterRow = async (row) => {
      [...]
    };
    const updateFdvRegisterLocal = (productName, patch) => {
      [...]
    };
    const loadProductMaster = async (notify = false) => {
      [...]
    };
    const updateProductMasterLocal = (productNo, patch) => {
      setProductMaster((prev) => (prev || []).map((row) => row.product_no === productNo ? { ...row, ...patch } : row));
    };
    const saveProductMasterRow = async (row) => {
      [...]
    };
    const syncCurrentProjectProducts = async () => {
      [...]
    };
    const signIn = async () => {
      [...]
    };
    const signUp = async () => {
      [...]
    };
    const resetPassword = async () => {
      [...]
    };
    const completePasswordReset = async () => {
      [...]
    };
    const signOut = async () => {
      [...]
    };
    const printReport = () => {
      setTab("rapport");
      setTimeout(() => window.print(), 400);
    };
    const uploadImages = async (fileList, folder = "photos") => {
      [...]
    };
    const addPhoto = async (cat, fl) => {
      [...]
    };
    const setChecklistValue = (category, item, patch) => {
      [...]
    };
    const addChecklistPhoto = async (category, item, fl) => {
      [...]
    };
    const addFiles = (fl) => setFiles((p) => [...p, ...Array.from(fl || []).map((f) => ({
      [...]
    }))]);
    const uploadTilbudFiles = async (fileList) => {
      [...]
    };
    [...]
                onKeyDown: (e) => {
                  if (e.key === "Enter") completePasswordReset();
                }
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: async () => {
              [...]
            }, children: "Avbryt og g\xE5 til innlogging" })
    [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: limitedTabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick[...]
        [...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], [...]
                [...]
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) [...]
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) [...]
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladU[...]
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
            [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
              [...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
          [...]
          tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.m[...]
          [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", [...]
            [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, categ[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i))[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i[...]
              [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                  const imgs = await uploadImages(e.target.files, "installasjoner");
                  setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
                } })
              [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
    [...]
                onKeyDown: (e) => {
                  if (e.key === "Enter") signIn();
                }
    [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email || authUser.email, onChange: (v) => setCompany({ ...company, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website || "", onChange: (v) => setCompany({ ...company, website: v }) })
          [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
    [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => window.print(), children: [
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "rapport" ? "on" : "", onClick: () => setCustomerTab("rapport"), children: "Rapport" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "prosjektinfo" ? "on" : "", onClick: () => setCustomerTab("prosjektinfo"), children: "Prosjektinformasjon[...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: customerTab === "chat" ? "on" : "", onClick: () => setCustomerTab("chat"), children: [
            [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "tilbud" ? "on" : "", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding fra kunde", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
            [...]
                    onChange: (e) => setCustomerChatUploadFile(e.target.files?.[0] || null)
              [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForCustomer === 0, onClick: () => markChatAsRead("customer"), children: "M[...]
            [...]
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("customer"), style: isUnread ? { borderColor: "#fecaca", backgro[...]
    [...]
      lightboxImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxOverlay", onClick: (event) => {
        event.stopPropagation();
        setLightboxImage(null);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "imageLightboxInner", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxTop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "imageLightboxC[...]
      [...]
          projectId && (isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(false), children: "\u{1F513} L\xE5s opp p[...]
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => g[...]
        [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNavSelectWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg side", value: tab[...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileSectionChips", "aria-label": "Hurtigvalg seksjoner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "produkter" ? "" : "secondary", onClick: () => goToTab("produkter"), children: "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "sjekklister" ? "" : "secondary", onClick: () => goToTab("sjekklister"), children: "Sjekklister" [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "tilbud" ? "" : "secondary", onClick: () => goToTab("tilbud"), children: "Tilbud" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "overtagelse" ? "" : "secondary", onClick: () => goToTab("overtagelse"), children: "Overtag." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavQuick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: !previousTab, onClick: () => previousTab && goToTab(previousTab[0]), children: "\u[...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !nextTab, onClick: () => nextTab && goToTab(nextTab[0]), children: "Neste \u2192" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavStatus", children: [
            unreadForAdmin > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
            [...]
            totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
      [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
            setProjectId(null);
            setTab("prosjekt");
          }, children: "Bytt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg seksjon", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, [...]
      [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProjects(authUser, true), children: "Oppdater liste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
              createNewProject();
              setTab("prosjekt");
            }, children: "+ Nytt prosjekt" })
          [...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(p.id, "prosjekt"), children: "\xC5pne" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "Bilder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "Sjekklister" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "Chat" })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
              setProjectId(null);
              setTab("prosjekt");
            }, children: "Bytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("bilder"), children: "G\xE5 til bilder" })
        [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Prosjektansvarlig", value: project.responsible, onChange: (v) => setProject({ ...project, responsible: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato", type: "date", value: project.date, onChange: (v) => setProject({ ...project, date: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn p\xE5 prosjekt", value: project.projectName, onChange: (v) => setProject({ ...project, projectName: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: project.address, onChange: (v) => setProject({ ...project, address: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Postnr.", value: project.postnr || "", onChange: (v) => setProject({ ...project, postnr: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Poststed / by", value: project.city || "", onChange: (v) => setProject({ ...project, city: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde", value: project.customer, onChange: (v) => setProject({ ...project, customer: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde e-post", type: "email", value: project.customerEmail || "", onChange: (v) => setProject({ ...project, customerEmail: v }) }[...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Notater", value: project.notes, onChange: (v) => setProject({ ...project, notes: v }) })
        [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / nødvendig prosjektinformasjon", value: project.projectDescription || "", onChange: (v) => setProject({ ...proje[...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.projectInfoIncludeInReport, onChange: (e) => setProject({ ...project, projectInfoIncludeInReport[...]
        [...]
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
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn", value: user.name, onChange: (v) => setUser({ ...user, name: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post i rapport", value: user.email, onChange: (v) => setUser({ ...user, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: user.role, options: roles, onChange: (v) => setUser({ ...user, role: v }) })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall i dusjsone", value: project.fallDusj || "", onChange: (v) => setProject({ ...project, fallDusj: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall utenfor dusjsone / v\xE5tsone", value: project.fallUtenfor || "", onChange: (v) => setProject({ ...project, fallUtenfor: v[...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Slukplassering", value: project.sluk, onChange: (v) => setProject({ ...project, sluk: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Terskelh\xF8yde", value: project.terskel, onChange: (v) => setProject({ ...project, terskel: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Membranl\xF8sning", value: project.membran, onChange: (v) => setProject({ ...project, membran: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / avvik", value: project.prosjekteringKommentar, onChange: (v) => setProject({ ...project, prosjekteringKommentar:[...]
          [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Punkt / tittel", value: point.title || "", onChange: (v) => updateProsjekteringPunkt(point.id, { title: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Verdi / beskrivelse", value: point.value || "", onChange: (v) => updateProsjekteringPunkt(point.id, { value: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProsjekteringPunkt(point.id), children: "Fjern punkt" })
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto("Prosjektering", e.target.files) })
        [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], on[...]
              [...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) })[...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl[...]
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
            [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
        [...]
        tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map[...]
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverand\xF8r" }]), children: [
            [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Del med kunde" })
          [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) [...]
            [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Del med denne personen" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
        [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", de[...]
          [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, categor[...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }[...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i))[...]
            [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                const imgs = await uploadImages(e.target.files, "installasjoner");
                setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
              } })
            [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, komme[...]
            [...]
                  onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked })
          [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => uploadTilbudFiles(e.target.files) })
            [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setTilbud({ ...emptyTilbud(), ...tilbud, files: (tilbud.files || []).filter((x) => x.id !==[...]
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato for overtagelse", type: "date", value: overtagelse.dato || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ..[...]
            [...]
                  onChange: (e) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, enabled: e.target.checked })
            [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / merknader fra sluttbefaring", value: overtagelse.kommentar || "", onChange: (v) => setOvertagelse({ ...emptyOver[...]
            [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn utf\xF8rende", value: overtagelse.signUtf\u00F8rende || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), .[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn kunde", value: overtagelse.signKunde || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, s[...]
              [...]
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rendeImage: v })
                [...]
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKundeImage: v })
        [...]
                onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
          [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
          [...]
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
            [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForAdmin === 0, onClick: () => markChatAsRead("admin"), children: "Marker al[...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })), children: "T\xF8m skrivefe[...]
          [...]
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("admin"), style: isUnread ? { borderColor: "#fecaca", background: [...]
              [...]
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: (e) => {
                e.stopPropagation();
                removeProjectLogMessage(m.id);
              }, children: "Fjern melding" })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => loadProjects(authUser, true), children: "Oppdater liste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((v) => !v), children: projectUn[...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
              [...]
            }, children: "Nullstill filter" })
          [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => openProjectById(p.id), children: "\u{1F4C2} \xC5pne" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "\u{1F4AC} Chat" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deleteProject(p.id), children: "\u{1F5D1}\uFE0F Slett" })
        [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncCurrentProjectProducts(), children: "Synk dette prosjektet" })
          [...]
                !u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => approveAdminUser(u.id), children: "Godkjenn bruker" }),
                u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => revokeAdminUser(u.id), children: "Fjern godkjenning" })
          [...]
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)([...]
            [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: row.fdv_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { fdv_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: row.datablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { datablad_url: v }) })[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: row.dop_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { dop_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: row.epd_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { epd_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: row.sikkerhetsdatablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { s[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Vedlagt dokument / samlet PDF", value: row.document_file_url || "", onChange: (v) => updateProductMasterLocal(row.product_n[...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: row.comment || "", onChange: (v) => updateProductMasterLocal(row.product_no, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => saveProductMasterRow(row), children: "Lagre dokumenter" }),
      [...]
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjektliste" ? "active" : "secondary", onClick: () => goToTab("prosjektliste"), children: [
        [...]
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjekt" ? "active" : "secondary", onClick: () => goToTab("prosjekt"), children: [
        [...]
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "chat" ? "active" : "secondary", onClick: () => goToTab("chat"), children: [
        [...]
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "bilder" ? "active" : "secondary", onClick: () => goToTab("bilder"), children: [
        [...]
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "rapport" ? "active" : "secondary", onClick: () => goToTab("rapport"), children: [
      [...]
            onClick: () => previousTab && goToTab(previousTab[0]),
        [...]
            onClick: () => nextTab && goToTab(nextTab[0]),
    [...]
  }
  async function uploadChatImage(file, projectId = "uten-prosjekt", sender = "chat") {
    [...]
  }
  function Brand({ logo, name }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "260px", height: "80px", overflow: "hidden", display: "flex", alignItems: "center" }, children: /* @__PURE__ */ (0, impo[...]
  }
  function Section({ title, icon, children }) {
    [...]
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { chi[...]
    ] });
  }
  function PhotoGrid({ photos, setPhotos }) {
    [...]
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "Kommentar", value: p.comment, onChange: (e) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, comment: e.target.value[...]
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "secondary", onClick: () => setPhotos(photos.filter((x) => x.id !== p.id)), children: [
    [...]
  }
  function ProjectInformationReadOnly({ project }) {
    [...]
  }
  function ChecklistEditor({ checklist, setChecklistValue, addChecklistPhoto, addFiles, files, setFiles }) {
    const [openCategories, setOpenCategories] = import_react.default.useState(() => ({ [checklistTemplate[0]?.category || ""]: true }));
    const groupStats = (group) => {
      [...]
    };
    [...]
    const toggleCategory = (category) => setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    const expandAll = () => setOpenCategories(Object.fromEntries(checklistTemplate.map((group) => [group.category, true])));
    const collapseDone = () => setOpenCategories(Object.fromEntries(checklistTemplate.map((group) => {
      const stats = groupStats(group);
      return [group.category, stats.missing > 0 || stats.deviations > 0];
    })));
    [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "checklistGroupHeader", onClick: () => toggleCategory(group.category), "aria-expanded": isOpen, children: [...]
          [...]
                    onClick: () => setChecklistValue(group.category, item, { status }),
              [...]
                  onChange: (v) => setChecklistValue(group.category, item, { comment: v })
              [...]
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addChecklistPhoto(group.category, item, e.target.files) })
      [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => addFiles(e.target.files) })
        [...]
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setFiles(files.filter((x) => x.id !== f.id)), children: "Fjern" })
    [...]
  }
  function ChecklistReportSection({ checklist }) {
    [...]
  }
  function Report({ company, name, project, selected, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    [...]
  }
  function hasValue(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function InfoCard({ label, value }) {
    [...]
  }
  function SignatureCard({ label, name, image }) {
    [...]
  }
  function SignaturePad({ label, value, onChange }) {
    [...]
        img.onload = () => {
          [...]
        };
    [...]
    const getPoint = (event) => {
      [...]
    };
    const start = (event) => {
      [...]
    };
    const move = (event) => {
      [...]
    };
    const end = (event) => {
      [...]
    };
    const clear = () => {
      [...]
    };
    [...]
  }
  function CustomerReport({ company, name, project, selected, manualProducts, other, surf, photos, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    [...]
  }
  (0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
