// Offline export of an authorized, freshly read-back synthetic Demo SJA.
// Does not authenticate users or change database state.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {downloadSjaPdf} from '../../src/modules/report/kshmsSjaPdf.mjs';
const input=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
const {detail,company_profile:profile}=input;
assert.equal(detail.sja.status,'draft');
assert(detail.sja.content.title.startsWith('DEMO – '));
assert.equal(detail.context.company_id,profile.companyId);
const pdf=await import(process.env.COURSE_JSPDF_PATH||'/tmp/kshms-course-pdf-runtime/node_modules/jspdf/dist/jspdf.node.min.js');
const Base=pdf.jsPDF||pdf.default.jsPDF;
let bytes;
function ExportPdf(options){const doc=new Base(options);doc.save=()=>{bytes=Buffer.from(doc.output('arraybuffer'));};return doc;}
await downloadSjaPdf({expected:detail.sja,companyId:detail.context.company_id,userId:detail.context.user_id,projectId:detail.sja.project_id,
 rpc:async name=>name==='kshms_sja_detail'?detail:name==='work_profile_company_profile'?profile:Promise.reject(Error('Unexpected RPC')),
 loadPdf:async()=>({jsPDF:ExportPdf}),loadLogo:async()=>null});
assert(bytes?.length>1000);
await fs.writeFile('public/demo-documents/DEMO-kurs-SJA.pdf',bytes);
console.log('Fresh saved Demo SJA exported through the app PDF formatter; visual review required.');
