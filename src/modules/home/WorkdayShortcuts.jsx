import React,{useState} from 'react';

export default function WorkdayShortcuts({canPersonal,canHr,canKshms,onPersonal,onHr,onKshms}) {
  const [focus,setFocus]=useState('personal');
  const choices=[...(canPersonal?[['personal','Min arbeidsdag',onPersonal,'Timer, planer og egne oppfølginger']]:[]),...(canKshms?[['safety','KS/HMS',onKshms,'Rutiner, SJA, kontroller og avvik']]:[]),...(canHr?[['lead','HR og ledelse',onHr,'Medarbeidere, samtaler og timekontroll']]:[])];
  if(!choices.length)return null;
  const selected=choices.find(([id])=>id===focus)||choices[0];
  return <aside className="ux-preview ux-workday-shortcuts" aria-label="Snarveier til arbeidsdagen"><div className="ux-toolbar"><label>Hva skal du gjøre?<select value={selected[0]} onChange={e=>setFocus(e.target.value)}>{choices.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><button type="button" className="secondary" onClick={selected[2]}>Åpne {selected[1]}</button><span>{selected[3]}</span></div></aside>;
}
