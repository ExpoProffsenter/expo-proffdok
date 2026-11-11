import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx','utf8');
function fn(name){const start=source.indexOf(`  function ${name}(`);assert(start>=0);let at=source.indexOf('{',start),depth=1,end=at+1;for(;depth;end++){if(source[end]==='{')depth++;if(source[end]==='}')depth--;}return source.slice(start,end);}
const productLines=[{id:'p1'},{id:'p2'}],installationLines=[{id:'i1',storeParentProductId:'p1'},{id:'i2',storeParentProductId:'p2'}];
const options=[{id:'a',storeParentProductId:'p1'},{id:'b',replacementLineId:'p1'},{id:'c',storeParentProductId:'p2',storeInstallationReplacementLineId:'i1'},{id:'free'}];
function run(action){const state={lines:[...productLines,...installationLines],options:structuredClone(options)};const c={productLines,installationLines,options:state.options,lines:state.lines,sections:[],metaLine:null,otherLines:[],openProductId:'p1',openNestedId:'a',String,updateOfferForm:(k,v)=>state[k]=v,setOpenProductId:()=>{},setOpenNestedId:()=>{},composeLines:({products,installations})=>[...products,...installations],recalculateStoreOptions:(o)=>o,recalculateStoreOption:o=>o};vm.createContext(c);vm.runInContext([fn('applyGroups'),fn('removeProduct'),fn('removeInstallation'),fn('removeOption'),action].join('\n'),c);return state;}
assert.deepEqual(run("removeProduct('p1')").options.map(x=>x.id),['c','free'],'deleting a product must not restore its removed options');
assert.deepEqual(run("removeProduct('p1')").lines.map(x=>x.id),['p2','i2'],'linked installation removed, other lines retained');
assert.equal(run("removeInstallation('i1')").options.find(x=>x.id==='c').storeInstallationReplacementLineId,'','installation cleanup must survive recalculation');
assert.deepEqual(run("removeOption('a')").options.map(x=>x.id),['b','c','free'],'direct option deletion preserves all others');
const start=source.indexOf('  const standaloneOptions = options.filter('),end=source.indexOf('\n\n',start);
const c={productLines:[{id:'p2'}],options:[...options,{id:'orphan',storeParentProductId:'deleted'}]};vm.createContext(c);const ids=vm.runInContext(source.slice(start,end)+'\nstandaloneOptions.map(x=>x.id).join(",")',c);
assert.equal(ids,'a,b,free,orphan','all disconnected options remain visible for explicit review/removal');
console.log('Store option removal: 5 regression checks PASS; actual editor handlers and orphan selection, no data writes.');
