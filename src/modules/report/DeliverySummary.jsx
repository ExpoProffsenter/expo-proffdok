import React from 'react';

export default function DeliverySummary({items=[],onOpen,warrantyEnabled,warrantyMissing=[],onWarranty}) {
  return <details className="ux-preview"><summary className="ux-readable-summary">Før overlevering · {items.length} oppfølgingspunkter{warrantyEnabled?` · ${warrantyMissing.length} mangler i garantigrunnlaget`:''}</summary>
    <p>Bruk oversikten til å finne dokumentasjon som gjenstår. Kravene til signering, garanti og avslutning gjelder fortsatt.</p>
    <ul>{items.map(item=><li key={item.id}><button type="button" className="secondary" onClick={()=>onOpen(item)}>{item.label}</button></li>)}</ul>
    {warrantyEnabled&&<><p>{warrantyMissing.length?'Kontroller garantigrunnlaget før utstedelse.':'Det viste garantigrunnlaget er komplett. Kontroller også signert kontrakt i Garanti.'}</p><button type="button" className="secondary" onClick={onWarranty}>Åpne garantigrunnlaget</button></>}
  </details>;
}
