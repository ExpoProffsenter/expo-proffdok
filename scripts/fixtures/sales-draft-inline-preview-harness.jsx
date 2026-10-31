import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { registerAppSupabaseClient } from "../../src/modules/access/appSupabaseClientRegistry.js";
import Detail from "../../src/modules/sales/components/SalesDetailView.jsx";
import "../../src/modules/sales/sales.css";
import "../../src/style.css";
import "../../src/modules/app/mobileResponsive41A.css";
import "../../src/modules/ui/proffdokWorkspace.css";

const user = { id: "00000000-0000-4000-8000-000000000001", email: "qa@example.invalid" };
const token = [btoa('{"alg":"HS256"}'), btoa(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })), "c3ludGhldGlj"].map(x=>x.replaceAll("=","").replaceAll("+","-").replaceAll("/","_")).join(".");
window.qa = { calls: [], popups: 0, access: true, company: "company-a", ready: false, saved: {
 id: "QA-SAVED", title: "QA tilbud", status: "Tilbud", customer: "Fiktiv kunde", offerTotal: 10000,
 offerLines: [{ id: "base", description: "Lagret grunnarbeid", amount: 10000, mainPostId: "ror", mainPostTitle: "Rørlegger" }],
 offerOptions: [{ id: "option", title: "Ekstra arbeid", amount: 1000, optionType: "addition", mainPostId: "ror", mainPostTitle: "Rørlegger" }],
} };
window.open=()=>{window.qa.popups++;throw Error("Draft preview must remain inside the app");};
const fetchQA=async(input,init={})=>{
 const url=new URL(typeof input==="string"?input:input.url);
 window.qa.calls.push({path:url.pathname,method:init.method||"GET"});
 if(url.pathname.startsWith("/rest/v1/")&&!url.pathname.includes("/rpc/")&&(init.method||"GET")!=="GET")throw Error("Preview attempted a data write");
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
 if(url.pathname==="/auth/v1/user")return json(user);
 if(url.pathname==="/auth/v1/logout")return json({});
 if(url.pathname==="/rest/v1/rpc/resolve_sales_company_scope")return window.qa.access?json(window.qa.company):json({message:"Tilgang tilbakekalt",code:"42501"},403);
 if(url.pathname==="/rest/v1/rpc/get_my_work_profile_state")return json({active_company_profile:{companyName:"QA firma",logoUrl:""}});
 if(url.pathname==="/rest/v1/sales_requests")return json([{company_id:window.qa.company,request_ref:window.qa.saved.id,payload:window.qa.saved,status:"Tilbud",created_by_name:"QA"}]);
 if(url.pathname==="/rest/v1/sales_offer_follow_up_notifications")return json([]);
 throw Error("Unexpected transport: "+url.pathname);
};
const makeClient=()=>createClient("https://draft-auth.example.invalid","synthetic-public-key",{auth:{autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:fetchQA}});
const main=makeClient();window.qa.client=main;
await main.auth.setSession({access_token:token,refresh_token:"synthetic-refresh"});
registerAppSupabaseClient(main);
window.qa.mainSignedIn=Boolean((await main.auth.getSession()).data.session);
// Former new-document boundary: a separate client, without the app registry.
const isolated=makeClient();window.qa.isolatedSignedIn=Boolean((await isolated.auth.getSession()).data.session);await isolated.auth.stopAutoRefresh();
function App(){
 const [id,setId]=useState("QA-SAVED");
 window.qa.switchRequest=()=>{window.qa.saved={...window.qa.saved,id:"QA-OTHER"};setId("QA-OTHER");};
 return <div data-expo-app-shell="true"><main><Detail selectedRequest={{...window.qa.saved,id,offerLines:[{...window.qa.saved.offerLines[0],description:"Ulagret varetekst"}]}}/></main></div>;
}
createRoot(document.getElementById("app")).render(<React.StrictMode><App/></React.StrictMode>);window.qa.ready=true;
