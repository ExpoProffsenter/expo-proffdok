import fs from 'node:fs';
import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261012164505_kshms_disable_routine_emails.sql','utf8');
assert(sql.includes("new.notification_kind='reading' and new.status in ('pending','sending')"));
assert(sql.includes("new.status:='suppressed'"));assert(sql.includes("new.last_error_code:='routine_email_disabled'"));
assert(sql.includes('before insert or update'));assert(sql.includes("where notification_kind='reading' and status in ('pending','sending')"));
assert(!/delete |truncate |alter table|security definer|update public\.kshms_assignments|update public\.kshms_acknowledgments/i.test(sql));
console.log('Routine email disabled: queue-level insert/retry fence, reading only, sent history/assignments/receipts preserved. Production real insert/retry rollback proved separately.');
