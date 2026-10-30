import {createClient} from 'npm:@supabase/supabase-js@2.45.0';
import {jsPDF} from 'npm:jspdf@2.5.1';
import {handleStandaloneChecklistEmail} from '../_shared/standalone-checklist-email.mjs';
const env=(name:string)=>Deno.env.get(name)||'';
const options={auth:{persistSession:false,autoRefreshToken:false}};
async function loadLogo(raw:string){
 const url=new URL(raw,'https://expo-proffdok.app');
 if(url.protocol!=='https:'||url.username||url.password||![new URL(env('SUPABASE_URL')).hostname,'expo-proffdok.app'].includes(url.hostname))return null;
 const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(7000)});
 if(!r.ok||!/^image\/(png|jpeg|webp)/.test(r.headers.get('content-type')||'')||Number(r.headers.get('content-length'))>1000000)return null;
 const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>1000000)return null;
 let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return `data:${r.headers.get('content-type')!.split(';')[0]};base64,${btoa(binary)}`;
}
Deno.serve(req=>handleStandaloneChecklistEmail(req,{env,fetch,JsPDF:jsPDF,loadLogo,
 userClient:(authorization:string)=>createClient(env('SUPABASE_URL'),env('SUPABASE_ANON_KEY'),{...options,global:{headers:{Authorization:authorization}}}),
 adminClient:()=>createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),options)}));
