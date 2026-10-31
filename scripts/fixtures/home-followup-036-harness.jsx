import React, { useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Shortcuts from '../../src/modules/home/WorkdayShortcuts.jsx';
import SalesFollowup from '../../src/modules/sales/components/SalesHomeFollowUp.jsx';
import { createProjectListTools } from '../../src/modules/project/projectListTools.js';
import '../../src/style.css';
import '../../src/modules/ui/proffdokWorkspace.css';

window.qa = { calls: [], source: null, committed: null };
const rows = Array.from({ length: 3 }, (_, index) => ({
  row: { id: `project-${index}`, title: index ? `QA prosjekt ${index}` : 'QA rehabilitering med lang prosjektbetegnelse', updated_at: '2026-10-29T12:00:00Z' },
  listProject: { customer: 'QA kunde', address: 'Eksempelveien 123' },
  listStatus: { tone: index === 2 ? 'customer_ready' : 'progress' },
  unreadForAdminInList: index === 0 ? 2 : 0, openDeviationCount: index === 1 ? 1 : 0,
}));
const offers = Array.from({ length: 7 }, (_, index) => ({
  id: `offer-${index}`, title: index ? `QA tilbud ${index}` : 'QA våtromstilbud med lang tittel',
  customer: 'QA Eiendom og prosjektutvikling AS', address: 'Eksempelveien 123', reference: `QA-${index}`, ageInDays: 7 + index, sentDate: '20.10.2026',
}));
window.qa.source = JSON.stringify({ rows, offers });
const record = label => (...args) => window.qa.calls.push({ label, args });
const tools = createProjectListTools({});
const actions = Object.fromEntries(['Request','Sales','Offer','Catalog','Order','Projects','NewProject','Bolig','Hr','Kshms','Checklists','Personal'].map(name => [`on${name}`, record(name)]));
function App() {
  const [state, setState] = useState('full');
  window.qa.show = setState;
  useLayoutEffect(() => { window.qa.committed = state; }, [state]);
  return <div data-expo-app-shell="true"><main>
    <p data-qa-note="true">Isolert komponentprøve med syntetiske data. Ingen innlogget brukerøkt.</p>
    <Shortcuts canStandaloneChecklists={state!=='noStandalone'} onStandaloneChecklists={()=>record('standalone')()} {...actions} canCatalog canHr canKshms canManageChecklists canPersonal canBolig />
    {tools.renderProjectFollowUpPanel({ projectRows: rows, openProjectById: record('project'), limit: 6 })}
    <SalesFollowup items={state === 'empty' ? [] : offers} error={state === 'error' ? 'Synthetic error' : ''} loading={state === 'loading'} compact={state === 'compact'} onOpenRequest={record('offer')} />
  </main></div>;
}
createRoot(document.getElementById('app')).render(<App />);
