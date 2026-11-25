import React,{useRef,useState,useEffect} from 'react';
import {createPortal} from 'react-dom';
import {readBoligImage} from './boligImages.js';
import Portal from './BoligPortalPage.jsx';
import Dialog from './BoligEditorDialog.jsx';
import residentCss from './boligResident.css?inline';
import presentationCss from './boligPortalPresentation.css?inline';
import choicesCss from './boligPortalChoices.css?inline';
const page='<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body></body></html>';
export default function BoligPortalPreview({state,onClose}){
 const frame=useRef(null),[target,setTarget]=useState(null),[shown,setShown]=useState(null);
 useEffect(()=>{let live=true;setShown(null);const urls=[...new Set([...(state.offers||[]).flatMap(o=>o.goods||[]),...(state.agreements||[]).flatMap(d=>d.snapshot?.goods||[])].map(g=>g.image_url).filter(Boolean))];
 Promise.all(urls.map(async u=>[u,await readBoligImage(u).catch(()=>u)])).then(rows=>{if(!live)return;const map=new Map(rows),goods=g=>(g||[]).map(x=>({...x,image_url:map.get(x.image_url)||x.image_url})),doc=d=>d?{...d,snapshot:{...d.snapshot,goods:goods(d.snapshot.goods)}}:null;setShown({...state,offers:(state.offers||[]).map(o=>({...o,goods:goods(o.goods)})),agreements:(state.agreements||[]).map(doc),confirmation:doc(state.confirmation)});});return()=>{live=false;};},[state]);
 useEffect(()=>{if(target){const style=target.ownerDocument.createElement('style');style.textContent=residentCss+'\n'+presentationCss+'\n'+choicesCss;target.ownerDocument.head.append(style);return()=>style.remove();}},[target]);
 return <Dialog title="Se som beboer" onClose={onClose} className="bolig-portal-preview-dialog"><p>Skrivebeskyttet visning. Ingen valg, bestillinger eller meldinger kan sendes her.</p><iframe ref={frame} title="Beboerens portal – skrivebeskyttet" srcDoc={page} onLoad={()=>setTarget(frame.current?.contentDocument?.body)} style={{width:'100%',height:'75dvh',border:0}}/>{target&&shown&&createPortal(<Portal preview previewData={shown}/>,target)}</Dialog>;
}
