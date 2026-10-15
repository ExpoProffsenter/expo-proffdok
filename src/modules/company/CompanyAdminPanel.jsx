import React, {useEffect, useRef, useState} from 'react';
import {UserAccessRow} from '../access/moduleAccessUx.jsx';
import PeopleModuleAccess from '../access/PeopleModuleAccess.jsx';
import {MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, publishManagedAccessChange, rpcWithStoredSession} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {companyAdminRpc, sendCompanyInvitation} from './companyAdminClient.js';
import './CompanyAdminPanel.css';

function NetPriceAccess({user, callerId}) {
  const [value,setValue]=useState(user.pro_net_price_can_view===true);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>setValue(user.pro_net_price_can_view===true),[user.pro_net_price_can_view]);
  const eligible=user.approved&&!user.deactivated&&user.module_keys?.includes('sales')&&user.module_keys?.includes('store_offers');
  if(!user.company_has_pro_catalog)return null;
  return <div><label className="company-admin-check"><input type="checkbox" checked={value} disabled={busy||!eligible||callerId===user.user_id} onChange={async e=>{
    const wanted=e.target.checked;setBusy(true);setError('');
    try{await rpcWithStoredSession('set_store_catalog_user_net_price_access',{p_company_id:user.company_scope_id,p_user_id:user.user_id,p_can_view:wanted});setValue(wanted);publishManagedAccessChange({source:'company-admin-net-price',userId:user.user_id,companyId:user.company_scope_id});}
    catch(err){setError(err.message);}finally{setBusy(false);}
  }}/><span>Se «Din nto pris»<small>{callerId===user.user_id?'Din egen pristilgang styres av systemadministrator.':'Firmaets rabattberegnede proffpris. Endringen lagres med en gang.'}</small></span></label>{error&&<p role="alert">{error}</p>}</div>;
}

