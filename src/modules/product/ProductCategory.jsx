import React,{useId} from 'react';
import {ChevronDown,ChevronRight,LockKeyhole} from 'lucide-react';
import './productCategory.css';

// Category navigation only. Product values and commands remain with the caller.
export default function ProductCategory({title,count,open,locked,onToggle,children}) {
 const contentId=useId();
 const caption=`${count} ${locked?'brukt':'valgt'}`;
 return <section className={`product-category${open?' is-open':''}`} aria-label={title}>
  <h2>{locked?<span className="product-category-heading"><span>{title}</span><small><LockKeyhole size={16} aria-hidden="true"/>{caption}</small></span>:
   <button type="button" aria-label={`${open?'Lukk':'Åpne'} ${title}`} aria-expanded={open} aria-controls={contentId} onClick={onToggle}>
    {open?<ChevronDown size={19} aria-hidden="true"/>:<ChevronRight size={19} aria-hidden="true"/>}
    <span className="product-category-title">{title}</span><span className="product-category-count">{caption}</span><span className="product-category-action">{open?'Lukk':'Åpne'}</span>
   </button>}
  </h2>
  <div id={contentId} className="product-category-content" hidden={!open}>{open?children:null}</div>
 </section>;
}
