// PostgreSQL length(text) counts Unicode code points, not UTF-16 code units.
export const conversationTextLength=value=>Array.from(value||'').length;
export function conversationTextError(draft,permissions,ownSide){
 const fields=[];
 if(permissions.prepare)fields.push(...Object.values(draft.preparation||{}).map(text=>[text,4000,'Forberedelsen']));
 if(permissions.meeting){
  fields.push(...Object.values(draft.meeting||{}).map(text=>[text,4000,'Møtereferatet']));
  fields.push(...(draft.actions||[]).map((action,i)=>[action.task,600,`Tiltak ${i+1}`]));
 }
 if(permissions.comment)fields.push([draft.comments?.[ownSide],4000,'Din kommentar']);
 const over=fields.find(([text,limit])=>conversationTextLength(text)>limit);
 return over?`${over[2]} har mer enn ${over[1]} tegn i ett felt. Forkort teksten før lagring. Hele teksten er beholdt i kladden; ingenting er sendt til lagring.`:'';
}
