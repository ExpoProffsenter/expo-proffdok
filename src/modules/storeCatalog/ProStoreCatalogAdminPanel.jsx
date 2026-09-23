import { useEffect, useMemo, useState } from "react";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import { listCatalogCompanies, listCatalogSuppliers, listCompanySupplierAccess, setCompanySupplierAccess, listUserNetPriceAccess, setUserNetPriceAccess } from "./proStoreCatalogClient.js";

const DEFAULT_SUPPLIER_SUGGESTIONS=[
  {supplierKey:"flislab as",label:"FlisLab AS",discountPercent:40},
  {supplierKey:"flislabfliser",label:"FlisLabFLISER",discountPercent:40},
  {supplierKey:"askøy",label:"Askøy",discountPercent:40},
  {supplierKey:"baden haus",label:"Baden Haus",discountPercent:30},
];

function SupplierAccessRow({ supplier, row, onSaveDiscount, onRemove }) {
  const [discount,setDiscount]=useState(String(row?.discount_percent ?? 0));
  useEffect(()=>setDiscount(String(row?.discount_percent ?? 0)),[row?.discount_percent,supplier.supplier_key]);
  return <div className="pro-catalog-active-row">
    <strong>{supplier.supplier_name}</strong>
    <label>Rabatt %<input type="number" min="0" max="100" step="0.01" value={discount} onChange={(e)=>setDiscount(e.target.value)} onBlur={()=>void onSaveDiscount(Number(discount||0))}/></label>
    <button type="button" className="sales-secondary-button" onClick={()=>void onRemove()}>Fjern</button>
  </div>;
}

