import React from 'react';
import {useProCatalogOrderAccess} from './useProCatalogOrderAccess.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {openProCatalogOrder} from './proCatalogOrderClient.js';
export default function ProCatalogOrderShortcut(){
 const client=getAppSupabaseClient();
 // Use the public SDK session API, without a second auth client or stored token.
 const [id,setId]=React.useState(null);
 React.useEffect(()=>{let live=true;client?.auth?.getUser()?.then(r=>{if(live)setId(r.data?.user?.id||null);}).catch(()=>{if(live)setId(null);});const result=client?.auth?.onAuthStateChange((_event,s)=>{if(live)setId(s?.user?.id||null);});return()=>{live=false;result?.data?.subscription?.unsubscribe();};},[client]);
 const access=useProCatalogOrderAccess(id);
 return access.context?<button type="button" className="secondary" disabled={access.pending} onClick={openProCatalogOrder}>Åpne varebestilling</button>:null;
}
