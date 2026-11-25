-- User-requested immediate notices and dialogue run around the clock.
-- Only automatic reminders and date-only scheduled publication keep daytime.
create function bolig_private.progress_daytime(at_time timestamptz default now())
returns boolean language sql stable set search_path='' as $$
 select extract(hour from at_time at time zone 'Europe/Oslo') between 8 and 17
$$;
revoke all on function bolig_private.progress_daytime(timestamptz) from public,anon,authenticated,service_role;

-- Guarded edits preserve the installed composer, opt-in, recipient and retry logic.
do $$declare definition text;needle text;begin
 definition:=pg_get_functiondef('bolig_private.invoke_progress_worker()'::regprocedure);
 needle:='if extract(hour from now() at time zone ''Europe/Oslo'') not between 8 and 17 then return;end if;';
 if strpos(definition,needle)=0 then raise exception 'Unexpected worker timing definition';end if;
 execute replace(definition,needle,'-- Timing is applied per delivery kind, not to the transport.');

 definition:=pg_get_functiondef('bolig_private.progress_tick()'::regprocedure);
 needle:='where published_at is null and publish_on<=today';
 if strpos(definition,needle)=0 then raise exception 'Unexpected scheduled notice definition';end if;
 definition:=replace(definition,needle,'where bolig_private.progress_daytime() and published_at is null and publish_on<=today');
 needle:='where t.status<>''done'' and exists(select 1 from bolig_private.progress_reminder_settings';
 if strpos(definition,needle)=0 then raise exception 'Unexpected reminder opt-in definition';end if;
 execute replace(definition,needle,'where bolig_private.progress_daytime() and t.status<>''done'' and exists(select 1 from bolig_private.progress_reminder_settings');

 definition:=pg_get_functiondef('bolig_private.reserve_before_dialogue()'::regprocedure);
 needle:='where (status=''pending'' and available_at<=now()) or (status=''sending'' and reserved_at<now()-interval ''5 minutes'')';
 if strpos(definition,needle)=0 then raise exception 'Unexpected progress reservation definition';end if;
 -- Skip pending/stale owner attempts overnight; never suppress or consume them.
 execute replace(definition,needle,'where (kind<>''owner'' or bolig_private.progress_daytime()) and ((status=''pending'' and available_at<=now()) or (status=''sending'' and reserved_at<now()-interval ''5 minutes''))');
end$$;
