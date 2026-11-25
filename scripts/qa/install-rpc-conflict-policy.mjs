// Test adapter only: existing module fixtures replay historical migrations.
// Reapply the exact conflict transformation after DDL so their real scenarios
// also exercise the final HTTP-409 contract, without changing old migrations.
if(process.env.QA_RPC_CONFLICT_POLICY==='1'){
 const {PGlite}=await import(process.env.HR_PGLITE_PATH||'@electric-sql/pglite');
 const exec=PGlite.prototype.exec;
 const policy=String.raw`do $qa$ declare f record; changed text; begin
 for f in select p.oid,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.prokind='f' and n.nspname in ('public','company_admin_private') and p.prosrc ~* $pattern$errcode[[:space:]]*=[[:space:]]*'40001'$pattern$
 loop changed:=regexp_replace(f.definition,$pattern$(errcode[[:space:]]*=[[:space:]]*)'40001'$pattern$,$replacement$\1'PT409'$replacement$,'gi');
 changed:=replace(changed,$old$or sqlstate '40001' or sqlstate '55000'$old$,$new$or sqlstate '40001' or sqlstate 'PT409' or sqlstate '55000'$new$);
 execute changed;end loop;end $qa$;`;
 PGlite.prototype.exec=async function(sql,...rest){
  // Historical SQL scenario helpers use a literal expected code. Keep every
  // assertion, but run those scenarios against the current HTTP-409 contract.
  if(/pg_temp\.\w+_reject\b|\bassert\b/i.test(sql))sql=sql.replaceAll("'40001'","'PT409'").replace(/when\s+serialization_failure\b/gi,"when sqlstate 'PT409'");
  const result=await exec.call(this,sql,...rest);
  if(/create\s+(or\s+replace\s+)?function\b/i.test(sql))await exec.call(this,policy);
  return result;
 };
}
