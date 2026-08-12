// FASE 24G BILDEDOKUMENTASJON: Flytter kun Bilder-fanens presentasjonskomponenter og PhotoGrid ut av main.jsx.
// Ingen endring i bildeopplasting, autolagring, Storage, prosjektdata, rapport, garanti eller tilgangslogikk.
import { Camera, Plus, Trash2 } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_lucide_react = { Camera, Plus, Trash2 };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createImageDocumentationTools({
  Section,
  getPhotoIdentity,
  hasValue,
  isFinishedResultPhoto,
  stopInteractivePropagation
}) {
  function PhotoGrid({ photos, setPhotos, project = {}, setProject = null, canEditProject = () => true, isProjectLocked = false }) {
    const selectedHeroPhotoId = String(project?.reportHeroPhotoId || "").trim();
    const setReportHeroPhoto = (photo) => {
      if (!setProject || !canEditProject()) return;
      setProject({
        ...project,
        reportHeroPhotoId: getPhotoIdentity(photo)
      });
    };
    const clearReportHeroPhotoIfNeeded = (photo) => {
      if (!setProject || selectedHeroPhotoId !== getPhotoIdentity(photo)) return;
      setProject({
        ...project,
        reportHeroPhotoId: ""
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: photos.map((p) => {
      const photoIdentity = getPhotoIdentity(p);
      const canUseAsHero = isFinishedResultPhoto(p) && hasValue(p?.url);
      const isHeroPhoto = canUseAsHero && selectedHeroPhotoId === photoIdentity;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, draggable: false }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.cat }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.created }),
        canUseAsHero && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "item", style: { display: "flex", alignItems: "flex-start", gap: "10px", margin: "8px 0", cursor: isProjectLocked ? "not-allowed" : "pointer" }, onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "reportHeroPhoto", checked: isHeroPhoto, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: () => setReportHeroPhoto(p), style: { width: "18px", height: "18px", marginTop: "2px" } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Bruk som headingbilde i rapport" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: isHeroPhoto ? "Valgt for rapportforsiden. Bildet vises proporsjonalt uten crop eller strekk." : "Gjelder kun bilder i kategorien Ferdig resultat." })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "Kommentar", value: p.comment, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, comment: e.target.value } : x)) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "secondary", onClick: () => {
          clearReportHeroPhotoIfNeeded(p);
          setPhotos(photos.filter((x) => x.id !== p.id));
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 16 }),
          " Fjern"
        ] })
      ] }, p.id);
    }) });
  }

  function ProjectImagesPanel({
    project,
    setProject,
    canEditProject,
    isProjectLocked,
    imageCats,
    photos,
    setPhotos,
    addPhoto,
    stopFileDragNavigation,
    handlePhotoTileDrop,
    photoSaveStatus
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "item", style: { display: "flex", alignItems: "flex-start", gap: "10px", cursor: isProjectLocked ? "not-allowed" : "pointer" }, onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.checklistPhotosNote, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => {
          if (!canEditProject()) return;
          setProject({ ...project, checklistPhotosNote: e.target.checked });
        }, style: { width: "20px", height: "20px", marginTop: "2px" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Flere bilder ligger under sjekkpunkt i sjekkliste" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: "Bruk denne når bildene hovedsakelig er dokumentert direkte på kontrollpunktene, slik at Bilder-fanen ikke må duplisere alt." })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards imageUploadTiles", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", onDragOver: stopFileDragNavigation, onDragEnter: stopFileDragNavigation, onDrop: (e) => handlePhotoTileDrop(c, e), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
          " ",
          c
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde, velg fra galleri eller dra bilde hit" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => addPhoto(c, e.target.files) })
      ] }, c)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: photoSaveStatus || "Bilder autolagres ved opplasting når prosjektet er lagret i skyen." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos, project, setProject, canEditProject, isProjectLocked })
    ] });
  }

  function LimitedProjectImagesPanel({
    project,
    setProject,
    canEditProject,
    isProjectLocked,
    imageCats,
    photos,
    setPhotos,
    addPhoto,
    stopFileDragNavigation,
    handlePhotoTileDrop
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
      photos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen bilder er lagt til ennå. Start gjerne med Før arbeid, Underlag og Ferdig resultat for en ryddig rapport." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "item", style: { display: "flex", alignItems: "flex-start", gap: "10px", cursor: isProjectLocked ? "not-allowed" : "pointer" }, onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.checklistPhotosNote, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => {
          if (!canEditProject()) return;
          setProject({ ...project, checklistPhotosNote: e.target.checked });
        }, style: { width: "20px", height: "20px", marginTop: "2px" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Flere bilder ligger under sjekkpunkt i sjekkliste" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: "Bruk denne når bildene hovedsakelig er dokumentert direkte på kontrollpunktene." })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards imageUploadTiles", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", onDragOver: stopFileDragNavigation, onDragEnter: stopFileDragNavigation, onDrop: (e) => handlePhotoTileDrop(c, e), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
          " ",
          c
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde, velg fra galleri eller dra bilde hit" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => addPhoto(c, e.target.files) })
      ] }, c)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos, project, setProject, canEditProject, isProjectLocked })
    ] });
  }

  return { PhotoGrid, ProjectImagesPanel, LimitedProjectImagesPanel };
}
