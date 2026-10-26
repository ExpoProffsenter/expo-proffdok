import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Only known prose locations are cheap. Code, policies, evidence, templates,
// configuration, workflows, dependencies and unknown paths always run everything.
export function documentationOnly(files) {
  return files.length > 0 && files.every(file =>
    ['README.md', 'CURRENT_RELEASE_STATUS.md'].includes(file) ||
    /^docs\/(?!qa\/evidence\/).+\.md$/.test(file) ||
    /^src\/modules\/[\w/-]+\/README\.md$/.test(file) ||
    /^docs\/changes\/[\w-]+\.json$/.test(file));
}
if (process.argv.includes('--self-test')) {
  assert(documentationOnly(['README.md', 'docs/changes/example.json']));
  assert(documentationOnly(['docs/qa/check.md', 'src/modules/sales/README.md']));
  for (const file of ['AGENTS.md', 'PROJECT_GUARDRAILS.md', '.github/workflows/pr-core-safety.yml',
    'docs/qa/evidence/baseline.md', 'docs/qa/evidence/baseline.json', 'src/modules/help/help.js',
    'supabase/functions/mail/template.md', 'scripts/fixtures/readme.md', 'unknown.md',
    'src/main.jsx', 'package-lock.json', 'scripts/qa-plan.mjs']) {
    assert(!documentationOnly(['README.md', file]), `${file} must run full suite`);
  }
  assert(!documentationOnly([]));
  console.log('QA plan: PASS (unknown/mixed/policy changes default to full coverage)');
} else {
  const base = process.argv[2] || 'origin/main';
  // A missing base or failed diff throws, so the final gate cannot turn green.
  const files = execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...HEAD`], {encoding:'utf8'})
    .split('\n').filter(Boolean);
  console.log(`full=${!documentationOnly(files)}`);
}
