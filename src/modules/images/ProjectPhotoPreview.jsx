import React,{useEffect,useRef,useState} from 'react';
import {Maximize2} from 'lucide-react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import './projectPhotos.css';

// A read-only view of the same supplied image. No upload, signing or project
// state belongs here. Unmounting/replacing the source removes its open panel.
export default function ProjectPhotoPreview({photo,children}){
 const [activeUrl,setActiveUrl]=useState(''),[wide,setWide]=useState(false);
 const dialog=useRef(null);
 const url=photo?.url||'';
 const title=photo?.comment||photo?.name||photo?.item||photo?.cat||photo?.category||'Prosjektbilde';
 const open=!!url&&activeUrl===url;
 useEffect(()=>{if(activeUrl&&activeUrl!==url)setActiveUrl('');},[url,activeUrl]);
 useEffect(()=>{
  const node=dialog.current;
  if(open)node?.showModal();
  return()=>{if(node?.open)node.close();};
 },[open]);
 if(!url)return null;
 return <>
  <button type="button" className="pd-project-photo-open" aria-label={`Åpne større bilde: ${title}`} aria-haspopup="dialog" onClick={event=>{event.stopPropagation();setWide(false);setActiveUrl(url);}}>
   <img src={url} alt={title} loading="lazy" draggable={false}/><span><Maximize2 size={16} aria-hidden="true"/>Vis større bilde</span>
  </button>
  {open&&<WorkspacePanel dialogRef={dialog} title={title} subtitle="PROSJEKT / BILDER" className="pd-project-photo-panel" wide={wide} onExpand={()=>setWide(value=>!value)} onClose={()=>setActiveUrl('')} closeLabel="Lukk bilde">
   <figure><img src={url} alt={title}/><figcaption>{title}</figcaption></figure>
   {children}
  </WorkspacePanel>}
 </>;
}
