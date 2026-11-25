// Presentation filter only. Database RLS remains the access boundary.
// A current company UUID wins over renamed/historical document labels.
export function companyProjectMatches(row={},companyId='',legacyName=''){
 const scope=String(row.company_scope_id||'').trim();
 if(scope&&companyId)return scope===String(companyId).trim();
 const label=String(row.company_name||row.data?.company?.companyName||row.data?.company?.company_name||row.data?.companyName||'').trim().toLowerCase();
 return Boolean(legacyName&&label===String(legacyName).trim().toLowerCase());
}
