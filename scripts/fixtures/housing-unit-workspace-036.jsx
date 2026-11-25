// Actual Entry and all actual unit children; only the transport is synthetic.
import './housing-first-screen-036.jsx';
const originalRpc=window.qa.client.rpc;
const reads=new Set(['get','list','context','state','unit']);
window.qa.client.rpc=async(name,args={})=>{
 const ctx={user_id:'qa-user',company_id:'qa-company',company_name:'QA Firma',enabled:!window.qa.denied,licensed:true,role:window.qa.role};
 const unit=args.p_unit_id||args.p_scope_id;
 const line={key:'base',name:'QA servant',sku:'QA-S1',quantity:1,unit:'stk',credit_cents:10000};
 const pkg={id:'p1',name:'QA standardbad',revision:1,archived:false,sections:[],lines:[line]};
 const room={id:'qa-room',name:'Bad',type:'bathroom',floor:'',unit_id:unit,archived:false};
 const component={scope_id:room.id,room_id:room.id,room_name:room.name,package:pkg,options:[],goods:[line],allocations:[],total_cents:0,catalog_revision:1};
 const snapshot={format:'scoped-v1',components:[component],package:pkg,options:[],goods:[{...line,key:'qa-room/base',room_id:room.id,room_name:room.name,scope_id:room.id}],total_cents:0,catalog_revision:1};
 const data={context:ctx,root_id:'qa-root',unit_id:args.p_unit_id??null,scope_id:args.p_scope_id??null,revision:1,rooms_revision:1,catalog_revision:1,choice_revision:1,delivery_revision:0,rooms:[room],packages:[pkg],options:[{id:'o1',name:'QA ekstra speil',sku:'QA-M1',quantity:1,unit:'stk',price_cents:250000,replace_key:'',deduct_base:false,revision:1,archived:false}],selection:{revision:1,snapshot},components:[component],draft:null,content:null,history:[],rows:[],items:[],orders:[],documents:[],tasks:[],notices:[],deliveries:[],members:[],targets:[],portal:null,contact:{name:'QA Beboer',email:'qa@example.invalid'},mail_enabled:false,units:[{id:unit,number:'H0101',address:'Pilotveien 101',block_id:'b-a',entrance_id:'e-0',floor:1,contact_email:'qa@example.invalid'}],groups:[],blocks:[],entrances:[]};
 const own=['bolig_rooms','bolig_package_choices','bolig_room_content','bolig_order_draft','bolig_deliveries','bolig_quality','bolig_resident_portal','bolig_commerce','bolig_progress','bolig_handover_review'];
 if(own.includes(name)||(name==='bolig_catalog'&&args.p_unit_id)||(name==='bolig_completion'&&unit)){
  window.qa.calls.push({name,args});
  if(!reads.has(args.p_action))throw Error('No writes in native unit review: '+name+'/'+args.p_action);
  if(name==='bolig_room_content'&&window.qa.legacy)delete data.selection.snapshot.format;
  if(name==='bolig_quality')Object.assign(data,{kind:'unit',title:'H0301 · QA Bolig',fdv:[],templates:[],archived:false,data:{checks:[],documents:[],protocols:[],fdv:{}}});
  if(name==='bolig_completion')data.rows=[{scope_id:unit,kind:'unit',parent_id:null,title:'H0301 · QA Bolig',revision:0,basis:'qa-basis',source_basis:'qa-source',source:{issues:[]},status:'not_started',items:[],issues:['Kontroll gjenstår'],done:0,total:0,approval:null,handover:null}];
  if(name==='bolig_handover_review')Object.assign(data,{basis:'qa-review',cases:[],assessment:null,record:null});
  return{data};
 }
 const r=await originalRpc(name,args);
 if(window.qa.denied&&r.data){if(r.data.context)r.data={...r.data,context:ctx};else if(args.p_action==='context')r.data=ctx;}
 return r;
};