export default function ProStoreCatalogAdminPanel({ companyId = "", mode = "systemadmin" }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [authorized,setAuthorized]=useState(mode!=="firmaadmin");
  const [companies,setCompanies]=useState([]); const [selectedCompanyId,setSelectedCompanyId]=useState(companyId); const [suppliers,setSuppliers]=useState([]); const [access,setAccess]=useState([]); const [users,setUsers]=useState([]); const [message,setMessage]=useState(""); const [supplierSearch,setSupplierSearch]=useState(""); const [defaultsBusy,setDefaultsBusy]=useState(false);
  const effectiveCompanyId=companyId||selectedCompanyId;

  useEffect(()=>{
    if(mode!=="firmaadmin"){setAuthorized(true);return;}
    let active=true;
    Promise.all([client?.rpc?.("current_profile_is_firmaadmin"),client?.rpc?.("current_profile_is_systemadmin")])
      .then(([firma,system])=>active&&setAuthorized(firma?.data===true&&system?.data!==true))
      .catch(()=>active&&setAuthorized(false));
    return()=>{active=false;};
  },[client,mode]);

  async function refreshBase(){
    if(!authorized)return;
    setMessage("");
    try{
      const userRows=await listUserNetPriceAccess(client); setUsers(Array.isArray(userRows)?userRows:[]);
      if(mode==="systemadmin"){
        const [companyRows,supplierRows]=await Promise.all([listCatalogCompanies(client),listCatalogSuppliers(client)]);
        setCompanies(companyRows); setSuppliers(supplierRows);
        if(!companyId&&!selectedCompanyId&&companyRows.length){
          const demo=companyRows.find((row)=>String(row.display_name||"").toLowerCase()==="proffkunde demo as");
          setSelectedCompanyId(String((demo||companyRows[0]).company_id||""));
        }
      }
    }catch(error){setMessage(error?.message||"Kunne ikke hente proffinnstillinger.");}
  }

  async function refreshAccess(targetCompanyId=effectiveCompanyId){
    if(!authorized||mode!=="systemadmin"||!targetCompanyId){setAccess([]);return;}
    try{const rows=await listCompanySupplierAccess(client,targetCompanyId);setAccess(Array.isArray(rows)?rows:[]);}catch(error){setMessage(error?.message||"Kunne ikke hente leverandørtilganger.");}
  }

  useEffect(()=>{void refreshBase();},[mode,companyId,authorized]);
  useEffect(()=>{void refreshAccess(effectiveCompanyId);setSupplierSearch("");},[effectiveCompanyId,mode,authorized]);

  const accessByKey=useMemo(()=>new Map(access.map((row)=>[row.supplier_key,row])),[access]);
  const supplierByKey=useMemo(()=>new Map(suppliers.map((row)=>[row.supplier_key,row])),[suppliers]);
  const activeSuppliers=useMemo(()=>suppliers.filter((supplier)=>accessByKey.get(supplier.supplier_key)?.is_active===true),[suppliers,accessByKey]);
  const availableSuppliers=useMemo(()=>{
    const q=supplierSearch.trim().toLowerCase();
    return suppliers.filter((supplier)=>accessByKey.get(supplier.supplier_key)?.is_active!==true)
      .filter((supplier)=>!q||String(supplier.supplier_name||"").toLowerCase().includes(q))
      .slice(0,8);
  },[suppliers,accessByKey,supplierSearch]);
  const visibleUsers=mode==="systemadmin"&&effectiveCompanyId?users.filter((user)=>String(user.company_id||"")===String(effectiveCompanyId)):users;

  async function saveSupplier(supplier,patch){const current=accessByKey.get(supplier.supplier_key);try{await setCompanySupplierAccess(client,{companyId:effectiveCompanyId,supplierKey:supplier.supplier_key,discountPercent:patch.discountPercent??current?.discount_percent??0,isActive:patch.isActive??current?.is_active??true});await refreshAccess(effectiveCompanyId);}catch(error){setMessage(error?.message||"Kunne ikke lagre leverandørtilgang.");}}
  async function saveUser(user,canView){const targetCompanyId=mode==="systemadmin"?effectiveCompanyId:String(user?.company_id||"");try{await setUserNetPriceAccess(client,targetCompanyId,user.user_id,canView);await refreshBase();}catch(error){setMessage(error?.message||"Kunne ikke lagre prisinnsyn.");}}
  async function applyDefaultSuggestions(){
    if(!effectiveCompanyId||defaultsBusy)return;
    setDefaultsBusy(true); setMessage("");
    try{
      let added=0;
      for(const suggestion of DEFAULT_SUPPLIER_SUGGESTIONS){
        if(accessByKey.get(suggestion.supplierKey)?.is_active===true)continue;
        const supplier=supplierByKey.get(suggestion.supplierKey);
        if(!supplier)continue;
        await setCompanySupplierAccess(client,{companyId:effectiveCompanyId,supplierKey:suggestion.supplierKey,discountPercent:suggestion.discountPercent,isActive:true});
        added+=1;
      }
      await refreshAccess(effectiveCompanyId);
      setMessage(added?`${added} standardleverandør(er) ble lagt til. Eksisterende rabatter ble ikke overskrevet.`:"Alle standardforslag er allerede aktive. Eksisterende rabatter er beholdt.");
    }catch(error){setMessage(error?.message||"Kunne ikke legge til standardforslag.");}
    finally{setDefaultsBusy(false);}
  }

  if(!authorized)return null;
  return <section className="pro-catalog-admin">
    <div><h3>Proff vareregister</h3><p>Systemadmin velger hvilke leverandører firmaet får se og rabatt per leverandør. Firmaadmin bestemmer hvem som får se «Din nto pris».</p></div>
    {mode==="systemadmin"&&!companyId?<label className="pro-catalog-company">Firma<select value={selectedCompanyId} onChange={(e)=>setSelectedCompanyId(e.target.value)}><option value="">Velg firma</option>{companies.map((company)=><option key={company.company_id} value={company.company_id}>{company.display_name}</option>)}</select></label>:null}

    {mode==="systemadmin"&&effectiveCompanyId?<>
      <div className="pro-catalog-defaults">
        <div><strong>Standardforslag for proffkunde</strong><small>FlisLab AS 40 % · FlisLabFLISER 40 % · Askøy 40 % · Baden Haus 30 %</small></div>
        <button type="button" className="sales-secondary-button" disabled={defaultsBusy} onClick={()=>void applyDefaultSuggestions()}>{defaultsBusy?"Legger til …":"Legg til standardforslag"}</button>
      </div>
      <div className="pro-catalog-admin-list">
        <div className="pro-catalog-list-head"><strong>Aktive leverandører</strong><small>{activeSuppliers.length} valgt</small></div>
        {activeSuppliers.length?activeSuppliers.map((supplier)=>{
          const row=accessByKey.get(supplier.supplier_key);
          return <SupplierAccessRow key={supplier.supplier_key} supplier={supplier} row={row} onSaveDiscount={(value)=>saveSupplier(supplier,{discountPercent:value})} onRemove={()=>saveSupplier(supplier,{isActive:false})}/>;
        }):<small>Ingen leverandører er aktivert for firmaet.</small>}
      </div>

      <details className="pro-catalog-add-supplier">
        <summary>+ Legg til leverandør</summary>
        <div className="pro-catalog-add-body">
          <input type="search" value={supplierSearch} onChange={(e)=>setSupplierSearch(e.target.value)} placeholder="Søk leverandør" />
          <div className="pro-catalog-add-results">
            {availableSuppliers.map((supplier)=><button type="button" key={supplier.supplier_key} onClick={()=>void saveSupplier(supplier,{isActive:true,discountPercent:accessByKey.get(supplier.supplier_key)?.discount_percent??0})}><span>{supplier.supplier_name}</span><b>Legg til</b></button>)}
            {!availableSuppliers.length?<small>Ingen tilgjengelige leverandører matcher søket.</small>:null}
          </div>
        </div>
      </details>
    </>:null}

    <div className="pro-catalog-admin-list"><strong>Hvem kan se «Din nto pris»</strong>{visibleUsers.length?visibleUsers.map((user)=><label className="pro-catalog-admin-user" key={`${user.company_id||"company"}-${user.user_id}`}><input type="checkbox" checked={user.can_view_net_price===true} onChange={(e)=>void saveUser(user,e.target.checked)}/><span>{user.email||user.user_id}</span></label>):<small>Ingen brukere funnet for valgt firma.</small>}</div>
    {message?<small className={message.startsWith("Kunne")?"is-error":""}>{message}</small>:null}
    <style>{`.pro-catalog-admin{display:grid;gap:16px}.pro-catalog-admin h3,.pro-catalog-admin p{margin:0}.pro-catalog-company{display:grid;gap:6px;font-weight:700}.pro-catalog-company select,.pro-catalog-add-body input{min-height:42px;border:1px solid #ccdadd;border-radius:9px;padding:0 10px;background:#fff;font:inherit}.pro-catalog-defaults{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:12px;border:1px solid #b9dfe3;border-radius:10px;background:#f3fbfc}.pro-catalog-defaults div{display:grid;gap:3px}.pro-catalog-defaults small{color:#52616b}.pro-catalog-defaults button{width:auto}.pro-catalog-admin-list{display:grid;gap:8px}.pro-catalog-list-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.pro-catalog-list-head small{color:#64748b}.pro-catalog-active-row{display:grid;grid-template-columns:minmax(0,1fr) 150px auto;gap:12px;align-items:center;padding:10px 12px;border:1px solid #d7e2e5;border-radius:10px;background:#fff}.pro-catalog-active-row label{display:flex;gap:8px;align-items:center;justify-content:flex-end}.pro-catalog-active-row input[type=number]{width:78px;min-height:36px}.pro-catalog-active-row button{width:auto;min-height:36px}.pro-catalog-add-supplier{border:1px solid #d7e2e5;border-radius:10px;background:#fbfefe}.pro-catalog-add-supplier summary{cursor:pointer;padding:11px 12px;font-weight:800}.pro-catalog-add-body{display:grid;gap:8px;padding:0 12px 12px}.pro-catalog-add-results{display:grid;gap:6px}.pro-catalog-add-results button{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 11px;border:1px solid #d7e2e5;border-radius:9px;background:#fff;color:#10212b}.pro-catalog-admin-user{display:flex;gap:8px;align-items:center;padding:8px 0}.pro-catalog-admin .is-error{color:#a33232}@media(max-width:700px){.pro-catalog-active-row{grid-template-columns:1fr}.pro-catalog-active-row label{justify-content:flex-start}.pro-catalog-defaults{align-items:flex-start;flex-direction:column}}`}</style>
  </section>;
}
