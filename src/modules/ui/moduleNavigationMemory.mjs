// Per-page navigation only. Never retain a record, draft or authorization context.
// The owning module must fetch and authorize content again before showing it.
export function createModuleNavigationMemory(validate) {
 const entries=new Map();
 return {
  read(scope){return entries.get(scope)||null;},
  remember(scope,value){
   if(!scope||!validate(value))return;
   entries.delete(scope);entries.set(scope,value);
   if(entries.size>8)entries.delete(entries.keys().next().value);
  },
  forget(scope){entries.delete(scope);},
 };
}
