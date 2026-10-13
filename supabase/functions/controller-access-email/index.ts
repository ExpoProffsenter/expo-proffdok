import {createClient} from "npm:@supabase/supabase-js@2";
const FALLBACK_LOGO_URL="https://expo-proffdok.app/expo-logo.png";
function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasValue(value: unknown) {
  return String(value ?? "").trim().length > 0;
}

function normalizeAccessCode(value: unknown) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeRole(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function formatAddress(address = "", postnr = "", city = "") {
  const place = [postnr, city].filter(hasValue).join(" ");
  return [address, place].filter(hasValue).join(", ");
}

function detailRow(label: string, value: unknown) {
  if (!hasValue(value)) return "";
  return `<p style="margin:0 0 8px;color:#ffffff;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function accessPolicyText(accessPolicy: unknown) {
  return String(accessPolicy || "") === "active_project_plus_locked_30_days"
    ? "Tilgangen er gyldig så lenge prosjektet er aktivt. Etter låsing/arkivering beholdes tilgangen i 30 dager."
    : "";
}


function buildEmailHtml({
  title,
  intro,
  projectName,
  customerName,
  customerEmail,
  accountEmail,
  customerPhone,
  projectAddress,
  projectPostnr,
  projectCity,
  projectResponsible,
  responsibleLabel = "Prosjektansvarlig",
  fromName,
  fromLabel = "Fra",
  message,
  projectLink,
  accessCode,
  accessPolicy,
  buttonText = "Åpne prosjekt",
  companyLogoUrl,
  sentViaText,
  footerCompanyText,
}: any) {
  const fullAddress = formatAddress(projectAddress, projectPostnr, projectCity);
  const logoUrl = String(companyLogoUrl || "").trim() || FALLBACK_LOGO_URL;
  const safeLogoUrl = escapeHtml(logoUrl);
  const safeFooterCompanyText = escapeHtml(footerCompanyText || "Expo ProffDok");
  const safeSentViaText = escapeHtml(sentViaText || "Dokumentasjon levert gjennom Expo ProffDok");
  const detailRows = [
    detailRow("Prosjekt", projectName),
    detailRow("Kunde", customerName),
    detailRow("Adresse", fullAddress),
    detailRow("Kunde e-post", customerEmail),
    detailRow("Brukerkonto", accountEmail),
    detailRow("Kunde telefon", customerPhone),
    detailRow(responsibleLabel, projectResponsible),
    detailRow(fromLabel, fromName),
  ].join("");
  const rawMessage = String(message || "");
  const safeMessage = escapeHtml(rawMessage).replaceAll("\n", "<br>");
  const safeLink = escapeHtml(projectLink);
  const cleanAccessCode = normalizeAccessCode(accessCode);
  const messageAlreadyContainsAccessCode = cleanAccessCode
    ? rawMessage.toUpperCase().includes(cleanAccessCode)
    : false;
  const showAccessCodeBlock = hasValue(cleanAccessCode) && !messageAlreadyContainsAccessCode;
  const safeAccessPolicyText = escapeHtml(accessPolicyText(accessPolicy));

  return `
  <div style="margin:0;padding:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;">
    <div style="max-width:760px;margin:0 auto;padding:20px 12px;">
      <div style="background:#242424;border:1px solid #dbe7f0;border-radius:18px;overflow:hidden;">
        <div style="position:relative;padding:28px 32px 24px;border-bottom:1px solid #dbe7f0;min-height:100px;">
          <div style="font-size:48px;line-height:.9;font-weight:900;letter-spacing:-2px;color:#08b9c3;">EXPO</div>
          <div style="font-size:54px;line-height:.9;font-weight:900;letter-spacing:-2px;color:#ffffff;">ProffDok</div>
          <img src="${safeLogoUrl}" alt="${safeFooterCompanyText}" style="position:absolute;top:30px;right:30px;width:150px;max-width:34%;height:auto;background:#fff;padding:4px;" />
        </div>
        <div style="padding:34px 32px;">
          <h1 style="font-size:24px;line-height:1.3;margin:0 0 14px;color:#dbe7f0;font-weight:900;">${escapeHtml(title)}</h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 26px;color:#cbd5e1;">${escapeHtml(intro)}</p>
          <div style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;padding:16px 18px;margin-bottom:20px;">${detailRows}</div>
          ${safeMessage ? `<p style="font-weight:900;margin:0 0 8px;color:#dbe7f0;">Melding:</p><div style="border:1px solid #dbe7f0;border-radius:14px;padding:16px 18px;background:#5a5d60;line-height:1.7;margin-bottom:26px;color:#ffffff;">${safeMessage}</div>` : ""}
          ${showAccessCodeBlock ? `<p style="font-weight:900;margin:0 0 8px;color:#dbe7f0;">Tilgangskode:</p><div style="border:1px solid #08d5d8;border-radius:14px;padding:16px 18px;background:#163f43;margin-bottom:26px;color:#ffffff;"><div style="font-size:26px;line-height:1.2;font-weight:900;letter-spacing:4px;">${escapeHtml(cleanAccessCode)}</div>${safeAccessPolicyText ? `<p style="font-size:13px;line-height:1.6;margin:10px 0 0;color:#dbe7f0;">${safeAccessPolicyText}</p>` : ""}</div>` : ""}
          ${safeLink ? `<a href="${safeLink}" style="display:inline-block;background:#007f89;color:#ffffff;text-decoration:none;font-weight:900;padding:14px 24px;border-radius:12px;font-size:15px;">${escapeHtml(buttonText)}</a><p style="font-size:13px;color:#b8c7d3;line-height:1.6;margin-top:24px;">Hvis knappen ikke fungerer, kan du kopiere denne lenken:<br><a href="${safeLink}" style="color:#08d5d8;">${safeLink}</a></p>` : ""}
          <hr style="border:none;border-top:1px solid #dbe7f0;margin:32px 0;" />
          <p style="margin:0 0 8px;color:#cbd5e1;font-size:15px;">Med vennlig hilsen</p>
          <p style="margin:0;color:#dbe7f0;font-size:17px;font-weight:900;">${safeFooterCompanyText}</p>
          <p style="margin:6px 0 0;color:#aebbc7;font-size:13px;">${safeSentViaText}</p>
        </div>
      </div>
      <p style="text-align:center;color:#aebbc7;font-size:12px;margin:18px 0 0;">Denne e-posten er sendt automatisk via Expo ProffDok.</p>
    </div>
  </div>`;
}

export async function handleControllerEmail(req: Request, deps: any = {}) {
 const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
 const response=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==="OPTIONS")return response({ok:true});
 if(req.method!=="POST")return response({ok:false,error:"Bare POST er tillatt."},405);
 try{
  const env=deps.env||((name:string)=>Deno.env.get(name));
  const factory=deps.createClient||createClient;
  const client=factory(env("SUPABASE_URL"),env("SUPABASE_ANON_KEY"),{global:{headers:{Authorization:req.headers.get("Authorization")||""}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user) return response({ok:false,error:"Logg inn før du sender kontrollørtilgang."},401);
  const body=await req.json();
  const toEmail=normalizeEmail(body.toEmail);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail))return response({ok:false,error:"Skriv en gyldig e-postadresse."},400);
  const {data:rows,error:listError}=await client.rpc("controller_access_list",{p_project_id:body.projectId});
  const row=rows?.find((r:any)=>r.id===body.linkId);
  if(listError||!row||row.revoked_at||new Date(row.expires_at).getTime()<=Date.now())return response({ok:false,error:"Kontrollørtilgangen er utløpt, trukket tilbake eller utilgjengelig."},403);
  const {data:access,error:readError}=await client.rpc("controller_project_read",{p_link_id:row.id,p_code:body.accessCode});
  if(readError||!access?.ok)return response({ok:false,error:"Tilgangskoden er ikke lenger gyldig. Lag en ny kode."},403);
  const link=new URL(String(body.projectLink));
  const host=link.hostname;
  if(link.protocol!=="https:"||!(host==="expo-proffdok.app"||host==="www.expo-proffdok.app"||/^expo-proffdok(?:-[a-z0-9-]+)?\.vercel\.app$/.test(host))||link.pathname!=="/"||link.searchParams.get("controller")!==row.id||[...link.searchParams.keys()].length!==1||link.hash||link.username||link.password||link.port)return response({ok:false,error:"Ugyldig kontrollørlenke."},400);
  const project=access.data?.project||{};
  const projectName=String(project.projectName||project.address||"Prosjekt");
  const expiry=new Date(access.expires_at).toLocaleString("nb-NO",{timeZone:"Europe/Oslo"});
  const html=buildEmailHtml({
    title:"Du har fått tilgang som uavhengig kontrollør",
    intro:"Du har lesetilgang til prosjektering, tegninger, bilder og prosjektets sjekklister. Du kan ikke endre prosjektet.",
    projectName,projectAddress:project.address,projectPostnr:project.postnr,projectCity:project.city,
    fromName:body.fromName,
    message:`Hei ${row.name}.\nTilgangen er gyldig til ${expiry} (norsk tid). Den kan trekkes tilbake tidligere.\nBruk tilgangskoden nedenfor for å åpne prosjektet.`,
    projectLink:link.href,accessCode:body.accessCode,buttonText:"Åpne kontrollørportal",
    companyLogoUrl:body.companyLogoUrl,sentViaText:body.sentViaText,footerCompanyText:body.footerCompanyText
  });
  const key=env("RESEND_API_KEY");if(!key)throw Error("E-posttjenesten er ikke konfigurert.");
  const result=await (deps.fetch||fetch)("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:env("CHAT_FROM_EMAIL")||"Expo ProffDok <onboarding@resend.dev>",to:[toEmail],subject:`Kontrollørtilgang – ${projectName}`,html})});
  const provider=await result.json();
  if(!result.ok||!provider.id)return response({ok:false,error:"E-posttjenesten kunne ikke bekrefte sendingen. Prøv igjen."},502);
  return response({ok:true,id:provider.id});
 }catch{return response({ok:false,error:"Kunne ikke sende e-post. Tilgangen er beholdt; prøv igjen."},500);}
}
if(import.meta.main)Deno.serve(handleControllerEmail);

