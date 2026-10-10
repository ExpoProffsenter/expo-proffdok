import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { createProjectWorkspaceTabs, createGlobalAppTabs } from '../src/modules/project/projectNavigationTabs.mjs';

// Actual desktop renderer and both shortcut listeners, with native tab data.
const { JSDOM } = await import(process.env.KSHMS_JSDOM_PATH || 'jsdom');
const dir = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kshms-navigation-'));
const bootstrap = fs.readFileSync('src/bootstrap.jsx', 'utf8');
const start = bootstrap.indexOf('function installProjectDeviationShortcutRouting()');
const end = bootstrap.indexOf("const SALES_IMAGE_LIGHTBOX_ID", start);
assert(start >= 0 && end > start);
const entry = path.join(temp, 'entry.js');
fs.writeFileSync(entry, `import {installProjectWorkspaceHeaderGuide} from '${dir}/src/modules/app/projectWorkspaceHeaderGuide.js';
import {installProjectWorkflowUx} from '${dir}/src/modules/project/projectWorkflowUx.js';
import {isProjectDeviationNavLabel} from '${dir}/src/modules/project/projectNavigationTabs.mjs';
globalThis.__workflow=installProjectWorkflowUx;globalThis.__bootstrap=installProjectDeviationShortcutRouting;
${bootstrap.slice(start, end).replace('installProjectDeviationShortcutRouting();', '')}
installProjectWorkspaceHeaderGuide();`);
const bundle = await build({ root: dir, configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry, formats: ['iife'], name: 'NavigationProof', cssFileName: 'navigation-proof' } } });
const code = (Array.isArray(bundle) ? bundle[0] : bundle).output.find(row => row.type === 'chunk').code;

for (const canUseKshms of [false, true]) for (const openDeviationCount of [0, 4]) {
  const dom = new JSDOM('<header><nav></nav></header><div id="expo-desktop-menu-bar"></div><main><button id="shortcut">Åpne Avvik</button></main>', { url: 'https://example.invalid', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, doc = window.document, nav = doc.querySelector('nav');
  window.matchMedia = () => ({ matches: true, addEventListener() {} });
  const Observer = window.MutationObserver, observers = [], frames = new Set();
  window.MutationObserver = class extends Observer { constructor(callback) { super(callback); observers.push(this); } };
  const requestFrame = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = callback => {
    const id = requestFrame(time => { frames.delete(id); callback(time); }); frames.add(id); return id;
  };
  let selected = '';
  const fillNav = tabs => {
    nav.replaceChildren(...tabs.map(([id, label]) => {
      const button = doc.createElement('button'); button.textContent = label; button.dataset.expoNavLabel = label;
      if (id === 'prosjekt') button.className = 'on';
      button.addEventListener('click', () => { selected = id; nav.querySelector('.on')?.classList.remove('on'); button.classList.add('on'); });
      return button;
    }));
  };
  const tabs = createProjectWorkspaceTabs({ canUseKshms, openDeviationCount });
  const expected = tabs.find(([id]) => id === 'avvik')[1];
  fillNav(tabs); window.eval(code);
  const settle = () => new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  await settle();
  const menuButton = doc.querySelector('[data-source-key="deviations"]');
  assert(menuButton, `${expected} missing in actual desktop menu`); assert.equal(menuButton.textContent, expected);
  menuButton.click(); await settle(); assert.equal(selected, 'avvik'); assert.equal(menuButton.getAttribute('aria-current'), 'page');

  // The capture listener in bootstrap must route the overview warning directly.
  window.__bootstrap(); selected = ''; doc.querySelector('#shortcut').click(); assert.equal(selected, 'avvik');
  // The workflow adapter is installed first in the app. Verify its target alone.
  window.__workflow(); await settle();
  assert.equal(doc.querySelector('#shortcut').getAttribute('data-expo-project-flow-target'), expected);
  selected = ''; doc.querySelector('#shortcut').click(); assert.equal(selected, 'avvik');

  fillNav(tabs.map(([id, label]) => [id, id === 'prosjekt' ? 'Ordreoversikt' : label])); await settle();
  assert.equal(doc.querySelector('[data-source-key="deviations"]').textContent, expected);
  selected = ''; doc.querySelector('#shortcut').click(); assert.equal(selected, 'avvik', 'Simple order warning lost the actual deviation destination');

  fillNav(createGlobalAppTabs({ canUseKshms })); await settle();
  assert(!doc.querySelector('#expo-project-workspace-guide'), 'Project menu leaked onto Startside');
  assert(nav.textContent.includes('Startside')); assert.equal(nav.textContent.includes('KS/HMS'), canUseKshms);
  observers.forEach(observer => observer.disconnect());
  frames.forEach(id => window.cancelAnimationFrame(id));
  dom.window.close();
}
fs.rmSync(temp, { recursive: true, force: true });
console.log('Actual desktop navigation: PASS – Avvik and Avvik/SJA/RUH, counts, active state, overview shortcut, workflow target, module-only labels and return to Startside.');
