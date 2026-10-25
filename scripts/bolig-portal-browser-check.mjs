import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = process.cwd(),
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-portal-qa-")),
  entry = path.join(tmp, "entry.jsx");
let checks = 0;
const eq = (a, b, msg) => {
  assert.deepEqual(a, b, msg);
  checks++;
};
fs.writeFileSync(
  entry,
  `
import React from '${root}/node_modules/react/index.js';
import {residentMailMock} from '${root}/scripts/fixtures/bolig-resident-mail-mock.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';
import Manager from '${root}/src/modules/bolig/BoligPortalManager.jsx';import Portal from '${root}/src/modules/bolig/BoligPortalPage.jsx';
import '${root}/src/style.css';import '${root}/src/modules/bolig/bolig.css';import '${root}/src/modules/bolig/boligCommerce.css';import '${root}/src/modules/bolig/boligResident.css';
const goods=[{key:'a',name:'Servant i eik',sku:'QA-01',quantity:1,unit:'stk',room_name:'Bad'}];
let state={id:'portal',menu_version:1,expires_at:'2026-11-22T12:00:00Z',identity:{project:'Solgløtt borettslag',company:'QA Firma',block:'Bygg A',unit:'H0101',address:'Solgløttveien 1'},offers:[{id:'base',title:'Grunnpakke',total_cents:0,goods},{id:'oak',title:'Tilvalgspakke i eik',total_cents:15000,goods}],events:[],documents:[{id:'fdv',title:'Brukerveiledning',url:'https://example.invalid/fdv.pdf'}],agreements:[{id:'agreement',kind:'choice',version:1,status:'published',expires_at:'2026-11-22',snapshot:{identity:{},goods,total_cents:15000,reason:'Valgene dine'}}]};
window.__newReply=()=>state.events.push({id:'external-reply',kind:'reply',sender:'manager',body:'Svar fra prosjektleder etter oppdatering',created_at:'2026-10-22T13:00:00Z'});
window.__identity=fields=>Object.assign(state.identity,fields);
window.__calls=[];window.__lost=false;window.__deny=false;window.__conflict=false;
window.fetch=async(url,options)=>{if(url.includes('/functions/v1/bolig-resident-link-email'))return mailMock.send(options);const p=JSON.parse(options.body);window.__calls.push(p);if(window.__deny)return new Response(JSON.stringify({code:'42501',message:'Portallenken er tilbakekalt.'}),{status:403});
if(p.p_action!=='get'){
const rid=p.p_payload.request_id;
if(p.p_action==='request'&&!state.events.some(e=>e.rid===rid))state.events.push({id:'req',rid,kind:'request',sender:'resident',offer:state.offers.find(o=>o.id===p.p_payload.offer_id),body:p.p_payload.body,status:'pending',created_at:'2026-10-22T12:00:00Z'});
if(p.p_action==='message'&&!state.events.some(e=>e.rid===rid))state.events.push({id:'msg',rid,kind:'message',sender:'resident',body:p.p_payload.body,created_at:'2026-10-22T12:00:00Z'});
if(['accept','decline'].includes(p.p_action))state.agreements[0]={...state.agreements[0],status:p.p_action==='accept'?'accepted':'declined',accepted_name:p.p_payload.name,accepted_at:'2026-10-22T12:00:00Z'};
if(window.__lost){window.__lost=false;throw Error('lost response');}}
return new Response(JSON.stringify(state));};
const context={user_id:'qa',company_id:'firm',enabled:true,role:'manager'};
let revision=0,managerPortal=null;
const mailMock=residentMailMock(context);
window.__client={auth:mailMock.auth,rpc(name,p){if(name==='bolig_resident_link_mail')return mailMock.rpc(p);window.__calls.push(p);return Promise.resolve().then(()=>{
if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};
if(window.__conflict&&p.p_action!=='get')return {error:{code:'PT409',message:'Portalen er endret. Kladden er beholdt.'}};
if(p.p_action!=='get'){revision++;if(!managerPortal)managerPortal={...state,offers:[],offers_draft:[],events:[],documents:[],revoked:true};
if(p.p_action==='offer')managerPortal.offers_draft.push({...state.offers[0],id:'draft'+revision,title:p.p_payload.title});
if(p.p_action==='publish'){managerPortal.revoked=false;managerPortal.offers=[...managerPortal.offers_draft];}
if(p.p_action==='revoke')managerPortal.revoked=true;
if(p.p_action==='reply')managerPortal.events.push({id:'reply',kind:'reply',sender:'manager',body:p.p_payload.body,created_at:'2026-10-22T12:00:00Z'});}
return {data:{context:{...context,role:window.__role||'manager'},root_id:'root',unit_id:'unit',revision,choice_revision:1,catalog_revision:1,rooms_revision:0,contact:{name:'QA Beboer',email:'qa@example.invalid'},components:[],options:[],packages:[],portal:managerPortal}};});}};
const app=createRoot(document.getElementById('app'));window.__mode=location.search.includes('manager')?'manager':'public';
window.__show=(mode=window.__mode,role='manager')=>{window.__mode=mode;window.__role=role;app.render(mode==='public'?<Portal key={role}/>:<div className="bolig-dialog" style={{position:'static',display:'block',width:'100%',maxWidth:1000,margin:'auto'}}><Manager key={role} context={{...context,role}} root={{id:'root'}} unit={{id:'unit',number:'H0101'}}/></div>);};window.__show();
`,
);
// Build isolated styles for the public page so internal shell rules cannot hide defects.
fs.writeFileSync(
  entry,
  fs
    .readFileSync(entry, "utf8")
    .replace(`import '${root}/src/modules/bolig/boligResident.css';`, ""),
);
const source =
    fs.readFileSync(entry, "utf8") +
    `\nimport '${root}/src/modules/bolig/boligResident.css';`,
  pub = path.join(tmp, "public.jsx");
