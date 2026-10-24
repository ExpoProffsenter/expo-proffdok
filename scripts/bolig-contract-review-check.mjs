import assert from 'node:assert/strict';
import {randomUUID as uuid} from 'node:crypto';
import {contractPlatform} from './fixtures/bolig-contract-platform.mjs';
import {createContractReviewHandler,validateContractReview,contractReviewSystem} from '../supabase/functions/_shared/bolig-contract-review.mjs';
const p=await contractPlatform();let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const deny=async(fn,code)=>{await assert.rejects(fn,e=>!code||e.code===code);checks++;};
const rpc=(action,payload={},user=p.owner)=>p.review(user,p.company,p.root.id,action,payload);
const page=(text,number=1,method='pdf',confidence=null)=>({number,text,method,confidence});
const doc=uuid(),fid=uuid(),tid=uuid();
const quote='Endringer skal varsles skriftlig før arbeidet starter.';
const pages=[page('Leveransen omfatter komplett røranlegg. '+quote),page('Betalingsfrist er 30 dager etter mottatt faktura.',2)];
let request;
async function file(id,revision){
 const v={id,document_id:doc,revision,title:'QA privat avtale',kind:'contract',name:'qa-avtale.pdf',mime:'application/pdf',size:100,sha256:'a'.repeat(64),comment:''};
 const prepared=await p.rpc(p.owner,p.company,p.root.id,'prepare',v);
 await p.system("insert into storage.objects values('bolig-contracts',$1,$2)",[prepared.path,{size:100,mimetype:v.mime}]);
 return p.rpc(p.owner,p.company,p.root.id,'finish',{id});
}
try{
 await file(fid,0);
 await deny(()=>rpc('get',{},p.admin),'42501');await deny(()=>rpc('get',{},p.reader),'42501');
 await p.rpc(p.owner,p.company,p.root.id,'grant',{user_id:p.reader,role:'reader',revision:0});
 eq((await rpc('get',{},p.reader)).data,{texts:[],reviews:[]},'explicit reader can read empty private workspace');
 for(const bad of [[],[page('x',2)],[page('x',1,'ocr',null)],[page('x',1,'ocr',101)],[page('x',1,'pdf',90)],[{...page('x'),extra:'value'}],[page('x'.repeat(50001))],[page('abc\u0001')]])await deny(()=>rpc('save_text',{id:uuid(),file_id:fid,pages:bad}),'22023');
 await deny(()=>rpc('save_text',{id:uuid(),file_id:fid,pages},p.reader),'42501');
 await deny(()=>rpc('save_text',{id:uuid(),file_id:uuid(),pages}),'42501');
 const saved=(await rpc('save_text',{id:tid,file_id:fid,pages})).data;
 eq(saved.pages,pages,'immutable page text retains original page numbers');
 eq((await rpc('save_text',{id:tid,file_id:fid,pages})).data.id,tid,'exact retry is idempotent');
 await deny(()=>rpc('save_text',{id:tid,file_id:fid,pages:[page('Different text')]}),'PT409');
 eq((await rpc('text',{id:tid},p.reader)).data.pages,pages,'reader can read same private text');
 eq((await rpc('get')).data.texts[0].uncertain_pages,0);
 eq((await rpc('search',{query:'SKRIFTLIG'},p.reader)).data.matches[0].page,1,'case-insensitive private search');
 eq((await rpc('search',{query:'30 dager'},p.reader)).data.matches[0].page,2,'search cites correct PDF page');
 eq((await rpc('search',{query:'%%'},p.reader)).data.matches,[],'literal search, no SQL wildcard expansion');
 await deny(()=>rpc('search',{query:'x'}),'22023');
 const job=uuid(),base={id:job,text_ids:[tid],question:'Hva står det om varsling?'};
 await deny(()=>rpc('begin',base,p.reader),'42501');
 await deny(()=>rpc('begin',{...base,text_ids:[tid,tid]}),'22023');
 await deny(()=>rpc('begin',{...base,text_ids:[uuid()]}),'42501');
 const started=(await rpc('begin',base)).data;eq(started.sources[0].file.version,1);eq(started.sources[0].pages,pages);
 await deny(()=>rpc('begin',base),'PT409');
 await deny(()=>rpc('begin',{...base,id:uuid()}),'PT429');
 const result={findings:[{kind:'requirement',topic:'notification',title:'Skriftlig varsel',explanation:'Den valgte teksten sier at endringer skal varsles før arbeidet starter.',sources:[{text_id:tid,page:1,quote}]}],not_found:['Dagmulkt kan ikke fastslås i valgt tekstgrunnlag.'],limitations:['Bare valgte dokumentversjoner er gjennomgått.']};
 for(const bad of [
  {...result,findings:[{...result.findings[0],sources:[]}]},
  {...result,findings:[{...result.findings[0],sources:[{text_id:tid,page:2,quote}]}]},
  {...result,findings:[{...result.findings[0],sources:[{text_id:uuid(),page:1,quote}]}]},
  {...result,findings:[{...result.findings[0],sources:[{text_id:tid,page:1,quote:'Invented contract condition'}]}]},
  {...result,not_found:[{claim:'bad'}]}, {...result,accepted:true}
 ])await deny(()=>rpc('finish',{id:job,result:bad}),'22023');
 eq(validateContractReview(result,started.sources),result,'model proposal has verified verbatim citations');
 assert.throws(()=>validateContractReview({...result,findings:[{...result.findings[0],sources:[{text_id:tid,page:2,quote}]}]},started.sources));checks++;
 const ready=(await rpc('finish',{id:job,result})).data;eq(ready.state,'ready');eq(ready.sources[0].file.id,fid);
 eq((await rpc('begin',base)).data.state,'ready','receipt retry reuses stored result without new generation');
 eq((await rpc('review',{id:job},p.reader)).data.result,result,'reader sees immutable cited proposal');
 await deny(()=>rpc('finish',{id:job,result:{...result,not_found:[]}}),'PT409');
 const newFile=uuid();await file(newFile,1);eq((await rpc('search',{query:'skriftlig'})).data.matches,[],'old version does not masquerade as current search result');
 eq((await rpc('review',{id:job})).data.sources[0].file.version,1,'historical report keeps old source version');
 await rpc('save_text',{id:uuid(),file_id:newFile,pages:[page('Ny leveranse må avklares. Avtalte endringer dokumenteres.',1,'ocr',62)]});
 eq((await rpc('get')).data.texts.find(t=>t.file_id===newFile).uncertain_pages,1,'low OCR confidence is visible');
 let generations=0;
 await p.system("update bolig_private.contract_reviews set created_at=now()-interval '1 minute'");
 const origin='https://qa.invalid',allowedOrigins=new Set([origin]);
 const handler=createContractReviewHandler({allowedOrigins,authenticate:async token=>token==='Bearer qa'?{rpc:(c,r,a,v)=>p.review(p.owner,c,r,a,v)}:null,generate:async input=>{generations++;eq(input.sources[0].id,tid,'model only receives server-loaded immutable text');return result;}});
 const http=(body,authorization='Bearer qa',extra={})=>handler(new Request(origin+'/api',{method:'POST',headers:{origin,authorization,'content-type':'application/json',...extra},body:JSON.stringify(body)}));
 const input={company_id:p.company,root_id:p.root.id,id:uuid(),text_ids:[tid],question:''};
 eq((await http(input,'')).status,401,'auth precedes body and model');eq(generations,0);
 eq((await http({...input,text:'caller-forged source'})).status,400,'caller cannot send alternative text to model');
 const response=await http(input);eq(response.status,200);eq(response.headers.get('cache-control').includes('no-store'),true);eq(generations,1);
 eq((await http(input)).status,200);eq(generations,1,'exact retry does not spend another generation');
 await p.system("update bolig_private.contract_reviews set created_at=now()-interval '1 minute'");
 const revoked=createContractReviewHandler({allowedOrigins,authenticate:async()=>({rpc:(c,r,a,v)=>p.review(p.owner,c,r,a,v)}),generate:async()=>{await p.system('update public.profiles set deactivated=true where id=$1',[p.owner]);return result;}});
 request=new Request(origin+'/api',{method:'POST',headers:{origin,authorization:'Bearer qa','content-type':'application/json'},body:JSON.stringify({...input,id:uuid()})});
 const blocked=await revoked(request);eq(blocked.status,403,'revocation while provider runs prevents result save and return');eq((await blocked.text()).includes(quote),false,'denial leaks no source or model content');
 await p.system('update public.profiles set deactivated=false where id=$1',[p.owner]);
 await p.rpc(p.owner,p.company,p.root.id,'grant',{user_id:p.reader,role:'none',revision:1});
 await deny(()=>rpc('review',{id:job},p.reader),'42501');await deny(()=>rpc('text',{id:tid},p.reader),'42501');await deny(()=>rpc('search',{query:'skriftlig'},p.reader),'42501');
 await p.system("update bolig_private.contract_reviews set created_at=now()-interval '2 minutes'");
 await p.system("insert into bolig_private.contract_reviews(id,root_id,text_ids,state,created_by,created_at) select gen_random_uuid(),$1,array[$2::uuid],'failed',$3,now()-interval '2 minutes'-n*interval '31 seconds' from generate_series(1,20)n",[p.root.id,tid,p.owner]);
 await assert.rejects(()=>rpc('begin',{id:uuid(),text_ids:[tid],question:''}),e=>e.code==='PT429'&&/Dagens grense/.test(e.message));checks++;
 await p.system('update bolig_private.roots set archived=true where id=$1',[p.root.id]);
 eq((await rpc('review',{id:job})).data.state,'ready','archived project keeps private read history');await deny(()=>rpc('save_text',{id:uuid(),file_id:newFile,pages}),'42501');
 await p.system('set role authenticated');await deny(()=>p.db.query('select * from bolig_private.contract_texts'),'42501');await deny(()=>p.db.query('select * from bolig_private.contract_reviews'),'42501');
 await p.system('set role anon');await deny(()=>p.db.query('select public.bolig_contract_review($1,$2)',[p.company,p.root.id]),'42501');
 assert.match(contractReviewSystem,/ingen verktøy/i);assert.match(contractReviewSystem,/ikke.*NS-standardtekst/i);checks+=2;
 console.log(`Private contract review: ${checks} assertions PASS; actual SQL, ACL, immutable source versions, literal search, citation validation, budget/retry gates and HTTP handler. Model output is synthetic.`);
}finally{await p.db.close();}
