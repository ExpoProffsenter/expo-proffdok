export function residentMailMock(context) {
 window.__linkMailHistory ||= [];
 window.__linkMailCalls ||= [];
 window.__linkMailEnabled = true;
 return {
  auth: {getSession:async()=>({data:{session:{access_token:'qa'}}})},
  rpc:async p=>{
   if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};
   return {data:{context,root_id:p.p_root_id,unit_id:p.p_unit_id,target_id:p.p_target_id,kind:p.p_kind,revision:1,enabled:window.__linkMailEnabled,history:structuredClone(window.__linkMailHistory),snapshot:{kind:p.p_kind,document_kind:p.p_target_id==='document-1'?'choice':'change',version:1,origin:'https://expo-proffdok.app',project:'QA Boligprosjekt',unit:'H0101',address:'QA Gate 1',name:'QA Beboer',to:'qa@example.invalid',expires_at:'2026-11-22T12:00:00Z',company:{companyName:'QA Firma',email:'sender@qa.invalid'}}}};
  },
  send:async options=>{
   const p=JSON.parse(options.body);window.__linkMailCalls.push(p);
   if(window.__holdLinkMail){window.__holdLinkMail=false;await new Promise(r=>window.__releaseLinkMail=r);}
   if(window.__loseLinkMail){window.__loseLinkMail=false;throw Error('Lost before receipt');}
   if(!window.__linkMailHistory.some(x=>x.id===p.requestId))window.__linkMailHistory.unshift({id:p.requestId,recipient:'qa@example.invalid',kind:p.kind,own:true,begun_at:'2026-10-23T22:00:00Z',sent_at:'2026-10-23T22:00:01Z'});
   if(window.__loseLinkMailReceipt){window.__loseLinkMailReceipt=false;throw Error('Lost receipt');}
   return new Response(JSON.stringify({ok:true}),{status:200});
  }
 };
}
