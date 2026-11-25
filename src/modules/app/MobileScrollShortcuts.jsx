import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowUp,ArrowDown} from 'lucide-react';
import './mobileScrollShortcuts.css';

export default function MobileScrollShortcuts(){
 const anchor=useRef(null),[visible,setVisible]=useState(false),[middle,setMiddle]=useState(null),[toolbar,setToolbar]=useState(false);
 const scrollTarget=()=>{
  let target=anchor.current?.parentElement;
  while(target&&target!==document.body){
   if(/auto|scroll/.test(getComputedStyle(target).overflowY)&&target.scrollHeight>target.clientHeight+40)return target;
   target=target.parentElement;
  }
  return document.scrollingElement||document.documentElement;
 };
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 760px)');
  const update=()=>{
   const root=scrollTarget();
   const editing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
   const viewport=window.visualViewport;
   const height=root===document.scrollingElement||root===document.documentElement?Math.max(root.scrollHeight,document.body.scrollHeight):root.scrollHeight;
   setVisible(media.matches&&!editing&&height>Math.min(root.clientHeight||window.innerHeight,window.innerHeight)+40);
   setToolbar(Boolean(document.querySelector('vercel-live-feedback')));
   setMiddle(viewport?viewport.offsetTop+viewport.height/2:window.innerHeight/2);
  };
  update();const observer=new ResizeObserver(update);observer.observe(document.body);observer.observe(document.documentElement);
  const mutations=new MutationObserver(update);mutations.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',update);window.addEventListener('scroll',update,{passive:true});document.addEventListener('toggle',update,true);document.addEventListener('focusin',update);document.addEventListener('focusout',update);window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);
  return()=>{observer.disconnect();mutations.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update);document.removeEventListener('toggle',update,true);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);window.visualViewport?.removeEventListener('resize',update);window.visualViewport?.removeEventListener('scroll',update);};
 },[]);
 const jump=end=>{const scroll=scrollTarget();const options={top:end?Math.max(scroll.scrollHeight,scroll===document.scrollingElement?document.body.scrollHeight:0):0,behavior:'instant'};if(scroll===document.scrollingElement||scroll===document.documentElement)window.scrollTo(options);else scroll.scrollTo(options);};
 return <><span ref={anchor} hidden/>{visible?createPortal(<nav className="sales-scroll-shortcuts" data-preview-toolbar={toolbar?"true":undefined} style={{top:middle??"50%"}} aria-label="Snarveier for scrolling"><button type="button" aria-label="Til toppen" title="Til toppen" onClick={()=>jump(false)}><ArrowUp size={16}/></button><button type="button" aria-label="Til bunnen" title="Til bunnen" onClick={()=>jump(true)}><ArrowDown size={16}/></button></nav>,document.body):null}</>;
}
