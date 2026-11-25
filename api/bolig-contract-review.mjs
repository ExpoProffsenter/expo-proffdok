import {createClient} from '@supabase/supabase-js';
import {generateText,Output,jsonSchema} from 'ai';
import {createContractReviewHandler,contractReviewSystem,contractReviewSchema} from '../supabase/functions/_shared/bolig-contract-review.mjs';
import {resolveBackendTarget,BACKEND_TARGET_SANDBOX} from '../scripts/environmentBindingCore.mjs';
export const maxDuration=180;
// Same explicit deployment binding as Vite; never accept a URL/key from a caller.
const sandbox=resolveBackendTarget({vercelEnv:process.env.VERCEL_ENV,gitRef:process.env.VERCEL_GIT_COMMIT_REF,explicitTarget:process.env.EXPO_BACKEND_TARGET})===BACKEND_TARGET_SANDBOX;
const url=sandbox?'https://ppvircenkjizeiqdxphj.supabase.co':'https://dqffxflaoyarbxyiyhop.supabase.co';
const key=sandbox?'sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR':process.env.VITE_SUPABASE_ANON_KEY;
const handler=createContractReviewHandler({
 onProviderError:details=>console.error('bolig_contract_provider_failure',JSON.stringify(details)),
 authenticate:async authorization=>{
  if(!/^Bearer \S+$/.test(authorization)||!key)return null;
  const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser();if(error||!data.user)return null;
  return {rpc:async(company,root,action,payload)=>{
   const result=await client.rpc('bolig_contract_review',{p_company_id:company,p_root_id:root,p_action:action,p_payload:payload});
   if(result.error)throw Object.assign(Error(result.error.message),{code:result.error.code});
   if(result.data?.context?.user_id!==data.user.id||result.data?.context?.company_id!==company||!result.data?.context?.enabled||result.data?.root_id!==root)throw Object.assign(Error('Kontraktstilgangen er endret.'),{code:'42501'});
   return result.data;
  }};
 },
 generate:async input=>{
  const {output}=await generateText({model:'openai/gpt-5.4-mini',system:contractReviewSystem,prompt:JSON.stringify(input),
   output:Output.object({schema:jsonSchema(contractReviewSchema)}),reasoning:'low',maxOutputTokens:6000,maxRetries:0,abortSignal:AbortSignal.timeout(120000),
   providerOptions:{gateway:{zeroDataRetention:true}}});return output;
 }
});
export default async function(req,res){
 const headers=new Headers();for(const [name,value] of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(','):value);
 const request=new Request('https://app.invalid/api/bolig-contract-review',{method:req.method,headers,...(req.method==='POST'?{body:typeof req.body==='string'?req.body:JSON.stringify(req.body??{})}:{})});
 const response=await handler(request);res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());
}
