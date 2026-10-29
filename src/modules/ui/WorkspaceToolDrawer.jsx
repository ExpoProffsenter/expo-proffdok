import React,{useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {PanelsTopLeft,ArrowRight,Maximize2,X} from 'lucide-react';
import './workspaceTools.css';

export default function WorkspaceToolDrawer(props){
 const dialog=useRef(null),[wide,setWide]=useState(false),[editorTools,setEditorTools]=useState([]);
 const titleId=useId();
 const groups=props.actionGroups||[];
 useEffect(()=>{const node=dialog.current;return()=>{if(node?.open)node.close();};},[]);
 useEffect(()=>{if(dialog.current?.open)dialog.current.close();},[props.tab,props.scopeKey,props.contextKey,props.projectWorkspace]);
 const run=callback=>{if(dialog.current?.open)dialog.current.close();callback?.();};
 const open=()=>{
  const shortcuts=props.getAdditionalActions?.()||[];
  setEditorTools(shortcuts);setWide(false);dialog.current?.showModal();
 };
 const title=props.contextTitle||'Arbeidsrom';
 return <>
  <div className={`pd-workspace-tool-row ${props.rowClassName||''}`}><span>{props.rowLabel||'Arbeidsrom'} <span aria-hidden="true">›</span> {title}</span><button type="button" className="secondary" onClick={open}><PanelsTopLeft size={17} aria-hidden="true"/>Verktøy og maler</button></div>
  {createPortal(<dialog ref={dialog} className={`pd-workspace-drawer${wide?' is-wide':''}`} aria-labelledby={titleId} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <div className="pd-workspace-drawer-inner">
    <div className="pd-workspace-drawer-header"><div><span>EXPO PROFFDOK / ARBEIDSVERKTØY</span><h2 id={titleId}>{title}</h2></div><div><button type="button" aria-label={wide?'Reduser arbeidsflaten':'Utvid arbeidsflaten'} aria-pressed={wide} onClick={()=>setWide(value=>!value)}><Maximize2 size={19}/></button><button type="button" aria-label="Lukk arbeidsverktøy" onClick={()=>dialog.current?.close()}><X size={21}/></button></div></div>
    <div className="pd-workspace-drawer-body">
     <p>Velg en handling. Arbeidet ditt blir stående når du lukker panelet.</p>
     {editorTools.length>0&&<section><h3>Tilbudsmaler</h3><p>Bruk en firmamal i tilbudskladden, gjør endringer og lagre som mal med ønsket navn.</p>{editorTools.map(action=><button key={action.label} type="button" className="pd-workspace-tool-action" onClick={()=>run(action.onClick)}>{action.label}<ArrowRight size={17}/></button>)}</section>}
     {groups.map(group=><section key={group.id}><h3>{group.title}</h3><p>{group.description}</p>{group.actions.map(action=><button key={action.label} type="button" className="pd-workspace-tool-action" disabled={action.disabled} onClick={()=>run(action.onClick)}>{action.label}<ArrowRight size={17} aria-hidden="true"/></button>)}</section>)}
    </div>
    <div className="pd-workspace-drawer-footer"><button type="button" onClick={()=>dialog.current?.close()}>Tilbake til arbeidet</button></div>
   </div>
  </dialog>,document.body)}
 </>;
}
