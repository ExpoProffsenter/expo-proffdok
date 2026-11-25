export const CONVERSATION_TEXT_LIMIT=10000;
export const CONVERSATION_ACTION_LIMIT=2000;
// PostgreSQL length(text) counts Unicode code points, not UTF-16 code units.
export const conversationTextLength=value=>Array.from(value||'').length;
export function conversationTextError(draft,permissions,ownSide){
 const fields=[];
 if(permissions.prepare)fields.push(...Object.values(draft.preparation||{}).map(text=>[text,CONVERSATION_TEXT_LIMIT,'Forberedelsen']));
 if(permissions.meeting){
  fields.push(...Object.values(draft.meeting||{}).map(text=>[text,CONVERSATION_TEXT_LIMIT,'Møtereferatet']));
  fields.push(...(draft.actions||[]).map((action,i)=>[action.task,CONVERSATION_ACTION_LIMIT,`Tiltak ${i+1}`]));
 }
 if(permissions.comment)fields.push([draft.comments?.[ownSide],CONVERSATION_TEXT_LIMIT,'Din kommentar']);
 const over=fields.find(([text,limit])=>conversationTextLength(text)>limit);
 return over?`${over[2]} har mer enn ${over[1]} tegn i ett felt. Forkort teksten før lagring. Hele teksten er beholdt i kladden; ingenting er sendt til lagring.`:'';
}
