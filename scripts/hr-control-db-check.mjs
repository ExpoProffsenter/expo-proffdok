// Actual PostgreSQL/PGlite; only platform roles are declared synthetically.
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.HR_PGLITE_PATH?pathToFileURL(process.env.HR_PGLITE_PATH).href:'@electric-sql/pglite');
const db=await PGlite.create();
try {
 await db.exec('create role anon; create role authenticated; create role service_role; grant usage on schema public to anon,authenticated,service_role;');
 await db.exec(await fs.readFile('ops/hr-control/supabase/migrations/20261010203756_hr_control_checkpoint.sql','utf8'));
 const results=await db.exec(await fs.readFile('ops/hr-control/check.sql','utf8'));
 const report=results.find(r=>r.rows[0]?.assertions);
 assert(report && report.rows[0].assertions>=35);
 assert.equal((await db.query('select count(*)::int as n from hr_control.checkpoints')).rows[0].n,0);
 console.log(`HR control DB PASS: ${report.rows[0].assertions} PostgreSQL assertions; fixture rollback empty. No cloud/restore claim.`);
} finally {await db.close();}