fs.writeFileSync(
  pub,
  source.replace(
    `import '${root}/src/style.css';import '${root}/src/modules/bolig/bolig.css';import '${root}/src/modules/bolig/boligCommerce.css';`,
    "",
  ),
);
let server, browser, page;
try {
  const bundle = async (e) => {
    const r = await build({
      configFile: false,
      root,
      logLevel: "silent",
      define: {
        "process.env.NODE_ENV": '"production"',
        "import.meta.env.VITE_SUPABASE_URL": '"https://qa.invalid"',
        "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
      },
      plugins: [
        react({ jsxRuntime: "classic" }),
        {
          name: "mock-client",
          enforce: "pre",
          resolveId(id) {
            if (id.endsWith("appSupabaseClientRegistry.js")) return "\0qa";
          },
          load(id) {
            if (id === "\0qa")
              return "export const getAppSupabaseClient=()=>window.__client;";
          },
        },
      ],
      build: {
        write: false,
        minify: false,
        lib: { entry: e, formats: ["iife"], name: "Qa", cssFileName: "qa" },
      },
    });
    const out = (Array.isArray(r) ? r[0] : r).output;
    return {
      js: out.find((x) => x.type === "chunk").code,
      css: out
        .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
        .map((x) => x.source)
        .join("\n"),
    };
  };
  const m = await bundle(entry),
    p = await bundle(pub);
  server = http.createServer((req, res) => {
    const v = req.url.includes("manager") ? m : p;
    if (req.url.endsWith(".js")) {
      res.setHeader("content-type", "text/javascript");
      res.end(v.js);
    } else if (req.url.endsWith(".css")) {
      res.setHeader("content-type", "text/css");
      res.end(v.css);
    } else {
      const mode = req.url.includes("manager") ? "manager" : "public";
      res.setHeader("content-type", "text/html");
      res.end(
        '<!doctype html><html lang="nb"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/' +
          mode +
          '.css"><div id="app"></div><script src="/' +
          mode +
          '.js"></script></html>',
      );
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://expo-proffdok.app/expo-logo.png", route => route.fulfill({contentType:"image/png",body:fs.readFileSync("public/expo-logo.png")}));
  await page.goto(url + "#portal=" + "a".repeat(64));
  await page
    .getByRole("heading", { name: "Velg det som passer deg" })
    .waitFor();
  eq(await page.getByRole("radio").count(), 2);
  eq(await page.locator('.bolig-resident-brand strong').innerText(),'QA Firma','portal presents the server-authorized company');
  eq(await page.locator('.bolig-portal-home-card strong').innerText(),'H0101','unit identity is visible');
  await page.getByRole('button',{name:'Se avtaler som venter',exact:true}).click();
  await page.getByRole('heading',{name:'Dine avtaler og kvitteringer'}).waitFor();
  eq(await page.evaluate(()=>window.__calls.every(p=>p.p_action==='get')),true,'next-step navigation neither accepts nor sends');
  await page.getByRole('button',{name:'Mine valg',exact:true}).click();
  for (const width of [1366,390,320]) {
    await page.setViewportSize({width,height:1000});
    eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'welcome and next step fit '+width);
    const targets=await page.locator('.bolig-portal-tabs button').evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,focusable:n.tabIndex>=0})));
    eq(targets.every(t=>t.height>=44&&t.focusable),true,'all portal tabs are keyboard reachable and touch-sized at '+width);
    await page.screenshot({path:path.join(tmp,'portal-welcome-'+width+'.png'),fullPage:true});
  }
  await page.evaluate(()=>window.__identity({company:'Et langt entreprenørnavn for rehabilitering og tekniske installasjoner AS',unit:'Leilighet H0101 – første etasje',address:'Borettslagets svært lange gatenavn 123, oppgang B, 1234 Eksempelsted'}));
  await page.getByRole('button',{name:'Hent siste status',exact:true}).click();
  await page.locator('.bolig-resident-brand strong').filter({hasText:'Et langt entreprenørnavn'}).waitFor();
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'long authorized identity does not overflow at 320px');
  await page.evaluate(()=>window.__identity({company:'QA Firma',unit:'H0101',address:'Solgløttveien 1'}));
  await page.getByRole('button',{name:'Hent siste status',exact:true}).click();
  await page.locator('.bolig-resident-brand strong').filter({hasText:'QA Firma'}).waitFor();
  await page.getByRole("radio", { name: /Tilvalgspakke i eik/ }).check();
  await page
    .getByLabel("Merknad til valget (valgfritt)")
    .fill("QA behold denne merknaden");
  await page.evaluate(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  eq(
    await page.getByLabel("Merknad til valget (valgfritt)").inputValue(),
    "QA behold denne merknaden",
  );
  await page.reload();
  await page.getByLabel("Merknad til valget (valgfritt)").waitFor();
  eq(
    await page.getByLabel("Merknad til valget (valgfritt)").inputValue(),
    "QA behold denne merknaden",
    "reload restores draft",
  );
  await page
    .getByRole("button", { name: "Se over valget", exact: true })
    .click();
  await page.evaluate(() => (window.__lost = true));
  await page.getByRole("button", { name: "Send valg til gjennomgang" }).click();
  await page
    .getByRole("button", { name: "Prøv samme sending igjen" })
    .waitFor();
  await page.getByRole("button", { name: "Prøv samme sending igjen" }).click();
  await page
    .getByText("Valget er sendt til prosjektleder for gjennomgang.")
    .waitFor();
  const attempts = await page.evaluate(() =>
    window.__calls.filter((p) => p.p_action === "request"),
  );
  eq(attempts.length, 2);
  eq(attempts[0], attempts[1], "lost response uses same request id");
  eq(await page.getByText(/· Venter på gjennomgang$/).count(), 1);
  await page.getByRole("button", { name: "Meldinger", exact: true }).click();
  await page.getByLabel("Din melding").fill("Mitt spørsmål om boligen");
  await page.getByRole("button", { name: "Mine valg", exact: true }).click();
  await page.getByRole("button", { name: "Meldinger", exact: true }).click();
  eq(
    await page.getByLabel("Din melding").inputValue(),
    "Mitt spørsmål om boligen",
  );
  await page.getByRole("button", { name: "Send melding", exact: true }).click();
  await page.getByText("Mitt spørsmål om boligen", { exact: true }).waitFor();
  await page.getByLabel("Din melding").fill("Kladd under oppdatering");
  await page.evaluate(() => window.__newReply());
  await page
    .getByRole("button", { name: "Hent siste status", exact: true })
    .click();
  await page
    .getByText("Svar fra prosjektleder etter oppdatering", { exact: true })
    .waitFor();
  checks++;
  eq(
    await page.getByLabel("Din melding").inputValue(),
    "Kladd under oppdatering",
    "server refresh preserves unsent message",
  );
  await page.getByRole("button", { name: "Dokumenter", exact: true }).click();
  eq(
    await page
      .getByRole("link", { name: /Brukerveiledning/ })
      .getAttribute("href"),
    "https://example.invalid/fdv.pdf",
  );
  await page.getByRole("button", { name: /^Avtaler/ }).click();
  await page.getByRole("button", { name: "Åpne avtalen" }).click();
  await page.getByLabel("Fullt navn").fill("QA Beboer");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Kontroller aksept" }).click();
  await page.getByRole("button", { name: "Registrer aksept" }).click();
  await page
    .getByText("Svaret er registrert. Kvitteringen ligger under Avtaler.")
    .waitFor();
  eq(await page.getByRole("button", { name: "Åpne avtalen" }).count(), 0);
  await page.getByRole("button", { name: "Åpne kvitteringen" }).click();
  await page.getByText("Aksepten er registrert", { exact: true }).waitFor();
  checks++;
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("button", { name: "Mine valg", exact: true }).click();
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "no horizontal overflow " + width,
    );
    const radio = await page.getByRole("radio").first().boundingBox();
    eq(radio.width <= 24, true, "radio stays small at " + width);
    await page.screenshot({
      path: path.join(tmp, "portal-" + width + ".png"),
      fullPage: true,
    });
  }
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByRole("heading", { name: "Portalen kan ikke åpnes" })
    .waitFor();
  eq(
    await page.getByRole("radio").count(),
    0,
    "revoked capability clears data",
  );
  eq(await page.locator('.bolig-portal-home-card,.bolig-portal-next').count(),0,'revocation removes the complete personal welcome');
  eq(await page.locator('.bolig-resident-brand strong').innerText(),'Beboerportal','revocation removes company identity from header');
  await page.goto(url + "?manager");
  await page
    .getByLabel("Navn på valgmuligheten")
    .fill("Grunnpakke til beboeren");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await page.getByLabel("Navn på valgmuligheten").inputValue(),
    "Grunnpakke til beboeren",
  );
  await page.getByRole("button", { name: "Legg til valgmulighet" }).click();
  await page.getByRole("button", { name: "Fjern alternativ" }).waitFor();
  await page
    .getByRole("button", { name: "Klargjør invitasjon", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  eq(
    await dialog
      .getByLabel("Forhåndsvisning")
      .inputValue()
      .then((x) => x.includes("qa@example.invalid")),
    false,
    "email is shown separately",
  );
  eq(
    await dialog
      .getByRole("button", { name: "Lag portaltilgang" })
      .isDisabled(),
    true,
  );
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Lag portaltilgang" }).click();
  await page.getByLabel("Personlig portallenke").waitFor({ state: "attached" });
  eq(
    /^http.*#portal=[a-f0-9]{64}$/.test(
      await page.getByLabel("Personlig portallenke").inputValue(),
    ),
    true,
  );
  const invitation = page.getByRole("region", {name:"Send beboerlenke",exact:true});
  await invitation.getByRole("button", {name:"Send beboerlenke",exact:true}).waitFor();
  eq(await dialog.isVisible(),true,"publication keeps same invitation dialog open");
  eq((await invitation.innerText()).includes("qa@example.invalid"),true,"canonical recipient in same window");
  await invitation.getByText("Forhåndsvis e-post",{exact:true}).click();
  await invitation.frameLocator("iframe").getByRole("heading",{name:"Velkommen til beboerportalen",exact:true}).click();
  eq(await dialog.isVisible(),true,"actual iframe click keeps portal dialog open");
  eq(await invitation.locator("iframe").getAttribute("sandbox"),"","safe preview iframe");
  await page.evaluate(()=>window.__loseLinkMail=true);
  await invitation.getByRole("button",{name:"Send beboerlenke",exact:true}).click();
  await invitation.getByRole("button",{name:"Prøv samme sending igjen",exact:true}).waitFor();
  await page.evaluate(()=>window.__show("manager","reader"));
  await dialog.waitFor({state:"hidden"});
  await page.evaluate(()=>window.__show("manager","manager"));
  await page.getByRole("button",{name:"Send invitasjon på e-post",exact:true}).click();
  await invitation.getByRole("button",{name:"Prøv samme sending igjen",exact:true}).click();
  await invitation.getByRole("button",{name:"Send lenken på nytt",exact:true}).waitFor();
  eq(await page.evaluate(()=>window.__linkMailCalls[0]),await page.evaluate(()=>window.__linkMailCalls[1]),"exact send retry survives remount");
  for (const width of [390,320]) {
    await page.setViewportSize({width,height:900});
    eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,"invitation fits mobile "+width);
    eq(await invitation.frameLocator("iframe").locator("body").evaluate(el=>el.scrollWidth<=el.ownerDocument.defaultView.innerWidth),true,"mail fits mobile "+width);
  }
  eq(await invitation.frameLocator("iframe").locator("h1").evaluate(el=>el.scrollWidth<=el.clientWidth),true,"long email heading wraps instead of being clipped");
  await dialog.evaluate(el=>el.scrollTo(0,0));
  await page.screenshot({path:path.join(tmp,"portal-mail-320.png"),fullPage:true});
  await invitation.frameLocator("iframe").locator("body").screenshot({path:path.join(tmp,"resident-email-320.png")});
  await page.setViewportSize({width:1280,height:1000});
  await dialog.getByRole("button",{name:"Lukk invitasjon til beboerportalen",exact:true}).click();
  await page.getByRole("button",{name:"Klargjør påminnelse",exact:true}).click();
  await invitation.getByText("Forhåndsvis e-post",{exact:true}).click();
  eq((await invitation.locator("iframe").getAttribute("srcdoc")).includes("Påminnelse om beboerportalen"),true,"reminder uses same branded template and existing link");
  await page.evaluate(()=>{window.__linkMailEnabled=false;window.dispatchEvent(new Event("focus"));});
  await invitation.getByText("E-postutsending er pauset i dette testmiljøet.",{exact:false}).waitFor();
  eq(await invitation.getByRole("button",{name:"Send lenken på nytt",exact:true}).isDisabled(),true,"paused transport blocks reminder");
  await dialog.getByRole("button",{name:"Lukk påminnelse til beboeren",exact:true}).click();
  await page.getByText("Meldinger · 0", { exact: true }).click();
  await page
    .getByLabel("Melding til beboeren")
    .fill("Svar som beholdes ved lukking");
  await page.screenshot({
    path: path.join(tmp, "manager-1280.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 1000 });
  eq(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "internal mobile layout",
  );
  await page.screenshot({
    path: path.join(tmp, "manager-390.png"),
    fullPage: true,
  });
  await page.evaluate(() => window.__show("manager", "reader"));
  await page.getByLabel("Melding til beboeren").waitFor({ state: "hidden" });
  await page.evaluate(() => window.__show("manager", "manager"));
  await page.getByText("Meldinger · 0", { exact: true }).click();
  eq(
    await page.getByLabel("Melding til beboeren").inputValue(),
    "Svar som beholdes ved lukking",
  );
  await page.evaluate(() => window.__show("manager", "reader"));
  await page
    .getByRole("heading", { name: "Beboerportal", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Forny portaltilgang" })
    .waitFor({ state: "hidden" });
  eq(
    await page.getByRole("button", { name: "Forny portaltilgang" }).count(),
    0,
    "reader cannot publish",
  );
  eq(errors, [], "no runtime errors");
  console.log(
    "PASS bolig portal Chromium: " +
      checks +
      " assertions; request recovery, scoped draft resume, exact acceptance, documents, messages, revocation, manager invitation, reader and 320px layout. Screenshots: " +
      tmp,
  );
} catch (e) {
  if (page)
    console.error((await page.locator("body").innerText()).slice(-2600));
  throw e;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
