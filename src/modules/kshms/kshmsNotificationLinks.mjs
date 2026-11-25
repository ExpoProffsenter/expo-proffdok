const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const targets={kshmsExecution:'execution',kshmsSja:'sja',kshmsVersion:'reading',kshmsReview:'review'};
// IDs select an authorized read; the URL never supplies kind, project or content.
export function readNotificationLink(search,companyId) {
 const params=new URLSearchParams(search),company=params.get('kshmsCompany');
 const keys=Object.keys(targets).filter(key=>params.has(key));
 if(keys.length!==1||params.has('kshmsDeviation')||params.getAll('kshmsCompany').length!==1||!uuid.test(company||''))return null;
 const key=keys[0],id=params.get(key);
 if(params.getAll(key).length!==1||!uuid.test(id||'')||key==='kshmsReview'&&id.toLowerCase()!==company.toLowerCase())return null;
 return {id:id.toLowerCase(),kind:targets[key],companyId:company.toLowerCase(),matchingCompany:company.toLowerCase()===companyId?.toLowerCase()};
}
