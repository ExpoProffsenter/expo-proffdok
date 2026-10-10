# Independent HR control project

Target: **expo-hr-control / amduqhmgmeetaatwlmmt**, organization `oolmxqndmldzpylahcjl`, Micro, eu-west-1. Future Production protection; no permanent course job. Never restore this project with the application, and never use it as a database/Auth/Storage restore test target.

This directory deliberately sits outside the application's `supabase/migrations`. Apply its SQL only to the control project, using an explicit verified project ID. No generic app migration/deploy command may include it. The original Sandbox operator is unchanged.

| Canonical CLI migration | Installed control-project migration |
| --- | --- |
| `20261010203756_hr_control_checkpoint.sql` | `20261010204017_hr_control_checkpoint` |
| `20261010204058_hr_control_auto_rls_acl.sql` | `20261010204144_hr_control_auto_rls_acl` |

The private checkpoint table has RLS, no public policies, no schema/table access for anon/authenticated/service_role, and only four narrowly scoped service-role RPCs. Public SECURITY DEFINER RPCs have an empty search_path and explicit execution revocations. The separate ACL migration revokes public execution of the dashboard's auto-RLS event trigger; an actual rollback table-creation probe confirmed auto-RLS still works. The remaining advisor INFO `rls_enabled_no_policy` is intentional deny-all, not a request to grant a policy: [Supabase advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

No rows are installed by migrations. Initial state is **0 checkpoints, 0 enabled bindings, 0 locks, 0 Edge Functions**. No HMAC key, Blob token, trusted anchor, scheduler or alert transport is provisioned. A missing/disabled checkpoint refuses a claim rather than silently bootstrapping.

## Checkpoint and failure contract

Each binding records target project, store resource ID, private origin, monotonic revision/generation, HMAC, and durable run ownership. Claim/commit/read/finish lock the row transactionally. A run has no expiration and no automatic takeover. CAS requires the exact revision, next generation and new digest. Fresh reads check the same owner and binding.

`scripts/lib/hr-control-ack-cycle.mjs` reuses existing minimal receipt validation, HMAC and cloud CAS logic. Sequence: claim → verify old cloud/anchor → full snapshot → signed cloud union/readback → durable control commit → separate control read → fresh cloud read → exact service-only ack batches → finish. Before each ack and finish, ownership/revision is read again. Unknown cloud/commit/read/ack/finish outcomes retain the durable lock and refuse success. No catch/finally unlock is provided.

The new adapter requires **ISOLATED_QA** and rejects the active Production, course Sandbox and control project as application sources. It is not an installed Edge worker or a Production operator. Its HTTP client is pinned to the actual control project, accepts only the four RPC names, refuses redirects, uses a 30-second timeout, bounds replies to 16 KiB, and never prints credentials/provider errors.

No recovery/unlock RPC exists. A manual recovery must first establish that the old worker cannot still acknowledge, then verify remote signed generation and independent checkpoint before any privileged change. Do not clear an old run merely because it is old. A future lease/takeover design needs fencing at the application's ack endpoint; the current H5b ack RPC has no such fence. Restoring/recreating the control table or losing a signing key is not a bootstrap shortcut.

## Actual QA and remaining work

`check.sql` exercises the installed SQL using synthetic bindings inside one rollback transaction. **37 assertions PASS** both in PostgreSQL/PGlite and the actual control project, including actual anon/authenticated denial, actual service-role invocation, binding mismatch, durable ownership, old lock refusal, stale revision/generation, exact readback and rollback. PGlite only declares platform roles synthetically; it is not Auth/Storage restore evidence.

The real cycle adapter passes **21 fault/order/concurrency scenarios with synthetic transports**, including JSONB key-order differences, response loss after a committed checkpoint, stale reads, changed ownership, ack/finish failures and concurrent claims. The existing filesystem operator's **20 scenarios remain unchanged and PASS**. The new cycle check is an additional required step in PR Core Safety. Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS.

Run from repository root:

```sh
node scripts/critical-hr-control-cycle-check.mjs
HR_PGLITE_PATH=/absolute/pinned/pglite/dist/index.js node scripts/hr-control-db-check.mjs
```

Actual owner-dashboard metadata confirms catalog ID `store_feUEeykOyyvZVMca` and private origin `https://feueeykoyyvzvmca.private.blob.vercel-storage.com`. SDK 2.8.1 source derives the storage identifier from the token; DNS hostnames normalize case. The existing adapter wrongly refused mixed-case token identifiers. The narrow fix retains canonical lower-case DB/anchor binding `store_feueeykoyyvzvmca`, compares the token identifier after case normalization, and still rejects different stores before networking. Two added regressions extend the existing 38 cloud scenarios to **40 PASS**; no original test is removed. The actual pinned SDK passes private/cache=0/token/ifMatch/fresh-readback/412 checks with a mixed-case synthetic token and networking disabled. This proves the code/SDK case contract, not real token authentication or cloud operations.

Real store-limited token provisioning, authenticated private cloud denial/write/read/CAS/recovery, bootstrap, Edge runtime, scheduler/alerts and full isolated database/Auth/Storage-byte restore remain unverified. The actual token must match the verified origin before binding. No private HR opening or PR #217 merge is authorized by these results.
