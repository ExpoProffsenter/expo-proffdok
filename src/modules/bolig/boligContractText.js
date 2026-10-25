import {PDFiumWorkerClient} from '@hyzyla/pdfium/worker';
import {createWorker} from 'tesseract.js';
const abort=signal=>{if(signal?.aborted)throw new DOMException('Avbrutt','AbortError');};
const clean=text=>String(text).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').normalize('NFC').trim();
const abortable=async(promise,signal)=>{
 if(!signal)return promise;abort(signal);let cancel;
 const cancelled=new Promise((_,reject)=>{cancel=()=>reject(new DOMException('Avbrutt','AbortError'));signal.addEventListener('abort',cancel,{once:true});});
 try{return await Promise.race([promise,cancelled]);}finally{signal.removeEventListener('abort',cancel);}
};
export async function readContractText(blob,{signal,onProgress=()=>{}}={}){
 let pdf,worker,renderer,stopped=false,ocrClosing,rendererClosing;
 const closeOcr=()=>{if(worker&&!ocrClosing)ocrClosing=worker.terminate().catch(()=>{});return ocrClosing;};
 const closeRenderer=()=>{if(renderer&&!rendererClosing)rendererClosing=renderer.destroy().catch(()=>{});return rendererClosing;};
 const stop=()=>{stopped=true;closeOcr();closeRenderer();};
 signal?.addEventListener('abort',stop,{once:true});
 try{
  abort(signal);
  const pages=[];
  const ocr=async(canvas,number,total)=>{
   abort(signal);onProgress({page:number,total,stage:'worker'});
   if(!worker){
    const options={workerPath:'/bolig/ocr/worker.min.js',corePath:'/bolig/ocr',langPath:'/bolig/ocr',cacheMethod:'none',logger:()=>{}};
    worker=await createWorker('nor+eng',1,options);abort(signal);
   }
   onProgress({page:number,total,stage:'ocr'});
   const result=await abortable(worker.recognize(canvas,{rotateAuto:true}),signal);abort(signal);
   return {number,text:clean(result.data.text),method:'ocr',confidence:Math.max(0,Math.min(100,result.data.confidence||0))};
  };
  if(blob.type==='application/pdf'){
   renderer=await PDFiumWorkerClient.spawn({wasmUrl:new URL('/bolig/pdf/pdfium.wasm',location.href).href});abort(signal);
   try{pdf=await renderer.loadDocument(new Uint8Array(await blob.arrayBuffer()));}catch{throw Error('Dokumentet kunne ikke leses. Kontroller at PDF-en åpner uten passord, eller lag en ny PDF-kopi.');}abort(signal);
   const count=await pdf.getPageCount();
   if(count>200)throw Error('Dokumentet har mer enn 200 sider. Del det opp før tekstgjenkjenning.');
   for(let number=1;number<=count;number++){
    abort(signal);onProgress({page:number,total:count,stage:'text'});
    const page=await pdf.getPage(number-1);
    try{
     const text=clean(await page.getText());
     if(text.length>=40)pages.push({number,text,method:'pdf',confidence:null});
     else{
      const {originalWidth,originalHeight}=await page.getOriginalSize();
      const scale=Math.min(2.5,2600/Math.max(originalWidth,originalHeight));
      const image=await page.render({scale,colorSpace:'RGBA',renderFormFields:false});abort(signal);
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      try{canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.data),image.width,image.height),0,0);pages.push(await ocr(canvas,number,count));}
      finally{canvas.width=canvas.height=0;}
     }
     if(pages.at(-1).text.length>50000)throw Error('En side har for mye tekst. Del opp dokumentet.');
    }finally{if(!stopped)await page.close().catch(()=>{});}
   }
  }else{
   const bitmap=await createImageBitmap(blob);abort(signal);
   const scale=Math.min(1,2600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.ceil(bitmap.width*scale);canvas.height=Math.ceil(bitmap.height*scale);
   try{canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);pages.push(await ocr(canvas,1,1));}finally{bitmap.close();canvas.width=canvas.height=0;}
  }
  abort(signal);if(new Blob([JSON.stringify(pages)]).size>1100000)throw Error('Teksten er for stor. Del opp dokumentet.');return pages;
 }finally{signal?.removeEventListener('abort',stop);await closeOcr();if(!stopped)await pdf?.destroy().catch(()=>{});await closeRenderer();}
}
