import assert from 'node:assert/strict';import fs from 'node:fs';
const inventory=JSON.parse(fs.readFileSync('docs/qa/proffdok-journey-review-20261029.json','utf8'));
const videos=JSON.parse(fs.readFileSync('docs/qa/proffdok-video-coverage-20261031.json','utf8'));
const ids=new Set(),media=new Set();
assert.equal(videos.template_id,'PROFFDOK-VIDEO-1.0');assert.equal(videos.all_functions_required,true);assert.equal(videos.design_and_video_status_separate,true);
for(const e of videos.entries){assert.ok(e.function_id&&e.video_id&&e.title&&e.module);assert.equal(ids.has(e.function_id),false,'duplicate function '+e.function_id);assert.equal(media.has(e.video_id),false,'duplicate video '+e.video_id);ids.add(e.function_id);media.add(e.video_id);assert.equal(e.template_id,videos.template_id);assert.ok(Array.isArray(e.scope_steps));if(['produsert-og-kontrollert','mal-og-pilot-godkjent'].includes(e.status)){assert.ok(e.file&&e.source_commit&&e.checked_on&&e.chapter,'completed media requires source and result '+e.video_id);}if(e.coverage_level==='avgrenset-oppgave')assert.notEqual(e.full_journey_attested,true,'scoped clip cannot attest whole journey');}
for(const j of inventory.journeys)assert.ok(ids.has(j.id),'missing registered journey '+j.id);
for(const id of ['CHECKLIST-EMPLOYEE-POINTS','CHECKLIST-TEMPLATE-SUBMIT','CHECKLIST-TEMPLATE-REVIEW'])assert.ok(ids.has(id),'missing newer checklist function '+id);
const known=new Set(inventory.journeys.map(j=>j.domain));for(const d of known)assert.ok(videos.entries.some(e=>e.module===d),'missing module '+d);
assert.ok(videos.entry_points.length>=3);assert.equal(videos.inventory_complete,false,'source inventory is still explicitly incomplete');
console.log('Video coverage registry PASS: '+inventory.journeys.length+' journeys/'+known.size+' domains,3 newer checklist functions,unique media IDs,approved template and scoped-completion boundaries.');
