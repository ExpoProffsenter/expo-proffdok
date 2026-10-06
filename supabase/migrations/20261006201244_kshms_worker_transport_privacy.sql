-- pg_net persists HTTP headers until delivery. The worker token must not be
-- readable or alterable by application clients while queued. Scheduled calls
-- run through the private postgres-owned security-definer worker; no client
-- requires direct transport-table access.
revoke all on table net.http_request_queue, net._http_response from public, anon, authenticated;