export default function CompanyAdminPanel({authUser}) {
  const [snapshot,setSnapshot]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [email,setEmail]=useState(''),[role,setRole]=useState('ansatt'),[busy,setBusy]=useState(false),[search,setSearch]=useState('');
  const generation=useRef(0),scope=useRef(null),alive=useRef(true),operation=useRef(false);
  const load=async(clear=false)=>{
    const ticket=++generation.current;setLoading(true);setError('');
    if(clear){scope.current=null;setSnapshot(null);setEmail('');setRole('ansatt');setMessage('');}
    try{
      const result=await companyAdminRpc('snapshot');
      if(!alive.current||ticket!==generation.current)return;
      if(result?.caller_id!==authUser?.id||!result.company_id)throw Error('Innlogging eller firma er endret. Hent på nytt.');
      if(scope.current&&scope.current!==result.company_id){setEmail('');setRole('ansatt');setMessage('');}
      scope.current=result.company_id;setSnapshot(result);
    }catch(err){if(alive.current&&ticket===generation.current){scope.current=null;setSnapshot(null);setError(err.message);}}
    finally{if(alive.current&&ticket===generation.current)setLoading(false);}
  };
  useEffect(()=>{
    alive.current=true;load(true);
    const refresh=e=>{
      if(e.type===MANAGED_ACCESS_EVENT&&e.detail?.source==='people-module-access')return;
      if(e.type===WORK_PROFILE_EVENT){load(true);return;}
      if(document.visibilityState==='hidden'){++generation.current;scope.current=null;setSnapshot(null);setLoading(true);return;}
      load();
    };
    const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];
    events.forEach(n=>window.addEventListener(n,refresh));document.addEventListener('visibilitychange',refresh);
    return()=>{alive.current=false;++generation.current;events.forEach(n=>window.removeEventListener(n,refresh));document.removeEventListener('visibilitychange',refresh);};
  },[authUser?.id]);

  const current=snapshot?.caller_id===authUser?.id?snapshot:null;
  const run=async(action,success)=>{
    if(operation.current||!current||loading)return;
    operation.current=true;setBusy(true);setError('');setMessage('');
    const ticket=generation.current,companyId=current.company_id;
    try{
      const result=await action(companyId);
      if(!alive.current||ticket!==generation.current||scope.current!==companyId)return;
      setMessage(typeof success==='function'?success(result):success);
      await load();
      publishManagedAccessChange({source:'company-admin',companyId});
    }catch(err){if(alive.current&&ticket===generation.current)setError(err.message);}
    finally{operation.current=false;if(alive.current)setBusy(false);}
  };
  const controls=user=><div className="company-admin-controls">
    <label>Rolle i {current.company_name}<select aria-label={`Rolle for ${user.email}`} value={user.company_role} disabled={!user.can_edit_role||busy||loading} onChange={e=>{
      const wanted=e.target.value;
      if(window.confirm(`Endre rollen for ${user.email} i ${current.company_name}? Endringen lagres med en gang.`))
        run(c=>companyAdminRpc('set_role',{p_company_id:c,p_user_id:user.id,p_expected_role:user.company_role,p_role:wanted}),'Rollen er lagret.');
    }}><option value="ansatt">Ansatt</option><option value="firmaadmin">Firmaadmin</option></select></label>
    {current.is_systemadmin&&user.id!==current.caller_id&&user.system_role!=='systemadmin'&&<button type="button" className="secondary" disabled={busy||loading} onClick={()=>{
      if(window.confirm(`${user.deactivated?'Reaktiver':'Deaktiver'} kontoen til ${user.email}? Kontostatus gjelder alle firmaer. Historikken beholdes.`))
        run(c=>companyAdminRpc('set_status',{p_company_id:c,p_user_id:user.id,p_expected:{approved:user.approved,deactivated:user.deactivated},p_deactivated:!user.deactivated}),'Kontostatus er lagret.');
    }}>{user.deactivated?'Reaktiver konto':'Deaktiver konto'}</button>}
  </div>;
  const users=(current?.users||[]).filter(u=>`${u.email} ${u.name}`.toLocaleLowerCase('nb-NO').includes(search.toLocaleLowerCase('nb-NO')));
  return <div data-company-admin="unified" className="company-admin-panel">
    <div className="item"><h3>Firmaadministrasjon</h3>
      {current?<><h4>{current.company_name}</h4><p>Invitasjoner og firmaroller nedenfor gjelder {current.company_name}. Velg et annet firma i firmavalget øverst for å administrere det.</p></>:null}
      <button type="button" className="secondary" disabled={loading||busy} onClick={()=>load()}>{loading?'Henter firmaoversikt …':'Oppdater firmaoversikt'}</button>
    </div>
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    {current&&<fieldset disabled={loading||busy} key={current.company_id}>
      <form className="item" onSubmit={e=>{
        e.preventDefault();const wanted=email.trim();
        run(async c=>{
          const invitation=await companyAdminRpc('invite',{p_company_id:c,p_email:wanted,p_role:role});
          if(invitation.company_id!==c)throw Error('Firmaet er endret. Hent på nytt.');
          if(!invitation.accepted){
            try{await sendCompanyInvitation(invitation,current.caller_id);return 'Invitasjonen er registrert og sendt.';}
            catch(err){return `Invitasjonen er registrert, men e-posten ble ikke sendt: ${err.message} Be den ansatte registrere seg med samme e-postadresse.`;}
          }
          return 'Brukeren er lagt til. Primærfirma og historikk er beholdt.';
        },result=>{setEmail('');setRole('ansatt');return result;});
      }}><h3>Legg til ansatt i {current.company_name}</h3>
        <p>Inviter den ansatte med e-post. Når brukeren er registrert, velger du tilganger på brukerkortet nedenfor.</p>
        <div className="company-admin-grid"><label>E-post<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="navn@firma.no"/></label>
          <label>Rolle<select value={role} onChange={e=>setRole(e.target.value)}><option value="ansatt">Ansatt</option><option value="firmaadmin">Firmaadmin</option></select></label></div>
        <button disabled={!email.trim()||busy} type="submit">{busy?'Behandler …':'Inviter ansatt'}</button>
      </form>
      <div className="item"><h3>Brukere og tilganger</h3><p>Velg rolle og moduler på den ansatte. Rolle lagres når du bekrefter. Modulvalg lagres med knappen under valgene. KS/HMS og HR må først være aktivert på firmaet.</p>
        <label>Søk etter ansatt<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Navn eller e-post"/></label>
        <div className="company-admin-users">{users.map(user=>{
          const core=user.core_access;
          const content=<><p className="note">{user.name&&<b>{user.name} · </b>}{user.is_primary?'Primærfirma':'Ekstra arbeidsfirma'}: {current.company_name}{!user.is_primary?` · Primærfirma: ${user.company_name}`:''}</p>{controls(user)}</>;
          return <div key={current.company_id+':'+user.id}>
            {core?<><p className="note">Hovedmodulene gjelder brukerkontoen. KS/HMS og HR nedenfor gjelder {current.company_name}.</p>
              <UserAccessRow user={core} isSystemAdmin={current.is_systemadmin} currentUserId={current.caller_id} callerModuleKeys={current.caller_module_keys} peopleCompanyId={current.company_id} headerContent={content} onSaved={()=>load()}>
                {core.company_scope_id===current.company_id&&<NetPriceAccess user={core} callerId={current.caller_id}/>}</UserAccessRow></>:
              <article className="item"><strong>{user.email}</strong><p>{user.deactivated?'Deaktivert':user.approved?'Aktiv':'Venter på godkjenning'}</p>{content}<PeopleModuleAccess companyId={current.company_id} userId={user.id}/><p className="note">Hovedmoduler og kontostatus administreres fra primærfirmaet eller av systemadministrator.</p></article>}
          </div>;
        })}{!users.length&&<p>Ingen brukere funnet i dette firmaet.</p>}</div>
      </div>
      {!!current.invites?.length&&<div className="item"><h3>Inviterte brukere</h3><p>Disse venter på registrering. Tilganger velges på brukerkortet etter registrering.</p>{current.invites.map(i=><p key={i.id}><b>{i.email}</b> · {i.company_role==='firmaadmin'?'Firmaadmin':'Ansatt'} · Venter på registrering</p>)}</div>}
    </fieldset>}
  </div>;
}
