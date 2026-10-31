import { useEffect, useRef, useState } from 'react';
import { getAppSupabaseClient } from '../../access/appSupabaseClientRegistry.js';
import { getSalesSession, resolveSalesCompanyScope, getSalesOfferByToken } from '../services/salesSupabase.js';
import { observeSalesCaseStoredPreview } from '../services/salesCaseStoredPreview.mjs';

export default function useSalesCaseStoredPreview(request, base) {
  const key = JSON.stringify([request?.id, request?.publicToken, request?.sentOfferVersionId, request?.acceptedOfferVersionId, request?.status]);
  const [loaded, setLoaded] = useState(null);
  const observer = useRef(null);
  useEffect(() => {
    const client = getAppSupabaseClient();
    if (base.kind !== 'empty' || !request?.publicToken || !(request.acceptedOfferVersionId || request.sentOfferVersionId) || !client) return;
    const reset = () => setLoaded({ key, preview: null, loading: true, error: '' });
    const session = observeSalesCaseStoredPreview({ request, client,
      getSession: getSalesSession, resolveScope: resolveSalesCompanyScope,
      readRequest: (companyId, id) => client.from('sales_requests').select('company_id,request_ref,payload')
        .eq('company_id', companyId).eq('request_ref', id).maybeSingle(),
      readOffer: (token) => getSalesOfferByToken(client, token),
      onReset: reset, onLoading: reset,
      onReady: (preview) => setLoaded({ key, preview, loading: false, error: '' }),
      onError: (error) => setLoaded({ key, preview: null, loading: false, error }),
    });
    observer.current = session;
    return () => { session.dispose(); if (observer.current === session) observer.current = null; };
  }, [key, base.kind]);
  const state = base.kind === 'empty' && loaded?.key === key ? loaded : null;
  return { preview: state?.preview || base, loading: state?.loading, error: state?.error,
    retry: () => observer.current?.retry() };
}
