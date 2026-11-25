-- Read-only date projection. No payload rewrite, email, access or history changes.
create or replace function public.list_sales_request_summaries(
  requested_company_id uuid default null
)
returns table (
  request_ref text,
  status text,
  archived_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz,
  created_by uuid,
  created_by_name text,
  payload jsonb
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Du må være innlogget.' using errcode = '42501';
  end if;

  if requested_company_id is not null then
    v_company_id := public.resolve_sales_support_company_scope(requested_company_id);
  else
    v_company_id := public.resolve_sales_company_scope();
  end if;

  if v_company_id is null then return; end if;

  return query
  with scoped as (
    select
      sr.request_ref,
      sr.status as stored_status,
      sr.archived_at,
      sr.updated_at,
      sr.created_at,
      sr.created_by,
      sr.created_by_name,
      sr.list_payload,
      latest_offer.offer_published_at,
      latest_offer.offer_status,
      latest_offer.offer_accepted_at,
      latest_offer.offer_declined_at,
      latest_followup.sent_at as followup_sent_at,
      latest_followup.offer_version_id as followup_version_id,
      latest_followup.reminder_number as followup_reminder_number,
      latest_followup.source_email_sent_at as followup_source_email_sent_at,
      latest_followup.version_number as followup_version_number,
      case
        when sr.status = 'Aktivert' then 'Aktivert'
        when latest_offer.offer_status = 'accepted' then 'Akseptert'
        when latest_offer.offer_status = 'declined' then 'Avvist'
        else coalesce(nullif(sr.status, ''), 'Forespørsel')
      end as effective_status
    from public.sales_requests sr
    left join lateral (
      select o.status as offer_status, o.accepted_at as offer_accepted_at,
             o.declined_at as offer_declined_at, v.created_at as offer_published_at
      from public.sales_offers o
      left join public.sales_offer_versions v on v.id = o.active_version_id and v.offer_id = o.id
      where o.company_id = sr.company_id and o.request_ref = sr.request_ref
      order by o.updated_at desc nulls last, o.created_at desc nulls last
      limit 1
    ) latest_offer on true
    left join lateral (
      select n.sent_at, n.offer_version_id, n.reminder_number,
             n.source_email_sent_at, v.version_number
      from public.sales_offer_follow_up_notifications n
      left join public.sales_offer_versions v on v.id = n.offer_version_id
      where n.company_id = sr.company_id
        and n.request_ref = sr.request_ref
        and n.status = 'sent'
      order by n.sent_at desc nulls last
      limit 1
    ) latest_followup on true
    where sr.company_id = v_company_id
  )
  select
    scoped.request_ref,
    scoped.effective_status as status,
    scoped.archived_at,
    scoped.updated_at,
    scoped.created_at,
    scoped.created_by,
    scoped.created_by_name,
    jsonb_strip_nulls(
      (scoped.list_payload - '__offerSearchText') ||
      jsonb_build_object(
        'offerPublishedAt', scoped.offer_published_at,
        'status', scoped.effective_status,
        'statusClass', case
          when scoped.effective_status = 'Akseptert' then 'sales-status-accepted'
          when scoped.effective_status = 'Avvist' then 'sales-status-declined'
          when scoped.effective_status = 'Befaring' then 'sales-status-survey'
          when scoped.effective_status = 'Tilbud' then 'sales-status-quote'
          else scoped.list_payload ->> 'statusClass'
        end,
        'nextStep', case
          when scoped.effective_status = 'Akseptert' then 'Aktiver som prosjekt'
          when scoped.effective_status = 'Avvist' then 'Tilbud avvist'
          else scoped.list_payload ->> 'nextStep'
        end,
        'iconName', case
          when scoped.effective_status = 'Akseptert' then 'home'
          when scoped.effective_status = 'Avvist' then 'declined'
          else scoped.list_payload ->> 'iconName'
        end,
        'acceptedAt', coalesce(to_jsonb(scoped.offer_accepted_at), scoped.list_payload -> 'acceptedAt'),
        'declinedAt', coalesce(to_jsonb(scoped.offer_declined_at), scoped.list_payload -> 'declinedAt'),
        'offerOriginalEmailSentAt', scoped.list_payload ->> 'offerEmailSentAt',
        'offerEmailSentAt', case
          when scoped.followup_sent_at is not null
            and scoped.followup_version_number is not null
            and scoped.followup_version_number = coalesce(
              nullif(scoped.list_payload ->> 'offerEmailVersionNumber', '')::integer,
              nullif(scoped.list_payload ->> 'sentOfferVersionNumber', '')::integer,
              0
            )
            and scoped.followup_sent_at >= coalesce(
              nullif(scoped.list_payload ->> 'offerEmailSentAt', '')::timestamptz,
              '-infinity'::timestamptz
            )
          then scoped.followup_sent_at
          else nullif(scoped.list_payload ->> 'offerEmailSentAt', '')::timestamptz
        end,
        'offerAutoFollowUpSentAt', scoped.followup_sent_at,
        'offerAutoFollowUpVersionId', scoped.followup_version_id,
        'offerAutoFollowUpVersionNumber', scoped.followup_version_number,
        'offerAutoFollowUpSourceSentAt', scoped.followup_source_email_sent_at,
        'offerAutoFollowUpReminderNumber', scoped.followup_reminder_number,
        '__createdByUserId', scoped.created_by::text,
        '__createdByName', scoped.created_by_name,
        '__createdAt', scoped.created_at,
        '__searchText', concat_ws(
          ' ',
          scoped.list_payload ->> 'customer',
          scoped.list_payload ->> 'title',
          scoped.list_payload ->> 'offerTitle',
          scoped.list_payload ->> 'address',
          scoped.list_payload ->> 'postnr',
          scoped.list_payload ->> 'city',
          scoped.list_payload ->> 'phone',
          scoped.list_payload ->> 'email',
          scoped.request_ref,
          scoped.list_payload ->> 'responsible',
          scoped.list_payload ->> 'surveyResponsible',
          scoped.list_payload ->> 'projectResponsible',
          scoped.list_payload ->> 'source',
          scoped.effective_status,
          scoped.list_payload ->> 'nextStep',
          scoped.created_by_name,
          scoped.list_payload ->> '__offerSearchText'
        ),
        '__summaryOnly', true
      )
    ) as payload
  from scoped
  order by scoped.updated_at desc nulls last;
end;
$function$;

revoke all on function public.list_sales_request_summaries(uuid) from public;
revoke all on function public.list_sales_request_summaries(uuid) from anon;
grant execute on function public.list_sales_request_summaries(uuid) to authenticated;
