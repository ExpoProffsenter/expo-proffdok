import React,{useState} from 'react';
import {Lightbulb} from 'lucide-react';
export default function HrTextSuggestion({label,text,value,onUse}) {
 const replaces=Boolean(value.trim()&&value.trim()!==text);
 const [replaceValue,setReplaceValue]=useState(null);
 const confirm=replaces&&replaceValue===value;
 return <details className="hr-suggestion"><summary><Lightbulb size={16} aria-hidden="true"/>Tekstforslag: {label}</summary>
  <p>{text}</p><p className="hr-hint">Tilpass forslaget til firmaet. Det lagres først med «Lagre HR-oppsett».</p>
  {confirm?<><p>Forslaget erstatter teksten i feltet. Den lagrede teksten endres først når du lagrer oppsettet.</p><div className="hr-review-options"><button type="button" onClick={()=>{onUse(text);setReplaceValue(null);}}>Erstatt teksten</button><button type="button" className="secondary" onClick={()=>setReplaceValue(null)}>Behold min tekst</button></div></>:<button type="button" className="secondary" onClick={()=>{if(replaces)setReplaceValue(value);else onUse(text);}}>Bruk forslag til {label}</button>}
 </details>;
}
