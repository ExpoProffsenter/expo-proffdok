import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,ArrowLeft} from 'lucide-react';
import {MOBILE_PREVIEW_EVENT} from '../services/salesMobilePreview.mjs';

export function SalesScrollShortcuts(){
 const ref=useRef(null),[visible,setVisible]=useState(false),[bottom,setBottom]=useState(12);
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 760px)');
  const update=()=>{
   const root=document.scrollingElement||document.documentElement;
   const editing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
   setVisible(media.matches&&!editing&&root.scrollHeight>window.innerHeight*1.5);
   const save=document.querySelector('.sales-offer-mobile-save');
   setBottom(save&&getComputedStyle(save).display!=='none'?Math.max(12,window.innerHeight-save.getBoundingClientRect().top+8):12);
  };
  update();const observer=new ResizeObserver(update);observer.observe(document.body);
  window.addEventListener('resize',update);document.addEventListener('focusin',update);document.addEventListener('focusout',update);
  return()=>{observer.disconnect();window.removeEventListener('resize',update);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);};
 },[]);
 const jump=end=>{
  let target=ref.current?.parentElement;
  while(target&&target!==document.body){if(/auto|scroll/.test(getComputedStyle(target).overflowY)&&target.scrollHeight>target.clientHeight)break;target=target.parentElement;}
  const scroll=target&&target!==document.body?target:(document.scrollingElement||document.documentElement);
  scroll.scrollTo({top:end?scroll.scrollHeight:0,behavior:'instant'});
 };
 return visible?<nav ref={ref} className="sales-scroll-shortcuts" style={{bottom}} aria-label="Snarveier for scrolling"><button type="button" aria-label="Til toppen" title="Til toppen" onClick={()=>jump(false)}><ArrowUp size={16}/></button><button type="button" aria-label="Til bunnen" title="Til bunnen" onClick={()=>jump(true)}><ArrowDown size={16}/></button></nav>:null;
}

export default function SalesMobileTools(){
 const [url,setUrl]=useState(''),closeRef=useRef(null),dialogRef=useRef(null),returnFocus=useRef(null);
 const close=()=>{dialogRef.current?.close();setUrl('');returnFocus.current?.focus?.({preventScroll:true});};
 useEffect(()=>{
  const open=event=>{const next=new URL(event.detail?.url||'',window.location.origin);if(next.origin!==window.location.origin||(!next.searchParams.has('offerPreview')&&!next.searchParams.has('publicOffer')))return;event.preventDefault();returnFocus.current=document.activeElement;setUrl(next.href);};
  window.addEventListener(MOBILE_PREVIEW_EVENT,open);return()=>window.removeEventListener(MOBILE_PREVIEW_EVENT,open);
 },[]);
 useEffect(()=>{if(!url)return;dialogRef.current?.showModal();closeRef.current?.focus();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[url]);
 return <><SalesScrollShortcuts/>{url&&<dialog ref={dialogRef} className="sales-mobile-customer-preview" aria-label="Kundens tilbud" onCancel={event=>{event.preventDefault();close();}}><header><button ref={closeRef} type="button" onClick={close}><ArrowLeft size={18}/>Tilbake til tilbudet</button><span>Kundens visning</span></header><iframe src={url} title="Kundens tilbud"/></dialog>}</>;
}
