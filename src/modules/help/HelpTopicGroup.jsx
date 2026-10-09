import React from 'react';

export default function HelpTopicGroup({item,renderContent}) {
 return <div style={{marginTop:14}}><p className="note">{item.purpose} Åpne kapitlet du trenger.</p>
  <div style={{display:'grid',gap:8}}>{item.chapters.map(chapter=><details key={chapter.key} className="help-topic-chapter" style={{border:'1px solid #dbe5e8',borderRadius:12,padding:'0 14px',background:'#fff'}}>
   <summary style={{minHeight:44,padding:'12px 0',cursor:'pointer',fontWeight:700,overflowWrap:'anywhere'}}>{chapter.title}</summary>
   {renderContent(chapter)}
  </details>)}</div>
 </div>;
}
