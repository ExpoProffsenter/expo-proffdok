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
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-builder-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Rooms from '${cwd}/src/modules/bolig/BoligRooms.jsx';
import '${cwd}/src/modules/bolig/bolig.css';
window.__context={user_id:'qa',company_id:'qa-company',role:'manager',enabled:true};
window.__states={u1:{revision:0,rooms:[]},u2:{revision:0,rooms:[]}};
window.__calls=[];window.__deny=false;window.__holdList=false;window.__waiters=[];
window.__client={rpc:async(name,args)=>{
 window.__calls.push({name,args});const ctx={...window.__context};
 if(window.__deny)return {error:{code:'42501',message:'Tilgangen er fjernet.'}};
 const unit=args.p_unit_id,s=window.__states[unit];
 const reply=()=>({data:{context:ctx,root_id:args.p_root_id,unit_id:unit,root_archived:false,...JSON.parse(JSON.stringify(s))}});
 if(name==='bolig_package_choices')return {data:{...reply().data,packages:[],options:[],components:[],selection:null,rooms_revision:s.revision}};
 if(name==='bolig_room_content')return reply();
 if(args.p_action==='list') {const response=reply();if(window.__holdList)return new Promise(resolve=>window.__waiters.push(()=>resolve(response)));return response;}
 if(args.p_revision!==s.revision)return {error:{code:'PT409',message:'Rommene er endret. Hent siste romoversikt.'}};
 if(ctx.role!=='manager')return {error:{code:'42501',message:'Prosjektleder kreves.'}};
 const p=args.p_payload,idx=s.rooms.findIndex(r=>r.id===p.id);
 if(args.p_action==='save'){if(idx<0)s.rooms.push({...p,archived:false});else s.rooms[idx]={...s.rooms[idx],...p};}
 else s.rooms[idx].archived=p.archived;
 s.revision++;if(window.__loseNextSave){window.__loseNextSave=false;return {error:{message:'Lagringssvaret gikk tapt.'}};}return reply();
}};
const root=createRoot(document.getElementById('app'));
window.__render=(unit='u1')=>root.render(<section data-qa-role={window.__context.role} className="bolig-page bolig-dialog" style={{width:'100%',maxWidth:'900px',padding:'16px',boxSizing:'border-box'}}><h2>Eksempelprosjekt · Bolig H0101</h2><div style={{maxWidth:'420px'}}><Rooms key={window.__context.company_id+unit+window.__context.role} context={{...window.__context}} root={{id:'qa-root',archived:false}} unit={{id:unit,number:'H0101'}}/></div></section>);
window.__render();
`,
);
let server, browser;
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const built = await build({
    root: cwd,
    configFile: false,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa-client",
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
      lib: {
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "Qa",
        cssFileName: "qa",
      },
    },
  });
  const output = (Array.isArray(built) ? built[0] : built).output,
    script = output.find((x) => x.type === "chunk").code,
    css = output
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "application/javascript");
      res.end(script);
    } else if (req.url === "/style.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else if (req.url === "/bolig/fasade.webp") {
      res.setHeader("content-type", "image/webp");
      res.end(fs.readFileSync("public/bolig/fasade.webp"));
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}</style><link rel="stylesheet" href="/style.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox"],
        }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    }),
    errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("PAGE ERROR:", e.message);
  });
  await page.goto("http://127.0.0.1:" + server.address().port);
  const add = () =>
      page.getByRole("button", { name: "Legg til rom", exact: true }),
    dlg = () => page.getByRole("dialog"),
    name = () => dlg().getByLabel("Romnavn", { exact: true }),
    save = () => dlg().getByRole("button", { name: "Lagre rom", exact: true });
  await add().waitFor();
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await add().click();
    await name().waitFor();
    eq(await name().inputValue(), "Bad 1", "New rooms suggest a numbered name");
    await name().fill("Bad med et langt egendefinert navn");
    await dlg()
      .getByLabel("Etasje i boligen (valgfritt)", { exact: false })
      .fill("2. etasje");
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "Page fits viewport",
    );
    const box = await dlg().boundingBox();
    eq(
      box.x >= 0 && box.x + box.width <= width + 1,
      true,
      "Room dialog fits viewport",
    );
    const field = await name().elementHandle();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    eq(
      await name().inputValue(),
      "Bad med et langt egendefinert navn",
      "Focus keeps unsent text",
    );
    eq(
      await field.evaluate(
        (el) => el === document.querySelector(".bolig-room-dialog input"),
      ),
      true,
      "Focus preserves editor DOM",
    );
    await page.keyboard.press("Escape");
    eq(await dlg().count(), 0, "Escape closes room dialog");
    await add().click();
    eq(
      await name().inputValue(),
      "Bad med et langt egendefinert navn",
      "Reopen preserves unsent text",
    );
    await dlg().getByText("Flere handlinger", { exact: true }).click();
    await dlg()
      .getByRole("button", { name: "Forkast romutkast", exact: true })
      .click();
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await add().click();
  await name().fill("Bad 1");
  await save().click();
  await page
    .getByRole("button", { name: "Rediger Bad 1", exact: true })
    .waitFor();
  eq(
    await page.getByRole("combobox", { name: "Vis rom" }).inputValue(),
    await page.evaluate(() => window.__states.u1.rooms[0].id),
    "Saved room is selected",
  );
  const firstId = await page.evaluate(() => window.__states.u1.rooms[0].id);
  await add().click();
  eq(await name().inputValue(), "Bad 2", "Second bathroom gets next name");
  await save().click();
  await page
    .getByRole("button", { name: "Rediger Bad 2", exact: true })
    .waitFor();
  await page.getByRole("combobox", { name: "Vis rom" }).selectOption(firstId);
  await page
    .getByRole("button", { name: "Rediger Bad 1", exact: true })
    .click();
  await name().fill("Hovedbad");
  await save().click();
  await page
    .getByRole("button", { name: "Rediger Hovedbad", exact: true })
    .waitFor();
  eq(
    await page.evaluate(() => window.__states.u1.rooms[0].id),
    firstId,
    "Renaming preserves ID",
  );
  await page
    .getByRole("button", { name: "Rediger Hovedbad", exact: true })
    .click();
  await name().fill("Mitt utkast");
  await page.evaluate(() => {
    window.__states.u1.revision++;
    window.__states.u1.rooms[1].name = "Eksternt endret bad";
  });
  await save().click();
  await dlg()
    .getByRole("button", { name: "Hent siste romoversikt", exact: true })
    .click();
  await dlg().getByText("Romoversikten er endret.", { exact: true }).waitFor();
  eq(await name().inputValue(), "Mitt utkast", "Conflict retains unsent name");
  eq(
    await save().isDisabled(),
    true,
    "Stale editor cannot save before explicit review",
  );
  eq(
    await dlg().getByText("Eksternt endret bad", { exact: true }).count(),
    1,
    "Conflict shows latest room list",
  );
  await dlg()
    .getByRole("button", { name: "Bruk siste grunnlag", exact: true })
    .click();
  await save().click();
  await page
    .getByRole("button", { name: "Rediger Mitt utkast", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Rediger Mitt utkast", exact: true })
    .click();
  await dlg().getByText("Flere handlinger", { exact: true }).click();
  await dlg().getByRole("button", { name: "Arkiver rom", exact: true }).click();
  eq(
    await dlg()
      .getByRole("button", { name: "Bekreft arkivering", exact: true })
      .count(),
    1,
    "Archive requires explicit confirmation",
  );
  await dlg()
    .getByRole("button", { name: "Behold rommet", exact: true })
    .click();
  eq(
    await dlg()
      .getByRole("button", { name: "Bekreft arkivering", exact: true })
      .count(),
    0,
  );
  await dlg().getByRole("button", { name: "Arkiver rom", exact: true }).click();
  await dlg()
    .getByRole("button", { name: "Bekreft arkivering", exact: true })
    .click();
  await page.getByText("Arkiverte rom (1)", { exact: true }).click();
  await page.getByRole("button", { name: "Gjenopprett", exact: true }).click();
  await page
    .getByRole("button", { name: "Rediger Mitt utkast", exact: true })
    .waitFor();
  eq(
    await page.evaluate(() => window.__states.u1.rooms[0].id),
    firstId,
    "Restoring preserves room identity",
  );
  await page.getByRole("combobox", { name: "Vis rom" }).selectOption("all");
  await page.screenshot({ path: "/tmp/bolig-rooms-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await add().click();
  await page.screenshot({ path: "/tmp/bolig-rooms-mobile-dialog.png" });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1366, height: 900 });
  // Persisted local editor must survive a real unmount and return to the apartment.
  await add().click();
  await name().fill("Usendt vaskerom");
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__render("u2"));
  await page.getByText("Hvilke rom har boligen?", { exact: true }).waitFor();
  await add().click();
  eq(
    await name().inputValue(),
    "Bad 1",
    "Separate apartment has separate draft",
  );
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__render("u1"));
  await add().waitFor();
  await add().click();
  eq(
    await name().inputValue(),
    "Usendt vaskerom",
    "Apartment draft survives unmount",
  );
  await dlg().getByText("Flere handlinger", { exact: true }).click();
  await dlg()
    .getByRole("button", { name: "Forkast romutkast", exact: true })
    .click();
  // Delayed reads may update server data but cannot reopen a deliberately closed dialog.
  await add().click();
  await name().fill("Behold på fokus");
  await page.evaluate(() => {
    window.__holdList = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    window.__holdList = false;
    window.__waiters.splice(0).forEach((fn) => fn());
  });
  eq(await dlg().count(), 0, "Late focus response respects deliberate close");
  await add().click();
  eq(await name().inputValue(), "Behold på fokus");
  await page.keyboard.press("Escape");
  // A successful server write with a lost response must retain the original ID on reload.
  await page.evaluate(() => {
    window.__render("u2");
  });
  await add().waitFor();
  await add().click();
  await page.evaluate(() => {
    window.__loseNextSave = true;
  });
  await save().click();
  await dlg()
    .getByText("Lagringssvaret gikk tapt.", { exact: false })
    .waitFor();
  const lostId = await page.evaluate(() => window.__states.u2.rooms[0].id);
  await page.reload();
  await add().waitFor();
  // The fixture resets its in-memory server on reload; restore the confirmed server version.
  await page.evaluate(
    ({ lostId }) => {
      window.__states.u2 = {
        revision: 1,
        rooms: [
          {
            id: lostId,
            type: "bathroom",
            name: "Bad 1",
            floor: "",
            archived: false,
          },
        ],
      };
      window.__render("u2");
    },
    { lostId },
  );
  await add().click();
  eq(
    await name().inputValue(),
    "Bad 1",
    "Untouched suggested draft survives a lost response",
  );
  eq(
    await save().isDisabled(),
    true,
    "Lost-response draft requires review against fresh state",
  );
  await dlg()
    .getByRole("button", { name: "Bruk siste grunnlag", exact: true })
    .click();
  await save().click();
  await page
    .getByRole("button", { name: "Rediger Bad 1", exact: true })
    .waitFor();
  eq(
    await page.evaluate(() => window.__states.u2.rooms.length),
    1,
    "Reapplying lost response does not create a duplicate",
  );
  eq(
    await page.evaluate(() => window.__states.u2.rooms[0].id),
    lostId,
    "Lost-response room keeps stable ID",
  );
  await page.evaluate(() => window.__render("u1"));
  await add().waitFor();
  await add().click();
  await dlg().getByText("Flere handlinger", { exact: true }).click();
  await dlg()
    .getByRole("button", { name: "Forkast romutkast", exact: true })
    .click();
  await add().click();
  const writesBeforeStorageFailure = await page.evaluate(
    () => window.__calls.filter((c) => c.args.p_action === "save").length,
  );
  await page.evaluate(() => {
    window.__storageSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function () {
      throw Error("No space");
    };
  });
  await save().click();
  eq(
    await dlg()
      .getByText("Kladden kunne ikke sikres lokalt.", { exact: false })
      .count(),
    1,
    "Local safety failure stays visible",
  );
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args.p_action === "save").length,
    ),
    writesBeforeStorageFailure,
    "Unsafely persisted ID is never sent",
  );
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__storageSet;
  });
  await page.keyboard.press("Escape");
  // Changing role remounts the permitted room view and hides manager actions.
  await page.evaluate(() => {
    window.__context.role = "reader";
    window.__render("u1");
  });
  // React root.render is scheduled; wait for the new role DOM before reading it.
  await page.locator('[data-qa-role="reader"]').waitFor();
  await page.getByRole("combobox", { name: "Vis rom" }).waitFor();
  eq(await add().count(), 0, "Reader has no room creation action");
  eq(
    await page.getByRole("button", { name: /Rediger/ }).count(),
    0,
    "Reader cannot edit rooms",
  );
  // Denial from a fresh server read removes room content immediately.
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Tilgangen er fjernet.", { exact: false }).waitFor();
  eq(
    await page.getByRole("combobox", { name: "Vis rom" }).count(),
    0,
    "Access revocation clears room content",
  );
  eq(errors, [], "No browser runtime errors");
  await page.screenshot({
    path: process.env.BOLIG_ROOMS_SCREENSHOT || "/tmp/bolig-rooms-qa.png",
  });
  console.log(
    `PASS bolig rooms Chromium: ${checks} assertions; mobile/desktop, stable DOM, drafts, conflict, archive/restore, role and revocation.`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
}
