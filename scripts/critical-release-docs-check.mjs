import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const recordPath = file => /^docs\/changes\/[\w-]+\.json$/.test(file);
const isHelp = file => file.startsWith('src/modules/help/');
const documentation = {
  help: {label:'Hjelp ved endret brukerflyt/knapp', matches:isHelp},
  architecture: {label:'Arkitektur ved endret dataflyt/ansvar', matches:file=>file.startsWith('docs/architecture/')},
  setup: {label:'README ved endret oppsett/bruk', matches:file=>file==='README.md'},
  module: {label:'Moduldokumentasjon ved endret modulkontrakt', matches:file=>/^src\/modules\/.+\/README\.md$/.test(file)},
};
const productionImpacting = file => {
  if (/\.md$/.test(file) || isHelp(file) || file.startsWith('docs/')) return false;
  return /^(src\/|supabase\/|api\/|public\/)/.test(file) ||
    /\.(html)$/.test(file) || /^(package(-lock)?\.json|vite\.config\.[\w]+|vercel\.json)$/.test(file);
};

export function evaluateReleaseDocumentation(files=[], readFile=file=>fs.readFileSync(file,'utf8')) {
  const changed=[...new Set(files)];
  const records=changed.filter(recordPath).filter(file=>{
    try { readFile(file); return true; } catch(error) {
      if(error.code==='ENOENT') return false; // A removed record cannot satisfy a runtime change.
      throw error;
    }
  });
  if (!records.length) return changed.some(productionImpacting) ? ['docs/changes/<endring>.json (ett varig endrings- og testgrunnlag)'] : [];
  const missing=[];
  for(const file of records) {
    let record;
    try { record=JSON.parse(readFile(file)); } catch { missing.push(`${file}: ugyldig JSON`); continue; }
    if(record.version!==1 || ![record.title,record.change,record.verification].every(v=>typeof v==='string'&&v.trim().length>=12)) {
      missing.push(`${file}: version 1, title, change og verification må beskrive faktisk endring/test`);
    }
    for(const [key,rule] of Object.entries(documentation)) {
      const decision=record.documentation?.[key];
      if(typeof decision?.required!=='boolean' || typeof decision.reason!=='string' || decision.reason.trim().length<12) {
        missing.push(`${file}: dokumentasjonsvalg ${key} må ha required og konkret reason`);
      } else if(decision.required && !changed.some(rule.matches)) {
        missing.push(rule.label);
      }
    }
  }
  return missing;
}

function selfTest() {
  const record={version:1,title:'Avgrenset feilretting',change:'Retter feil i eksisterende visning.',verification:'Gjenskapt feil og kontrollert regresjon.',documentation:Object.fromEntries(Object.keys(documentation).map(key=>[key,{required:false,reason:'Eksisterende kontrakt og arbeidsflyt beholdes.'}]))};
  const path='docs/changes/test.json';
  const evaluate=(files,r=record)=>evaluateReleaseDocumentation(files,()=>JSON.stringify(r));
  assert.deepEqual(evaluate(['docs/qa/note.md']),[]);
  for(const file of ['src/modules/sales/example.js','api/check.mjs','public/client.js','supabase/migrations/example.sql','sales-preview.html','package-lock.json']) {
    assert(evaluate([file]).length, `${file} requires one change record`);
    assert.deepEqual(evaluate([file,path]),[], `${file}: no automatic four-file documentation churn`);
  }
  for(const [key,rule] of Object.entries(documentation)) {
    const changed=structuredClone(record); changed.documentation[key].required=true;
    assert(evaluate(['src/example.js',path],changed).includes(rule.label));
    const target={help:'src/modules/help/guide.js',architecture:'docs/architecture/map.md',setup:'README.md',module:'src/modules/sales/README.md'}[key];
    assert.deepEqual(evaluate(['src/example.js',path,target],changed),[]);
  }
  const bad=structuredClone(record); delete bad.documentation.help;
  assert(evaluate([path],bad).length);
  assert(evaluateReleaseDocumentation([path],()=>'{').length);
  assert(evaluateReleaseDocumentation(['src/example.js',path],()=>{throw Object.assign(new Error('removed'),{code:'ENOENT'});}).length);
  assert.throws(()=>evaluateReleaseDocumentation([path],()=>{throw new Error('I/O failed');}));
  console.log('✅ Release documentation: PASS (one record; relevant docs; invalid/missing/deleted records rejected)');
}

if(import.meta.url===pathToFileURL(process.argv[1]).href) {
  if(process.argv.includes('--self-test')) selfTest();
  else {
    const base=process.argv[2] || (process.env.GITHUB_BASE_REF?`origin/${process.env.GITHUB_BASE_REF}`:'origin/main');
    const files=execFileSync('git',['diff','--name-only','--no-renames',`${base}...HEAD`],{encoding:'utf8'}).split('\n').filter(Boolean);
    const missing=evaluateReleaseDocumentation(files);
    if(missing.length) {
      console.error('❌ Release documentation: '+missing.join('\n- '));
      process.exitCode=1;
    } else console.log('✅ Release documentation OK');
  }
}
