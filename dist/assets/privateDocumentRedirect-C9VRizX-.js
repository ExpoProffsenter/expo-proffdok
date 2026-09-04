var e=(e=``)=>{let t=String(e||``).trim().toLowerCase();return t===`underleverandor`||t===`underleverandør`||t===`underentreprenør`?`underleverandor`:`kunde`},t=(e=``)=>String(e||``).replace(/[<>]/g,``),n=e=>{document.body.innerHTML=e},r=(e=``)=>`
  <main style="min-height:100vh;background:#f4f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;box-sizing:border-box;display:flex;align-items:center;justify-content:center;">
    <section style="width:min(520px,100%);background:#fff;border:1px solid #dbe7ec;border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,.12);padding:24px;box-sizing:border-box;">
      <div style="font-weight:900;color:#0c2a52;font-size:13px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px;">Expo ProffDok</div>
      ${e}
    </section>
  </main>`,i=()=>{n(r(`
    <h1 style="font-size:22px;margin:0 0 10px;">Åpner sikkert dokument …</h1>
    <p style="margin:0;color:#475569;line-height:1.5;">Tilgangen kontrolleres før dokumentet åpnes.</p>
  `))},a=(e=`Dokumentet kunne ikke åpnes.`)=>{n(r(`
    <h1 style="font-size:22px;margin:0 0 10px;">Dokumentet kunne ikke åpnes</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.5;">${t(e)}</p>
    <button id="private-doc-close" type="button" style="border:0;border-radius:10px;padding:11px 16px;background:#0c2a52;color:#fff;font-weight:800;cursor:pointer;">Lukk</button>
  `)),document.getElementById(`private-doc-close`)?.addEventListener(`click`,()=>window.close())};async function o(){i();let t=new URLSearchParams(window.location.search),n=String(t.get(`path`)||``).trim().replace(/^\/+/,``);if(String(t.get(`project`)||``).trim(),e(t.get(`role`)||`kunde`),String(t.get(`publicOffer`)||``).trim(),t.get(`download`),!n){a(`Dokumentlenken mangler Storage-path.`);return}a(`Appen mangler Supabase-konfigurasjon.`)}export{o as runPrivateDocumentRedirect};