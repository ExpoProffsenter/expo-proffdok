export const MOBILE_PREVIEW_EVENT='expo:sales-mobile-preview';
export function openMobileCustomerPreview(url){
 if(typeof window==='undefined'||!window.matchMedia?.('(max-width: 760px)').matches)return false;
 const target=new URL(url,window.location.origin);
 if(target.origin!==window.location.origin||(!target.searchParams.has('publicOffer')&&!target.searchParams.has('offerPreview')))return false;
 return !window.dispatchEvent(new CustomEvent(MOBILE_PREVIEW_EVENT,{cancelable:true,detail:{url:target.href}}));
}
