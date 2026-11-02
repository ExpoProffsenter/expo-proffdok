import React, {useEffect, useRef, useState} from 'react';
import {UserAccessRow} from '../access/moduleAccessUx.jsx';
import PeopleModuleAccess from '../access/PeopleModuleAccess.jsx';
import {MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, MODULE_CATALOG, publishManagedAccessChange, rpcWithStoredSession} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {companyAdminRpc, sendCompanyInvitation} from './companyAdminClient.js';
import './CompanyAdminPanel.css';
import BoligAccessPanel from '../bolig/BoligAccessPanel.jsx';
import WorkspaceDisclosure from '../ui/WorkspaceDisclosure.jsx';

function defaultInviteAccess(options={}) {
  const allowed=options.allowed_modules||[];
  return {module_keys:options.store_offers?['sales','store_offers']:allowed.includes('sales')?['sales']:allowed.includes('projects')?['projects']:[],kshms:false,hr:false,kshms_role:'reader'};
}

function InviteAccessChoices({options,role,value,onChange}) {
  if(!options)return <p role="status">Hent firmaoversikten for å velge tilganger.</p>;
  const inherited=role==='firmaadmin';
  return <div className="company-invite-access"><h4>Tilganger ved invitasjon</h4>
    <p>Velg hva en ny bruker skal få tilgang til. Du kan endre valgene på brukerkortet senere.</p>
    <div className="company-invite-modules">{MODULE_CATALOG.map(m=>{
      const fixed=m.key==='store_offers'||(m.key==='sales'&&options.store_offers);
      const allowed=options.allowed_modules?.includes(m.key);
      return <label className="company-admin-check" key={m.key}><input type="checkbox" checked={value.module_keys.includes(m.key)} disabled={fixed||(!allowed&&!value.module_keys.includes(m.key))} onChange={e=>onChange({...value,module_keys:e.target.checked?[...value.module_keys,m.key]:value.module_keys.filter(k=>k!==m.key)})}/><span>{m.key==='store_offers'?'Generelle tilbud / Proff vareregister':m.label}<small>{fixed?'Styres av firmaets avtale.':!allowed?'Du har ikke tilgang til å tildele denne modulen.':m.description}</small></span></label>;
    })}
    {['kshms','hr'].map(k=><label className="company-admin-check" key={k}><input type="checkbox" checked={inherited?!!options[k]:value[k]} disabled={inherited||(!options[k]&&!value[k])} onChange={e=>onChange({...value,[k]:e.target.checked})}/><span>{k==='hr'?'HR':'KS/HMS'}<small>{!options[k]?'Ikke aktivert på firmaet.':inherited?'Firmaadmin har tilgang gjennom rollen.':'Tilgang i dette firmaet.'}</small></span></label>)}</div>
    {!inherited&&value.kshms&&<label>KS/HMS-rolle ved invitasjon<select value={value.kshms_role} onChange={e=>onChange({...value,kshms_role:e.target.value})}><option value="reader">Medarbeider – lese og utføre</option><option value="responsible">KS/HMS-ansvarlig – forvalte og godkjenne</option></select></label>}
    <p className="note">KS/HMS og HR gjelder dette firmaet. Med HR valgt opprettes medarbeideren automatisk i firmaets HR-register når brukeren er aktiv og registeret er satt opp. En registrert leder i firmakartet beholdes; ellers velger du nærmeste leder i HR etterpå. HR-innsyn følger medarbeider- og ledertilknytningen. Hvis kontoen finnes fra før, beholdes eksisterende hovedmoduler; KS/HMS og HR følger valgene her.</p>
  </div>;
}

