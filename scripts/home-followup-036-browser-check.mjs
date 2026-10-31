import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.cwd();
let checks = 0, browser;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const built = await build({ root, configFile: false, logLevel: 'silent', plugins: [react(), {
  name: 'home-isolated-access', enforce: 'pre',
  resolveId(id, importer) { if (importer?.endsWith('/WorkdayShortcuts.jsx') && id.endsWith('/moduleAccessClient.js')) return '\0home-access'; },
  load(id) { if (id === '\0home-access') return 'export const MODULE_ACCESS_EVENT="qa-access";export const readCachedModuleAccess=()=>({loaded:true});export const hasModuleAccess=()=>true;'; },
}], resolve: { alias: { react: path.join(root, 'node_modules/react'), 'react-dom': path.join(root, 'node_modules/react-dom') } },
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""' },
  build: { write: false, minify: false, lib: { entry: path.join(root, 'scripts/fixtures/home-followup-036-harness.jsx'), formats: ['es'], name: 'HomeQA', cssFileName: 'home-workspace' } } });
const output = (Array.isArray(built) ? built[0] : built).output;
const js = output.find(item => item.type === 'chunk' && item.isEntry).code;
const css = output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n');
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="app"></div><script type="module">${js.replaceAll('</script', '<\\/script')}</script>`); });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
  const page = await browser.newPage(), errors = [], outbound = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => { if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue(); outbound.push(route.request().url()); return route.abort(); });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  try { await page.waitForFunction(() => window.qa?.committed === 'full'); }
  catch (error) { throw new Error(`Home fixture did not mount: ${JSON.stringify(errors)}`, { cause: error }); }
  for (const width of [320, 390, 768, 1363, 1920]) {
    await page.setViewportSize({ width, height: 600 });
    eq(await page.locator('.pd-home-task').count(), 6, `approved six work areas retained at ${width}`);
    eq(await page.locator('.pd-home-workspace button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44&&getComputedStyle(n).fontSize==='16px')),true,`all six-area native actions remain readable at ${width}`);
    eq(await page.locator('#pd-home-title').evaluate(n=>getComputedStyle(n).fontSize),width<=620?'29px':'32px',`home heading after late CSS at ${width}`);
    if (width >= 1363) {
      const positions = await page.locator('.pd-home-task').evaluateAll(nodes => nodes.slice(0, 3).map(node => node.querySelector('.pd-task-main').getBoundingClientRect().top));
      eq(Math.max(...positions) - Math.min(...positions) <= 1, true, `approved home task actions align across the first row at ${width}: ${positions}`);
    }
    await page.getByRole('button',{name:'Fyll ut sjekkliste',exact:true}).click();eq(await page.evaluate(()=>window.qa.calls.at(-1)),{label:'standalone',args:[]},'shared native checklist entry '+width);
    eq(await page.locator('.pd-followup-row').count(), 3, `all project priorities remain at ${width}`);
    eq(await page.locator('.pd-sales-followup-row').count(), 6, `native desktop item limit retained at ${width}`);
    eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `home document fits at ${width}`);
    const geometry = await page.locator('.pd-sales-followup-row').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect(), button = node.querySelector('button').getBoundingClientRect();
      return { height: rect.height, overflow: node.scrollWidth > node.clientWidth + 1, buttonWidth: button.width, buttonHeight: button.height, font: parseFloat(getComputedStyle(node.querySelector('button')).fontSize), shadow: getComputedStyle(node).boxShadow };
    }));
    eq(geometry.every(row => !row.overflow), true, `actual offer rows fit internally at ${width}`);
    eq(geometry.every(row => row.buttonWidth >= 44 && row.buttonHeight >= 44 && row.font >= 16), true, `native offer actions remain readable and usable at ${width}`);
    eq(geometry.every(row => row.shadow === 'none'), true, `offer followups use restrained rows at ${width}`);
    if (width >= 1363) eq(geometry.every(row => row.height <= 94), true, `offer followups use desktop width at ${width}`);
    await page.locator('.pd-sales-followup-row').first().getByRole('button', { name: 'Åpne tilbud', exact: true }).click();
    eq(await page.evaluate(() => window.qa.calls.at(-1)), { label: 'offer', args: ['offer-0'] }, `native offer callback retains exact case at ${width}`);
    if (process.env.HOME_WORKSPACE_SCREENSHOTS) { fs.mkdirSync(process.env.HOME_WORKSPACE_SCREENSHOTS, { recursive: true }); await page.screenshot({ path: path.join(process.env.HOME_WORKSPACE_SCREENSHOTS, `home-${width}.png`), fullPage: true }); }
  }
  for (const [state, count] of [['compact', 4], ['empty', 0], ['loading', 0], ['error', 0]]) {
    await page.evaluate(value => window.qa.show(value), state);
    await page.waitForFunction(value => window.qa.committed === value, state);
    eq(await page.locator('.pd-sales-followup-row').count(), count, `native ${state} renderer retained`);
    if (state === 'error') eq(await page.getByText('Kunne ikke hente tilbud som bør følges opp.', { exact: false }).isVisible(), true, 'failure remains explicit');
  }
  await page.evaluate(()=>window.qa.show('noStandalone'));await page.waitForFunction(()=>window.qa.committed==='noStandalone');eq(await page.getByRole('button',{name:'Fyll ut sjekkliste',exact:true}).count(),0,'lost standalone access removes shared home entry');
  eq(outbound, [], 'hard boundary: no remote transport');
  eq(errors, [], 'no runtime errors');
  console.log(`PASS home followup 03.6: ${checks} actual component/Chromium assertions, approved six-area home and native project/offer callbacks; synthetic read-only data.`);
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
