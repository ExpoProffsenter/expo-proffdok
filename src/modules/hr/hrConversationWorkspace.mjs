// Keep the persisted/internal review ID 3 and normalize the former action step.
// This changes presentation only; server stages, commands and confirmations stay intact.
export const conversationWorkspaceStep=step=>step===2?1:[0,1,3].includes(step)?step:0;
export const CONVERSATION_WORKSPACE_STEPS=[{id:0,title:'Forberedelse'},{id:1,title:'Samtale og tiltak'},{id:3,title:'Referat'}];
