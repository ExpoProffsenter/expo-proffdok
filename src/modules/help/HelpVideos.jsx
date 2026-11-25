import React,{useEffect,useRef,useState} from 'react';
import {Play,Film,Maximize2} from 'lucide-react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import {searchVideoGuides,videoTime} from './videoGuides.mjs';
import './helpVideos.css';

function VideoPlayer({guide,onClose}){
 const dialog=useRef(null),video=useRef(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0),[fullscreenError,setFullscreenError]=useState('');
 useEffect(()=>{const node=dialog.current;node.showModal();return()=>{if(node.open)node.close();};},[]);
 useEffect(()=>{const node=video.current;return()=>{node?.pause();node?.removeAttribute('src');node?.load();};},[attempt]);
 const retry=()=>{setReady(false);setFailed(false);setAttempt(value=>value+1);};
 return <WorkspacePanel dialogRef={dialog} title={guide.title} subtitle={`${guide.module.toLocaleUpperCase('nb-NO')} / VIDEOVEILEDNING`} className="help-video-player" wide closeLabel="Lukk video" onCancel={event=>event.stopPropagation()} onClose={event=>{event.stopPropagation();onClose();}} footer={<button type="button" onClick={()=>dialog.current.close()}>Tilbake til veiledningen</button>}>
  <p>{guide.description}</p>
  <video key={attempt} ref={video} src={guide.src} controls playsInline preload="metadata" aria-label={guide.title} onLoadedMetadata={()=>setReady(true)} onError={()=>{setFailed(true);setReady(false);}}>
   <track kind="chapters" src={guide.track} srcLang="nb" label="Kapitler" default/>
   Nettleseren kan ikke spille filmen. Les stegene nedenfor.
  </video>
  <div className="help-video-actions"><span>{videoTime(guide.duration)} · Uten lyd</span><button type="button" onClick={async()=>{try{await video.current.requestFullscreen();}catch{setFullscreenError('Bruk fullskjermknappen i videospilleren, eller utvid nettleservinduet.');}}}><Maximize2 size={18} aria-hidden="true"/>Fullskjerm</button></div>
  {fullscreenError&&<p role="status">{fullscreenError}</p>}
  {failed&&<div role="alert"><p>Filmen kunne ikke lastes. Prøv igjen, eller les stegene nedenfor. Teksthjelpen er fortsatt tilgjengelig.</p><button type="button" onClick={retry}>Prøv filmen igjen</button></div>}
  <h3>Kapitler</h3><p>Velg et kapittel for å hoppe i filmen. Trykk Spill av i videospilleren for å starte.</p>
  <ol className="help-video-chapters">{guide.chapters.map(chapter=><li key={chapter.start}><button type="button" disabled={!ready} onClick={()=>{video.current.currentTime=chapter.start;}}><time>{videoTime(chapter.start)}</time><span>{chapter.title}</span></button></li>)}</ol>
  <details className="help-video-transcript"><summary>Les filmens steg</summary><ol>{guide.chapters.map(chapter=><li key={chapter.start}><h4>{chapter.title}</h4><p>{chapter.text}</p></li>)}</ol></details>
 </WorkspacePanel>;
}

export function HelpVideoButton({guide,compact=false}){
 const [open,setOpen]=useState(false);
 return <><button type="button" className={`help-video-open${compact?' is-compact':''}`} aria-haspopup="dialog" onClick={()=>setOpen(true)}><Play size={19} aria-hidden="true"/><span>{compact?'Se video: ':''}{guide.title}</span><small>{videoTime(guide.duration)}</small></button>{open&&<VideoPlayer guide={guide} onClose={()=>setOpen(false)}/>}</>;
}

export function HelpVideoLibrary({guides,query='',onQueryChange}){
 const dialog=useRef(null);
 const [module,setModule]=useState('all');
 const modules=[...new Set(guides.map(guide=>guide.module))];
 const matches=searchVideoGuides(guides,query).filter(guide=>module==='all'||guide.module===module);
 if(!guides.length)return null;
 return <section className="help-video-library" aria-label="Videoveiledninger"><div><Film size={22} aria-hidden="true"/><span><strong>Se hvordan du gjør det</strong><small>Korte filmer med tekst, klikk og kapitler.</small></span><button type="button" className="help-video-open" aria-haspopup="dialog" onClick={()=>dialog.current.showModal()}>Vis videoer ({matches.length})</button></div>
  <WorkspacePanel dialogRef={dialog} title="Videoveiledninger" subtitle="HJELP / VIDEOER" className="help-video-index" closeLabel="Lukk videooversikten">
   <p>Velg oppgaven du trenger hjelp til. Filmene viser eksempler. Du kan alltid bruke teksthjelpen i stedet.</p>
   <label className="help-video-search">Søk i videoene<input type="search" value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="For eksempel planer eller prøvesamtale"/></label>
   <label className="help-video-search">Område<select value={module} onChange={event=>setModule(event.target.value)}><option value="all">Alle områder</option>{modules.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
   <p role="status">{matches.length?`${matches.length} ${matches.length===1?'video':'videoer'} passer søket.`:'Ingen videoer passer søket. Prøv et kortere søkeord, eller bruk teksthjelpen.'}</p>
   {!matches.length&&<button type="button" className="help-video-open" onClick={()=>{onQueryChange('');setModule('all');}}>Vis alle videoer</button>}
   <div className="help-video-cards">{matches.map(guide=><article key={guide.id}><span>{guide.module}</span><HelpVideoButton guide={guide}/><p>{guide.description}</p></article>)}</div>
  </WorkspacePanel>
 </section>;
}
