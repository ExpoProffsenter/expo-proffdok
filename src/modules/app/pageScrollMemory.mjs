// Preserve scroll after a real hidden-page transition. Focus alone (for example
// the Windows screenshot overlay) must never replay a stale saved position.
export function installPageScrollMemory({projectId,tab,win=window,doc=document}) {
 const key=`expoProffDokScroll:${projectId||'global'}:${tab||''}`;
 const activeKey=`expoProffDokActiveScroll:${projectId||'global'}`;
 let disposed=false,hidden=false,backgroundY=0,saveTimer=null,frame=null,retries=[];
 const currentY=()=>Math.max(0,Number(win.scrollY)||0);
 const save=()=>{try{const y=currentY();win.sessionStorage.setItem(key,String(y));win.sessionStorage.setItem(activeKey,JSON.stringify({tab:tab||'',y,savedAt:Date.now()}));}catch{}};
 const cancel=()=>{if(frame!==null)win.cancelAnimationFrame(frame);frame=null;for(const timer of retries)win.clearTimeout(timer);retries=[];};
 const saveSoon=()=>{if(doc.hidden)return;if(saveTimer!==null)win.clearTimeout(saveTimer);saveTimer=win.setTimeout(save,80);};
 const interact=()=>{cancel();hidden=false;saveSoon();};
 const blur=()=>{cancel();if(!doc.hidden)save();};
 const resume=()=>{
  if(disposed||doc.hidden||!hidden)return;
  hidden=false;cancel();const y=backgroundY;
  if(Math.abs(currentY()-y)<1)return;
  const apply=()=>{if(disposed||doc.hidden)return;if(Math.abs(currentY()-y)>=1)win.scrollTo({top:y,behavior:'instant'});};
  frame=win.requestAnimationFrame(()=>{frame=null;apply();});
  retries=[80,250,650].map(ms=>win.setTimeout(apply,ms));
 };
 const visibility=()=>{if(doc.hidden){cancel();backgroundY=currentY();hidden=true;save();}else resume();};
 const click=event=>{if(event.target?.closest?.('a[target="_blank"], a[href^="http"]'))save();};
 const listeners=[[doc,'click',click,true],[doc,'pointerdown',interact,true],[doc,'keydown',interact,true],[doc,'wheel',interact,{passive:true}],[doc,'touchstart',interact,{passive:true}],[win,'scroll',saveSoon,{passive:true}],[win,'blur',blur],[win,'focus',resume],[doc,'visibilitychange',visibility]];
 for(const [target,name,handler,options] of listeners)target.addEventListener(name,handler,options);
 return ()=>{disposed=true;cancel();if(saveTimer!==null)win.clearTimeout(saveTimer);for(const [target,name,handler,options] of listeners)target.removeEventListener(name,handler,options);};
}
