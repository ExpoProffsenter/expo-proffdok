import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
export async function collaborationRpc(name,args,userId){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const req=client.rpc(name,args),{data,error}=await(typeof req.retry==='function'?req.retry(false):req);
 if(error)throw Object.assign(Error(error.message),{code:error.code});
 if((data?.user_id||data?.context?.user_id)!==userId)throw Object.assign(Error('Brukeren er endret.'),{code:'42501'});
 return data;
}
