import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Transaction rollback codes belong to PostgreSQL itself. Expected business
// conflicts must return PT409, never ask PostgREST to replay the transaction.
const reservedNames=new Set(['transaction_rollback','serialization_failure','transaction_integrity_constraint_violation','statement_completion_unknown','deadlock_detected']);
function tokens(sql){
 const out=[];let i=0;
 while(i<sql.length){
  if(/\s/.test(sql[i])){i++;continue;}
  if(sql.startsWith('--',i)){i=sql.indexOf('\n',i);if(i<0)break;continue;}
  if(sql.startsWith('/*',i)){let depth=1;i+=2;while(i<sql.length&&depth){if(sql.startsWith('/*',i)){depth++;i+=2;}else if(sql.startsWith('*/',i)){depth--;i+=2;}else i++;}continue;}
  const start=i;
  if(sql[i]==="'"){
   let value='';i++;while(i<sql.length){if(sql[i]==="'"&&sql[i+1]==="'"){value+="'";i+=2;}else if(sql[i]==="'"){i++;break;}else value+=sql[i++];}out.push({kind:'string',value,start});continue;
  }
  const dollar=sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/);
  if(dollar){i+=dollar[0].length;continue;}
  const word=sql.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
  if(word){i+=word[0].length;out.push({kind:'word',value:word[0].toLowerCase(),start});continue;}
  out.push({kind:'symbol',value:sql[i++],start});
 }
 return out;
}
export function findRetryableRaises(sql){
 const ts=tokens(sql),found=[];
 const reserved=t=>t&&(reservedNames.has(t.value.toLowerCase())||/^40[0-9A-Z]{3}$/i.test(t.value));
 for(let i=0;i<ts.length;i++){
  const t=ts[i];
  // SQL assembled as a literal must not hide a retryable RAISE either.
  if(t.kind==='string'&&/\braise\b/i.test(t.value))for(const nested of findRetryableRaises(t.value))found.push({offset:t.start,code:nested.code});
  if(t.kind!=='word'||t.value!=='raise')continue;
  if(reserved(ts[i+1]))found.push({offset:t.start,code:ts[i+1].value});
  for(let j=i+1;j<ts.length&&ts[j].value!==';';j++){
   if(ts[j].kind==='word'&&ts[j].value==='sqlstate'&&reserved(ts[j+1]))found.push({offset:t.start,code:ts[j+1].value});
   if(ts[j].kind==='word'&&ts[j].value==='errcode'&&ts[j+1]?.value==='='&&reserved(ts[j+2]))found.push({offset:t.start,code:ts[j+2].value});
  }
 }
 return found;
}
function selfTest(){
 const bad=["raise exception 'stale' using errcode='40001';","RAISE EXCEPTION USING MESSAGE='stale', ERRCODE = '40P01';","raise sqlstate '40001' using message='stale';","raise serialization_failure;","raise exception using errcode='serialization_failure';","do $$begin raise exception 'semi; colon' using errcode='40001';end$$;","do $body$begin raise exception using /*nested /* c */ comment */ errcode='40000';end$body$;","execute 'raise exception ''stale'' using errcode=''40001'';';"];
 const good=["raise exception 'stale' using errcode='PT409';","raise exception '40001 is reserved';","raise;","-- raise exception using errcode='40001';\nselect 1;","/* raise sqlstate '40P01'; */ select 1;","exception when sqlstate '40001' then raise;","return '40001';"];
 for(const sql of bad)assert(findRetryableRaises(sql).length>0,sql);
 for(const sql of good)assert.equal(findRetryableRaises(sql).length,0,sql);
 console.log('PASS RPC error-code guard: retryable codes/names, SQLSTATE syntax, nested comments, dollar bodies and dynamic SQL; safe exceptions and genuine rethrows retained.');
}
function scan(){
 const legacy=JSON.parse(fs.readFileSync('scripts/fixtures/rpc-retry-legacy-migrations.json','utf8'));
 const files=[];const walk=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory()&&item.name!=='.temp')walk(p);else if(item.isFile()&&p.endsWith('.sql'))files.push(p);}};walk('supabase');
 const errors=[];
 for(const file of files){const sql=fs.readFileSync(file,'utf8'),raises=findRetryableRaises(sql);if(!raises.length)continue;
  const hash=createHash('sha256').update(sql).digest('hex');
  if(legacy[file]===hash)continue;
  errors.push(...raises.map(r=>`${file}:${sql.slice(0,r.offset).split('\n').length}: manually raised ${r.code}; use PT409 for a business conflict`));
 }
 if(errors.length)throw Error('RPC retry guard blocked publication:\n'+errors.join('\n'));
 console.log(`PASS RPC retry guard: ${files.length} SQL files; only frozen historical migrations may contain manually raised transaction-rollback codes.`);
}
if(process.argv.includes('--self-test'))selfTest();
else if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname))scan();
