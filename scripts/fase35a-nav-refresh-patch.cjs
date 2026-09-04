const fs = require('fs');
const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');

const openMarker = '    const openProjectById = async (id, targetTab = "rapport", options = {}) => {';
if (!s.includes(openMarker)) throw new Error('openProjectById marker not found');

const helper = [
  '    const syncInternalProjectUrl = (activeProjectId, activeTab = "prosjekt") => {',
  '      if (!activeProjectId || typeof window === "undefined") return;',
  '      const params = new URLSearchParams(window.location.search);',
  '      params.set("project", String(activeProjectId));',
  '      params.set("role", "admin");',
  '      params.delete("access");',
  '      params.set("tab", String(activeTab || "prosjekt"));',
  '      const query = params.toString();',
  '      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;',
  '      window.history.replaceState({}, document.title, nextUrl);',
  '    };',
  ''
].join('\n');

s = s.replace(openMarker, helper + '\n' + openMarker);

const openOld = [
  '      setShowOpenDeviationsOnly(!!options.showOpenDeviationsOnly);',
  '      setTab(targetTab);',
  '      setTimeout(() => scrollToMobileTabTarget(targetTab), 180);'
].join('\n');
const openNew = [
  '      setShowOpenDeviationsOnly(!!options.showOpenDeviationsOnly);',
  '      setTab(targetTab);',
  '      syncInternalProjectUrl(data.id, targetTab);',
  '      setTimeout(() => scrollToMobileTabTarget(targetTab), 180);'
].join('\n');
if (!s.includes(openOld)) throw new Error('openProjectById target block not found');
s = s.replace(openOld, openNew);

const tabOld = [
  '      setTab(id);',
  '      setMobileMenuOpen(false);',
  '      setTimeout(() => scrollToMobileTabTarget(id), 90);'
].join('\n');
const tabNew = [
  '      setTab(id);',
  '      if (projectId && (id === "prosjekt" || projectWorkspaceOnlyTabs.has(id))) {',
  '        syncInternalProjectUrl(projectId, id);',
  '      }',
  '      setMobileMenuOpen(false);',
  '      setTimeout(() => scrollToMobileTabTarget(id), 90);'
].join('\n');
if (!s.includes(tabOld)) throw new Error('goToTab block not found');
s = s.replace(tabOld, tabNew);

fs.writeFileSync(path, s);
console.log('Applied refresh navigation patch');
