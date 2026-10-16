import React from 'react';
import {MessageSquare,ArrowRight} from 'lucide-react';
import {useSupportOverview} from './supportOverview.js';
import './support.css';
export default function SupportSummary({supabaseClient,authUser,onOpen,admin=false,companyId=null}){
 const {value,loading}=useSupportOverview(supabaseClient,authUser?.id,admin,companyId);
 return <section className="pd-support-summary" aria-label={admin?'Supportoversikt':'Mine supportsvar'}>
  <span className="pd-support-summary-icon"><MessageSquare aria-hidden="true"/></span>
  <div><span className="pd-support-eyebrow">{admin?'OPPFØLGING':'DIALOG MED PROFFDOK'}</span>
   <h3>{value?.unread?admin?`${value.unread} ${value.unread===1?'ulest supportsak':'uleste supportsaker'}`:`${value.unread} ${value.unread===1?'sak':'saker'} med nytt svar` :admin?'Supportsaker':'Mine supportsaker'}</h3>
   <p>{loading?'Henter supportstatus …':value?admin?`${value.new} nye · ${value.working} under behandling · ${value.solved} løst`:value.unread?'Du har fått svar fra support. Åpne saken for å lese og svare.':`${value.total} saker · Send en henvendelse eller fortsett en samtale.`:'Åpne Support for å se sakene dine.'}</p>
  </div>
  <button type="button" className="secondary" onClick={()=>onOpen?.(!admin?value?.latest_unread:null)}>{admin?'Åpne innboksen':value?.latest_unread?'Åpne nyeste svar':'Åpne Support'}<ArrowRight size={16} aria-hidden="true"/></button>
 </section>;
}
