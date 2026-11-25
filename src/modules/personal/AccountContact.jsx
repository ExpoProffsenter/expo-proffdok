import React,{useEffect,useRef,useState} from 'react';
export default function AccountContact({authUser,supabaseClient}) {
 const metadata=authUser?.user_metadata||{};
 const savedName=String(metadata.full_name||metadata.name||'');
 const savedMobile=String(metadata.mobile||metadata.phone||'');
 const [name,setName]=useState(savedName),[mobile,setMobile]=useState(savedMobile),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
 const revision=useRef(0),busyRef=useRef(false),identity=useRef(authUser?.id);identity.current=authUser?.id;
 useEffect(()=>{setName(savedName);setMobile(savedMobile);setNotice('');setError('');},[authUser?.id,savedName,savedMobile]);
 useEffect(()=>{revision.current++;setBusy(false);busyRef.current=false;return()=>{revision.current++;};},[authUser?.id]);
 const save=async event=>{
  event.preventDefault();if(busyRef.current||!authUser?.id)return;
  const fullName=name.trim(),phone=mobile.trim(),id=authUser.id,ticket=++revision.current;
  if(fullName.length<3||!fullName.includes(' ')){setError('Skriv fornavn og etternavn.');return;}
  const current=()=>ticket===revision.current&&identity.current===id;
  setError('');setNotice('');setBusy(true);busyRef.current=true;
  try{
   const fresh=await supabaseClient.auth.getUser();
   if(fresh.error)throw fresh.error;
   if(!current()||fresh.data?.user?.id!==id)throw new Error('Innloggingen er endret. Åpne profilen på nytt.');
   const result=await supabaseClient.auth.updateUser({data:{...fresh.data.user.user_metadata,full_name:fullName,name:fullName,mobile:phone,phone}});
   if(result.error)throw result.error;
   if(result.data?.user?.id!==id)throw new Error('Innloggingen er endret. Åpne profilen på nytt.');
   if(current()&&result.data?.user?.id===id)setNotice('Kontaktopplysningene er lagret.');
  }catch(e){if(current())setError(e.message||'Kunne ikke lagre. Prøv igjen.');}
  finally{if(current()){setBusy(false);busyRef.current=false;}}
 };
 return <form className="personal-contact" onSubmit={save} aria-label="Dine kontaktopplysninger"><h3>Kontaktopplysninger</h3>
  <fieldset disabled={busy}><div className="personal-fields">
   <label>Fullt navn<input autoComplete="name" required maxLength={120} value={name} onChange={e=>{setName(e.target.value);setNotice('');}}/></label>
   <label>Mobilnummer<input type="tel" autoComplete="tel" maxLength={40} value={mobile} onChange={e=>{setMobile(e.target.value);setNotice('');}}/></label>
   <label className="personal-wide">E-postadresse<input type="email" autoComplete="email" value={authUser?.email||''} readOnly/><small>Dette er e-posten du logger inn med.</small></label>
  </div><button disabled={name.trim()===savedName.trim()&&mobile.trim()===savedMobile.trim()}>Lagre kontaktopplysninger</button></fieldset>
  {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
 </form>;
}
