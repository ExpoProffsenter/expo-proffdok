import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/pr-core-safety.yml','utf8');
const setup=fs.readFileSync('.github/actions/core-safety-setup/action.yml','utf8');
const baseline=JSON.parse(fs.readFileSync('scripts/qa/core-safety-coverage.json','utf8'));
const actual=[...workflow.matchAll(/^\s*((?:[A-Z_]+=[^\n]*? )?node scripts\/[^\n]+)/gm)].map(m=>m[1].trim());
const remaining=[...actual];
for(const command of baseline.commands) {
  const index=remaining.indexOf(command);
  assert(index>=0, `Original QA command/variant missing: ${command}`);
  remaining.splice(index,1);
}
assert.equal(JSON.parse(fs.readFileSync('package.json','utf8')).scripts.build, baseline.build, 'Original critical/build chain unchanged');
assert(workflow.includes('run: npm run build'), 'Full critical build remains mandatory');
assert(!/continue-on-error:|paths-ignore:/.test(workflow), 'No ignored failures or event path bypass');
for(const pack of ['build','hr-react','hr-db','company-db','app-browser','projects-support','bolig-db','bolig-browser']) {
  const block=workflow.split(`\n  ${pack}:\n`)[1]?.split(/\n  [\w-]+:\n/)[0];
  assert(block?.includes('needs: plan') && block.includes("if: needs.plan.outputs.full == 'true'"), `${pack}: exact fail-closed plan`);
  assert(block.includes('uses: ./.github/actions/core-safety-setup'), `${pack}: pinned setup`);
}
assert(workflow.includes('if: ${{ always() }}') && workflow.includes('run: node scripts/qa-gate.mjs'), 'Stable required final gate');
for(const pack of ['app-browser','bolig-db']) {
  const block=workflow.split(`\n  ${pack}:\n`)[1]?.split(/\n  [\w-]+:\n/)[0];
  assert(block.includes("pdf: 'true'"), `${pack}: independent PDF prerequisites`);
}
assert(setup.includes('poppler-utils'), 'PDF tools installed for each PDF pack');
assert(setup.includes('npm ci --prefix scripts/qa') && setup.includes('playwright/cli.js install --with-deps chromium'));
const qa=JSON.parse(fs.readFileSync('scripts/qa/package.json','utf8'));
assert.deepEqual(qa.dependencies, {'@electric-sql/pglite':'0.5.8',jsdom:'26.1.0',jspdf:'2.5.1',playwright:'1.58.2'});
console.log(`Core safety workflow: PASS (${baseline.commands.length} original direct invocations/variants + unchanged npm build)`);

// The PR311 comparison is valid only at its frozen historical main. A reused
// branch name on current main must run ordinary QA against its actual PR base.
const frozenCondition='if [ "$QA_BASE_REF" = origin/main ] && [ "$QA_HEAD_REF" = fase45b-whole-app-qa-20261104 ] && [ "$(git rev-parse "$QA_BASE_REF")" = 34daef4c0526b93ddbd84c3bfd97fb0833d97caf ]; then';
assert.equal(workflow.split(frozenCondition).length-1,2,'Both legacy Bolig comparisons are pinned to the frozen main');
