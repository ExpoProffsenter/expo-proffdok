import React,{createContext,useContext,useState} from 'react';
import {ChevronDown,ChevronsUpDown,Search,FolderOpen} from 'lucide-react';

// View state only. All project data, searches and original action callbacks stay in the caller.
const ListDisplay=createContext({expanded:false,revision:0});

export function ProjectListLayout({children}) {
  const [display,setDisplay]=useState({expanded:false,revision:0});
  return <ListDisplay.Provider value={{...display,toggle:()=>setDisplay(value=>({expanded:!value.expanded,revision:value.revision+1}))}}>{children}</ListDisplay.Provider>;
}

export function ProjectListViewControls({children,visible,total}) {
  const display=useContext(ListDisplay);
  return <div className="projectListViewControls"><div className="projectListQuickFilters" role="group" aria-label="Prosjektutvalg">{children}</div><span className="projectListVisibleCount">{visible} av {total} prosjekter</span><button type="button" className="secondary projectListExpandAll" aria-pressed={display.expanded} onClick={display.toggle}><ChevronsUpDown size={16}/>{display.expanded?'Kollaps alle detaljer':'Vis alle detaljer'}</button></div>;
}

export function ProjectListFilters({children,activeLabel,controls}) {
  return <div className="projectListSearchPanel">{controls}<details className="projectListAdvancedFilters"><summary><span><Search size={16}/>Søk og filtre</span><small>{activeLabel}</small><ChevronDown className="projectListChevron" size={17}/></summary><div className="projectListFilterContent">{children}</div></details></div>;
}

export function ProjectListCardDisclosure({children,heading,onOpen,attention,className,style}) {
  const display=useContext(ListDisplay),[local,setLocal]=useState({revision:-1,open:false});
  const open=local.revision===display.revision?local.open:display.expanded;
  return <div className={className+' projectListDisclosureCard'} style={style}>
    <details open={open} onToggle={event=>{const next=event.currentTarget.open;setLocal(value=>value.revision===display.revision&&value.open===next?value:{revision:display.revision,open:next});}}>
      <summary>{heading}<span className="projectListDisclosureLine"><span className="projectListDisclosureLabel">{open?'Skjul detaljer':'Vis detaljer'}<ChevronDown className="projectListChevron" size={15}/></span>{attention&&<span className="projectListAttention">{attention}</span>}</span></summary>
      <div className="projectListDetailContent">{children}</div>
    </details>
    <button type="button" className="projectListPrimaryOpen" onClick={onOpen}><FolderOpen size={17} aria-hidden="true"/>Åpne</button>
  </div>;
}
