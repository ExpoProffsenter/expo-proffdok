// UI feedback complements the database/Storage fences. Text editing, removing
// a search filter and ordinary navigation remain available.
export function isSupportDeleteAction(button) {
  if (button.getAttribute('data-support-delete-blocked') === 'true') return true;
  const label = String(button.getAttribute('aria-label') || button.textContent?.trim() || button.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
  if (/^(fjern|nullstill) (alle )?(søk|søkefilter|filter|filtre)$/i.test(label)) return false;
  if (/^trekk tilbake invitasjon(?:\s|$)/i.test(label)) return true;
  return /^(slett|fjern|arkiver|nullstill)(?:\s|$)/i.test(label);
}
export function installSupportDeleteUx(window) {
  const {document}=window;
  const block = event => {
    const button=event.target?.closest?.('button,[role="button"]');
    if (!button || !isSupportDeleteAction(button)) return;
    event.preventDefault(); event.stopImmediatePropagation();
  };
  document.addEventListener('click',block,true);
  let queued=false;
  const apply=()=>{
    queued=false;
    for (const button of document.querySelectorAll('button,[role="button"]')) {
      if (!isSupportDeleteAction(button)) continue;
      if (button.getAttribute('data-support-delete-blocked')==='true') {
        if ('disabled' in button && !button.disabled) button.disabled=true;
        continue;
      }
      button.setAttribute('data-support-delete-blocked','true');
      button.setAttribute('aria-disabled','true');
      button.setAttribute('title','Sletting er sperret i supportmodus.');
      if ('disabled' in button) button.disabled=true;
    }
  };
  const observer=new window.MutationObserver(()=>{if(!queued){queued=true;window.queueMicrotask(apply);}});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-label']});
  apply();
  return ()=>{observer.disconnect();document.removeEventListener('click',block,true);};
}
