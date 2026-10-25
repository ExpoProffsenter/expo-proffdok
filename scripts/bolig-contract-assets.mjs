import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
export async function contractAssets(){
 const root=path.dirname(require.resolve('tesseract.js/package.json'));
 const core=path.dirname(require.resolve('tesseract.js-core/package.json'));
 const entries=[['worker.min.js',path.join(root,'dist/worker.min.js')]];
 entries.push(['LICENSE-tesseract.md',path.join(root,'LICENSE.md')],['LICENSE-core',path.join(core,'LICENSE')]);
 for(const name of await fs.readdir(core))if(/^tesseract-core.*\.(wasm|js)$/.test(name))entries.push([name,path.join(core,name)]);
 for(const lang of ['nor','eng'])entries.push([lang+'.traineddata.gz',path.join(path.dirname(require.resolve('@tesseract.js-data/'+lang+'/package.json')),'4.0.0_best_int',lang+'.traineddata.gz')]);
 const result=await Promise.all(entries.map(async([name,file])=>({name:'bolig/ocr/'+name,source:await fs.readFile(file)})));
 result.push({name:'bolig/pdf/pdfium.wasm',source:await fs.readFile(require.resolve('@hyzyla/pdfium/pdfium.wasm'))});
 result.push({name:'bolig/pdf/LICENSE.md',source:await fs.readFile(path.join(path.dirname(require.resolve('@hyzyla/pdfium/package.json')),'LICENSE.md'))});
 return result;
}
export function contractAssetsPlugin(){return {name:'bolig-private-contract-ocr-assets',async generateBundle(){for(const asset of await contractAssets())this.emitFile({type:'asset',fileName:asset.name,source:asset.source});}};}
