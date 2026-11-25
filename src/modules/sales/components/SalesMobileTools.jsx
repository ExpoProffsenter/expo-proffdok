import {useEffect,useRef,useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import {MOBILE_PREVIEW_EVENT} from '../services/salesMobilePreview.mjs';


export default function SalesMobileTools(){
 const [url,setUrl]=useState(''),closeRef=useRef(null),dialogRef=useRef(null),returnFocus=useRef(null);
 const close=()=>{dialogRef.current?.close();setUrl('');returnFocus.current?.focus?.({preventScroll:true});};
 useEffect(()=>{
  const open=event=>{const next=new URL(event.detail?.url||'',window.location.origin);if(next.origin!==window.location.origin||(!next.searchParams.has('offerPreview')&&!next.searchParams.has('publicOffer')))return;event.preventDefault();returnFocus.current=document.activeElement;setUrl(next.href);};
  window.addEventListener(MOBILE_PREVIEW_EVENT,open);return()=>window.removeEventListener(MOBILE_PREVIEW_EVENT,open);
 },[]);
 useEffect(()=>{if(!url)return;dialogRef.current?.showModal();closeRef.current?.focus();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[url]);
 return <>{url&&<dialog ref={dialogRef} className="sales-mobile-customer-preview" aria-label="Kundens tilbud" onCancel={event=>{event.preventDefault();close();}}><header><button ref={closeRef} type="button" onClick={close}><ArrowLeft size={18}/>Tilbake til tilbudet</button><span>Kundens visning</span></header><iframe src={url} title="Kundens tilbud"/></dialog>}</>;
}