function invitationSummary(access) {
  if(!access)return 'Tilganger velges på brukerkortet etter registrering.';
  const labels=MODULE_CATALOG.filter(m=>access.module_keys?.includes(m.key)).map(m=>m.shortLabel);
  if(access.kshms)labels.push(access.kshms_role==='responsible'?'KS/HMS-ansvarlig':'KS/HMS');
  if(access.hr)labels.push('HR');
  return labels.length?labels.join(' · '):'Ingen individuelle moduler valgt.';
}

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
  const [accessDraft,setAccessDraft]=useState(null);
  const [resendFeedback,setResendFeedback]=useState(null);
  const [panel,setPanel]=useState(null);
  const generation=useRef(0),scope=useRef(null),alive=useRef(true),operation=useRef(false);
  const load=async(clear=false)=>{
    const ticket=++generation.current;setLoading(true);setError('');
    if(clear){scope.current=null;setSnapshot(null);setEmail('');setRole('ansatt');setAccessDraft(null);setMessage('');setResendFeedback(null);}
    try{
      const result=await companyAdminRpc('snapshot');
      if(!alive.current||ticket!==generation.current)return;
      if(result?.caller_id!==authUser?.id||!result.company_id)throw Error('Innlogging eller firma er endret. Hent på nytt.');
      if(scope.current&&scope.current!==result.company_id){setEmail('');setRole('ansatt');setAccessDraft(null);setMessage('');setResendFeedback(null);}
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
  useEffect(()=>setPanel(null),[current?.company_id,authUser?.id]);
  const panelOpen=key=>Boolean(current&&panel?.companyId===current.company_id&&panel?.key===key);
  const showPanel=(key,open)=>setPanel(old=>open?{companyId:current.company_id,key}:old?.key===key&&old?.companyId===current?.company_id?null:old);
  const panelFeedback=<>{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}</>;
  const inviteAccess=accessDraft&&accessDraft.companyId===current?.company_id?accessDraft.value:defaultInviteAccess(current?.invite_options);
  const run=async(action,success,onFailure)=>{
    if(operation.current||!current||loading)return;
    operation.current=true;setBusy(true);setError('');setMessage('');
    const ticket=generation.current,companyId=current.company_id;
    try{
      const result=await action(companyId,()=>alive.current&&ticket===generation.current&&scope.current===companyId);
      if(!alive.current||ticket!==generation.current||scope.current!==companyId)return;
      setMessage(typeof success==='function'?success(result):success);
      await load();
      publishManagedAccessChange({source:'company-admin',companyId});
    }catch(err){if(alive.current&&ticket===generation.current){setError(err.message);onFailure?.(err);}}
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
    <div className="item company-admin-heading"><h3>Firma<wbr/>administrasjon</h3>
      {current?<><h4>{current.company_name}</h4><p>Administrer ansatte, roller og tilganger.{current.can_switch_company?' Bytt firma i firmavalget øverst.':' Du administrerer bare ditt eget firma.'}</p></>:null}
      <button type="button" className="secondary" disabled={loading||busy} onClick={()=>load()}>{loading?'Henter firmaoversikt …':'Oppdater firmaoversikt'}</button>
    </div>
    {!panelOpen(panel?.key)&&panelFeedback}
    {current&&<fieldset className="company-admin-body" disabled={loading||busy} key={current.company_id}>
      <div className="company-admin-actions" aria-label="Firmahandlinger">
      <WorkspaceDisclosure className="company-invite-disclosure" label="Inviter en ansatt" title={`Legg til ansatt i ${current.company_name}`} subtitle="FIRMAADMIN / INVITASJON" open={panelOpen('invite')} onOpenChange={open=>showPanel('invite',open)} disabled={loading||busy} contentClassName="company-admin-panel company-admin-panel-content">{panelOpen('invite')&&panelFeedback}<form className="item company-admin-invite-form" onSubmit={e=>{
        e.preventDefault();const wanted=email.trim();
        run(async (c,stillCurrent)=>{
          const chosen={...inviteAccess,...(role==='firmaadmin'?{kshms:!!current.invite_options?.kshms,hr:!!current.invite_options?.hr}:{})};
          const invitation=await companyAdminRpc('invite_with_access',{p_company_id:c,p_email:wanted,p_role:role,p_access:chosen});
          if(invitation.company_id!==c)throw Error('Firmaet er endret. Hent på nytt.');
          if(!invitation.accepted){
            try{await sendCompanyInvitation(invitation,current.caller_id,stillCurrent);return 'Invitasjonen er registrert og sendt.';}
            catch(err){return `Invitasjonen er registrert, men e-posten ble ikke sendt: ${err.message} Be den ansatte registrere seg med samme e-postadresse.`;}
          }
          return 'Brukeren er lagt til med valgte firmatilganger. Eksisterende hovedmoduler, primærfirma og historikk er beholdt.';
        },result=>{setEmail('');setRole('ansatt');setAccessDraft(null);return result;});
      }}><h3>Legg til ansatt i {current.company_name}</h3>
        <p>Fyll inn e-post, velg rolle og tilganger, og trykk Inviter ansatt. En ny bruker får valgene når registreringen er bekreftet.</p>
        <div className="company-admin-grid"><label>E-post<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="navn@firma.no"/></label>
          <label>Rolle<select aria-label="Rolle ved invitasjon" value={role} onChange={e=>setRole(e.target.value)}><option value="ansatt">Ansatt</option><option value="firmaadmin">Firmaadmin</option></select></label></div>
        <InviteAccessChoices options={current.invite_options} role={role} value={inviteAccess} onChange={value=>setAccessDraft({companyId:current.company_id,value})}/>
        <button disabled={!email.trim()||busy||!current.invite_options} type="submit">{busy?'Behandler …':'Inviter ansatt'}</button>
      </form></WorkspaceDisclosure>
      <WorkspaceDisclosure className="company-admin-housing" key={'housing:'+current.company_id} label="Boligprosjekter – brukertilgang" title="Boligprosjekter – brukertilgang" subtitle={current.company_name} open={panelOpen('housing')} onOpenChange={open=>showPanel('housing',open)} disabled={loading||busy} contentClassName="company-admin-panel company-admin-panel-content company-housing-panel"><BoligAccessPanel userId={authUser.id} mode="company" expectedCompanyId={current.company_id}/></WorkspaceDisclosure>
      </div>
      <div className="item company-admin-directory"><div className="company-admin-directory-toolbar"><div><h3>Brukere og tilganger</h3><p>{users.length} av {current.users?.length||0} brukere · Åpne en ansatt for å endre rolle og tilganger.</p></div>
        <label>Søk etter ansatt<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Navn eller e-post"/></label>
        </div>
        <div className="company-admin-list-head" aria-hidden="true"><span>Ansatt</span><span>Rolle</span><span>Status</span><span/></div>
        <div className="company-admin-users">{users.map(user=>{
          const core=user.core_access;
          const content=<><p className="note">{user.name&&<b>{user.name} · </b>}{user.is_primary?'Primærfirma':'Ekstra arbeidsfirma'}: {current.company_name}{!user.is_primary?` · Primærfirma: ${user.company_name}`:''}</p>{controls(user)}</>;
          return <WorkspaceDisclosure className="company-user-disclosure" key={current.company_id+':'+user.id} label={<span className="company-user-summary"><span className="company-user-identity"><strong>{user.name||user.email}</strong>{user.name&&<small>{user.email}</small>}</span><span className="company-user-role">{user.company_role==='firmaadmin'?'Firmaadmin':'Ansatt'}</span><span className="company-user-status" data-status={user.deactivated?'inactive':user.approved?'active':'pending'}>{user.deactivated?'Deaktivert':user.approved?'Aktiv':'Venter på godkjenning'}</span></span>} title={user.name||user.email} subtitle={`FIRMAADMIN / ${current.company_name}`} open={panelOpen(user.id)} onOpenChange={open=>showPanel(user.id,open)} disabled={loading||busy} contentClassName="company-admin-panel company-admin-panel-content">{panelOpen(user.id)&&panelFeedback}<p className="note">Rolle lagres når du bekrefter. Modulvalg lagres med knappen under valgene. KS/HMS og HR må først være aktivert på firmaet.</p>
            {core?<><p className="note">Hovedmodulene gjelder brukerkontoen. KS/HMS og HR nedenfor gjelder {current.company_name}.</p>
              <UserAccessRow user={core} isSystemAdmin={current.is_systemadmin} currentUserId={current.caller_id} callerModuleKeys={current.caller_module_keys} peopleCompanyId={current.company_id} headerContent={content} onSaved={()=>load()}>
                {core.company_scope_id===current.company_id&&<NetPriceAccess user={core} callerId={current.caller_id}/>}</UserAccessRow></>:
              <article className="item"><strong>{user.email}</strong><p>{user.deactivated?'Deaktivert':user.approved?'Aktiv':'Venter på godkjenning'}</p>{content}<PeopleModuleAccess companyId={current.company_id} userId={user.id}/><p className="note">Hovedmoduler og kontostatus administreres fra primærfirmaet eller av systemadministrator.</p></article>}
          </WorkspaceDisclosure>;
        })}{!users.length&&<p>Ingen brukere funnet i dette firmaet.</p>}</div>
      </div>
      {!!current.invites?.length&&<div className="item company-admin-invitations"><h3>Inviterte brukere</h3><p>Disse venter på registrering. Send invitasjonen på nytt hvis den ansatte ikke har kommet i gang. Rolle og tilganger beholdes.</p>{current.invites.map(i=><div key={i.id}><p><b>{i.email}</b> · {i.company_role==='firmaadmin'?'Firmaadmin':'Ansatt'} · Venter på registrering</p><p className="note">{invitationSummary(i.access)}{i.company_role==='firmaadmin'?' · Firmaadmin arver firmaets aktiverte KS/HMS og HR.':''}</p>
        <button type="button" className="secondary" disabled={busy||loading} aria-label={`Send invitasjon på nytt til ${i.email}`} onClick={()=>{
          setResendFeedback(null);
          run(async(c,stillCurrent)=>{
            const invitation=await companyAdminRpc('resend_invite',{p_company_id:c,p_invite_id:i.id});
            if(invitation.company_id!==c||invitation.invitation_id!==i.id)throw Error('Firmaet eller invitasjonen er endret. Oppdater firmaoversikten.');
            await sendCompanyInvitation(invitation,current.caller_id,stillCurrent);
          },()=>{const text=`Invitasjonen til ${i.email} er sendt på nytt. Utsendingen er bekreftet av e-posttjenesten.`;setResendFeedback({id:i.id,text});return text;},err=>setResendFeedback({id:i.id,text:`E-posten ble ikke sendt: ${err.message} Du kan prøve igjen.`}));
        }}>Send invitasjon på nytt</button>
        {resendFeedback?.id===i.id&&<p className="note" aria-live="polite">{resendFeedback.text}</p>}
      </div>)}</div>}
    </fieldset>}
  </div>;
}

