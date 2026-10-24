import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import Contracts from '../../src/modules/bolig/BoligContracts.jsx';
import '../../src/style.css';
import '../../src/modules/bolig/bolig.css';
const cfg=window.__qaConfig;
window.__qaActor='owner';
window.__client={supabaseUrl:location.origin,auth:{getSession:async()=>({data:{session:{user:{id:cfg[window.__qaActor]},access_token:'qa-'+window.__qaActor}}})},rpc:async(name,args)=>{
 const r=await fetch('/rpc',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer qa-'+window.__qaActor},body:JSON.stringify(args)});return r.json();
}};
const App=()=>{
 const [actor,setActor]=useState('owner'),[visible,setVisible]=useState(true);window.__qaSwitch=value=>{window.__qaActor=value;setActor(value);};window.__qaShow=setVisible;
 return <main>{visible?<Contracts key={actor} context={{company_id:cfg.company,user_id:cfg[actor],role:actor==='reader'?'reader':'manager',enabled:true}} root={cfg.root}/>:<p>QA annet arbeidsområde</p>}</main>;
};
createRoot(document.getElementById('app')).render(<App/>);
