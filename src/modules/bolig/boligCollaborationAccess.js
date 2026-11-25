export function canEditCollaboration(context, server, root, permission) {
 if(!context?.enabled||!server?.enabled||context.user_id!==server.user_id||context.company_id!==server.company_id)return false;
 return context.role==='manager'&&server.role==='manager'||context.collaboration_root===root&&server.collaboration_root===root&&context[permission]===true&&server[permission]===true;
}
