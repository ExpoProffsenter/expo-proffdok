import {useState} from 'react';
export default function SalesOfferGroup({heading,children,className=''}){
 const [open,setOpen]=useState(()=>typeof window==='undefined'||!window.matchMedia?.('(max-width: 760px)').matches);
 return <details className={`sales-expandable-offer-group ${className}`} open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>{heading}<span className="sales-offer-group-toggle"><span className="sales-group-open">Åpne hovedpost</span><span className="sales-group-close">Lukk hovedpost</span></span></summary>{children}</details>;
}
