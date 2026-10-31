import {useEffect,useRef} from 'react';

// Same drawing interaction and appearance as Overtagelse. A fixed surface keeps
// existing ink intact when the mobile viewport changes size or orientation.
export default function SignaturePad({label,value='',onChange,disabled=false}) {
 const canvasRef=useRef(null),drawing=useRef(false),ink=useRef(false),last=useRef(null),pointer=useRef(null),change=useRef(onChange);
 change.current=onChange;
 const finish=()=>{if(!drawing.current)return;drawing.current=false;if(ink.current)change.current(canvasRef.current.toDataURL('image/png'));};
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas||drawing.current)return;
  const ctx=canvas.getContext('2d');let active=true;
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.lineWidth=3.6;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#0f172a';
  if(value){const image=new Image();image.onload=()=>{if(active&&!drawing.current)ctx.drawImage(image,0,0,canvas.width,canvas.height);};image.src=value;}
  return()=>{active=false;};
 },[value]);
 useEffect(()=>{const hide=()=>{if(document.visibilityState==='hidden')finish();};window.addEventListener('blur',finish);document.addEventListener('visibilitychange',hide);return()=>{window.removeEventListener('blur',finish);document.removeEventListener('visibilitychange',hide);};},[]);
 const point=e=>{const c=canvasRef.current,r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height};};
 const start=e=>{
  if(disabled||e.isPrimary===false||e.button>0)return;e.preventDefault();
  drawing.current=true;pointer.current=e.pointerId;ink.current=false;last.current=point(e);
  canvasRef.current.setPointerCapture?.(e.pointerId);
 };
 const move=e=>{
  if(disabled||!drawing.current||e.pointerId!==pointer.current)return;e.preventDefault();const p=point(e),a=last.current;
  if(Math.hypot(p.x-a.x,p.y-a.y)<2)return;
  const ctx=canvasRef.current.getContext('2d');ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();
  last.current=p;ink.current=true;
  // Secure an interrupted stroke immediately, before blur/dvale can unmount it.
  change.current(canvasRef.current.toDataURL('image/png'));
 };
 return <div className="item checklist-signature-pad"><b>{label}</b><canvas ref={canvasRef} width={900} height={270} aria-label={label} role="img" style={{width:'100%',height:180,background:'#fff',border:'1px solid #c7d6dd',borderRadius:14,touchAction:'none',display:'block',marginTop:10}} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}/><div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}><button type="button" className="secondary" disabled={disabled||!value} onClick={()=>{drawing.current=false;ink.current=false;change.current('');}}>Tøm signatur</button></div></div>;
}
