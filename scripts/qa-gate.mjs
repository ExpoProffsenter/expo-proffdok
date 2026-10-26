import assert from 'node:assert/strict';
export const packs = ['build', 'hr-react', 'hr-db', 'company-db', 'app-browser', 'projects-support', 'bolig-db', 'bolig-browser'];
export function requireGreen(results) {
  assert.equal(results.plan?.result, 'success', 'Scope/plan failed or cancelled');
  assert(['true', 'false'].includes(results.plan.outputs.full), 'Missing test plan');
  assert.deepEqual(Object.keys(results).sort(), ['plan', ...packs].sort(), 'Missing or unknown pack');
  const expected = results.plan.outputs.full === 'true' ? 'success' : 'skipped';
  for (const pack of packs) assert.equal(results[pack]?.result, expected, `${pack} must be ${expected}`);
}
if (process.argv.includes('--self-test')) {
  const make = full => Object.fromEntries([['plan', {result:'success', outputs:{full:String(full)}}], ...packs.map(p => [p, {result:full?'success':'skipped'}])]);
  requireGreen(make(true)); requireGreen(make(false));
  for (const pack of ['plan', ...packs]) for (const state of ['failure', 'cancelled', 'skipped']) {
    const r = make(true); r[pack].result=state;
    assert.throws(() => requireGreen(r));
  }
  const missing=make(true); delete missing.build; assert.throws(()=>requireGreen(missing));
  const unplanned=make(false); unplanned.build.result='failure'; assert.throws(()=>requireGreen(unplanned));
  const bad=make(true); bad.plan.outputs.full=''; assert.throws(()=>requireGreen(bad));
  console.log('QA final gate: PASS (failure/cancellation/skipped/missing packs cannot pass)');
} else {
  requireGreen(JSON.parse(process.env.RESULTS));
  console.log('Selected critical checks passed');
}
