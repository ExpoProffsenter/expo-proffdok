import React from 'react';
import './checklistStatusChoices.css';

// Keep the established status values and the caller's save/deviation owner.
export default function ChecklistStatusChoices({value,allowNa=true,disabled=false,onChange,label='Svar på sjekkpunkt'}) {
 return <div className="checklistStatusButtons checklist-status-choices" role="group" aria-label={label}>
  {['Ok',...(allowNa?['Ikke aktuelt']:[]),'Avvik'].map(status=><button key={status} type="button" className="secondary checklist-status-choice" data-tone={status==='Avvik'?'deviation':'ok'} aria-pressed={value===status} disabled={disabled} onClick={()=>onChange(status)}>
   <span className="checklist-status-box" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="m4 10 4 4 8-9"/></svg></span><span>{status}</span>
  </button>)}
 </div>;
}
