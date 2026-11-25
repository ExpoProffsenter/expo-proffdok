import assert from 'node:assert/strict';
import {createCordelZip} from '../src/modules/cordel/cordelFiles.mjs';
import {parseResidentText,suggestResidentColumns,residentGroups,residentImportRows} from '../src/modules/bolig/boligResidentImport.mjs';
import {readResidentFile} from '../src/modules/bolig/boligResidentWorkbook.mjs';
import {selectNoticeBuildings,noticeBuildingsLabel} from '../src/modules/bolig/boligNoticeAudience.mjs';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
globalThis.DOMParser=new JSDOM('').window.DOMParser;
let checks=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
const record={blocks:[{id:'a',name:'Bygg A'},{id:'b',name:'Bygg B'}],entrances:[{id:'ea',block_id:'a',address:'Eksempelveien 24'},{id:'eb',block_id:'b',address:'Eksempelveien 25'}],units:[{id:'ua',entrance_id:'ea',number:'24',additional_contacts:[]},{id:'ub',entrance_id:'eb',number:'24',additional_contacts:[]}]};
const text='Bygg;Adresse;Bolignummer;Navn;E-post;Mobil\r\nBygg A;Eksempelveien 24;24;Eier Æ;one@example.invalid;004712345678\r\nBygg A;Eksempelveien 24;24;Eier Ø;two@example.invalid;12345678\r\nBygg A;Eksempelveien 24;24;Eier Ø;two@example.invalid;12345678\r\nBygg B;Eksempelveien 25;24;Eier Å;three@example.invalid;87654321';
const grid=parseResidentText(text),mapping=suggestResidentColumns(grid[0]);let groups=residentGroups(grid,mapping,record);
eq(groups.length,2,'Same number in different addresses stays separate');eq(groups[0].contacts.length,2,'Identical repeated row collapses; distinct owner retained');eq(groups[0].primary,'','Multiple owners require explicit primary selection');eq(groups[0].unitId,'ua');eq(groups[1].unitId,'ub');
assert.throws(()=>residentImportRows(groups,record),/hovedkontakt/);checks++;
groups[0].primary='1';const rows=residentImportRows(groups,record);
eq(rows[0].email,'two@example.invalid');eq(rows[0].additional_contacts[0].phone,'004712345678','Leading zeros preserved');eq(rows.length,2);
assert.throws(()=>residentImportRows([{...groups[0]}, {...groups[1],unitId:'ua'}],record),/forskjellig/);checks++;
const existing=structuredClone(record);existing.units[0].contact_name='Old owner';
assert.throws(()=>residentImportRows(groups,existing),/erstatning/);checks++;
groups[0].replace=true;eq(residentImportRows(groups,existing)[0].before.name,'Old owner','Expected before-state retained');
eq(parseResidentText('Navn;Adresse\n"Æ; Ø";"Linje 1\nLinje 2"')[1],['Æ; Ø','Linje 1\nLinje 2']);
assert.throws(()=>parseResidentText('A;B\n"unfinished;value'),/anførselstegn/);checks++;
const units=[{id:'u1',block_id:'a',block_name:'A'},{id:'u2',block_id:'b',block_name:'B'},{id:'u3',block_id:'a',block_name:'A'}];
eq(selectNoticeBuildings(units,['a','b','a']),['u1','u2','u3']);eq(selectNoticeBuildings(units,['b']),['u2']);eq(noticeBuildingsLabel(units,['a','b']),'A, B');
const sheet=rows=>`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((r,i)=>`<row r="${i+1}">${r.map((v,j)=>`<c r="${String.fromCharCode(65+j)}${i+1}" t="inlineStr"><is><t>${v}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
const make=content=>new File([createCordelZip(Object.entries({
 'xl/workbook.xml':'<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Eiere" r:id="rId1"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':content,
}).map(([name,text])=>({name,bytes:new TextEncoder().encode(text)})))],'qa.xlsx');
const workbook=await readResidentFile(make(sheet(grid)));
eq(workbook[0].rows,grid,'XLSX cells match CSV exactly');eq(workbook[0].name,'Eiere');
await assert.rejects(()=>readResidentFile(make(sheet(grid).replace('<is>', '<f>1+1</f><is>'))),/formler/);checks++;
await assert.rejects(()=>readResidentFile(new File(['bad'],'qa.xlsx')));checks++;
console.log(`PASS resident import/workbook/audience: ${checks} assertions`);
