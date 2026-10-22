import {spawnSync} from 'node:child_process';
// Same existing module scenarios, after their actual migration definitions are
// changed to the HTTP-409 contract. Original CI runs historical mode as well.
const suites=['company-admin-db-check.mjs','company-display-name-db-check.mjs','hr-conversations-db-check.mjs','hr-sick-leave-db-check.mjs','time-registration-db-check.mjs','stocktake-db-check.mjs','project-progress-db-check.mjs','kshms-progress-db-check.mjs','support-db-check.mjs','customer-option-quantity-db-check.mjs','organization-local-sql-check.mjs','kshms-publication-db-check.mjs','kshms-bulk-db-check.mjs','flexible-checklist-fields-db-check.mjs','kshms-primary-ack-db-check.mjs','kshms-auto-assignment-db-check.mjs'];
for(const file of suites){
 const r=spawnSync(process.execPath,['--import','./scripts/qa/install-rpc-conflict-policy.mjs','scripts/'+file],{env:{...process.env,QA_RPC_CONFLICT_POLICY:'1',ORG_GROUP_QA:'1',ORG_PGLITE_PATH:process.env.HR_PGLITE_PATH},encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});
 if(r.status!==0){process.stderr.write(r.stdout||'');process.stderr.write(r.stderr||'');throw r.error||Error(file+' failed with '+r.status);}
 console.log('PASS HTTP409 module regression: '+file);
}
console.log('PASS HTTP409 regression: all '+suites.length+' existing PostgreSQL module suites, same assertions and permissions, updated error contract.');
