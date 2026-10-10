import React from 'react';
import './moduleWorkspace.css';

// Presentation only: the caller supplies its already-authorized module/role labels.
export default function ModuleHeading({className='',companyName,title,description,role,icon:Icon}) {
 return <header className={`${className} module-heading`}>
  <div className="module-heading-copy"><span className="module-eyebrow">{Icon&&<Icon size={16} aria-hidden="true"/>}{companyName||'Ditt firma'}</span><h2>{title}</h2><p>{description}</p></div>
  <div className="module-heading-side">{Icon&&<span className="module-heading-icon" aria-hidden="true"><Icon/></span>}<span className="module-role">{role}</span></div>
 </header>;
}
