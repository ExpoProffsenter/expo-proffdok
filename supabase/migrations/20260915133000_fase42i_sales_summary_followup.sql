-- Expo ProffDok – FASE 42I
-- Andre additive steg: behold oppfølgingsmetadata i lettvektslisten, men ikke
-- publicToken eller andre felt som kan trigge full tilbudshydrering i klienten.

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

  if v_company_id is null then
    return;
  end if;

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
      sr.payload,
      latest_offer.offer_status,
      latest_offer.offer_accepted_at,
      latest_offer.offer_declined_at,
      store_meta.store_offer_meta,
      offer_search.offer_search_text,
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
      select
        o.status as offer_status,
        o.accepted_at as offer_accepted_at,
        o.declined_at as offer_declined_at
      from public.sales_offers o
      where o.company_id = sr.company_id
        and o.request_ref = sr.request_ref
      order by o.updated_at desc nulls last, o.created_at desc nulls last
      limit 1
    ) latest_offer on true
    left join lateral (
      select
        n.sent_at,
        n.offer_version_id,
        n.reminder_number,
        n.source_email_sent_at,
        v.version_number
      from public.sales_offer_follow_up_notifications n
      left join public.sales_offer_versions v on v.id = n.offer_version_id
      where n.company_id = sr.company_id
        and n.request_ref = sr.request_ref
        and n.status = 'sent'
      order by n.sent_at desc nulls last
      limit 1
    ) latest_followup on true
    left join lateral (
      select coalesce(
        case
          when jsonb_typeof(sr.payload -> 'storeOfferMeta') = 'object'
            then sr.payload -> 'storeOfferMeta'
          else null::jsonb
        end,
        (
          select item.elem
          from jsonb_array_elements(
            case
              when jsonb_typeof(sr.payload -> 'offerLines') = 'array'
                then sr.payload -> 'offerLines'
              else '[]'::jsonb
            end
          ) item(elem)
          where item.elem ->> '__storeOfferMeta' = 'true'
          limit 1
        )
      ) as store_offer_meta
    ) store_meta on true
    left join lateral (
      select string_agg(
        concat_ws(
          ' ',
          item.elem ->> 'title',
          item.elem ->> 'description',
          item.elem ->> 'mainPostTitle',
          item.elem ->> 'internalProductNumber',
          item.elem ->> 'storeSupplierName',
          item.elem ->> 'storeSupplierProductNumber',
          item.elem ->> 'gtin',
          item.elem ->> 'nobbNumber'
        ),
        ' '
      ) as offer_search_text
      from (
        select line.elem
        from jsonb_array_elements(
          case
            when jsonb_typeof(sr.payload -> 'offerLines') = 'array'
              then sr.payload -> 'offerLines'
            else '[]'::jsonb
          end
        ) line(elem)
        union all
        select option_item.elem
        from jsonb_array_elements(
          case
            when jsonb_typeof(sr.payload -> 'offerOptions') = 'array'
              then sr.payload -> 'offerOptions'
            else '[]'::jsonb
          end
        ) option_item(elem)
      ) item
    ) offer_search on true
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
      jsonb_build_object(
        'customer', scoped.payload ->> 'customer',
        'title', scoped.payload ->> 'title',
        'offerTitle', scoped.payload ->> 'offerTitle',
        'address', scoped.payload ->> 'address',
        'postnr', scoped.payload ->> 'postnr',
        'city', scoped.payload ->> 'city',
        'phone', scoped.payload ->> 'phone',
        'email', scoped.payload ->> 'email',
        'responsible', scoped.payload ->> 'responsible',
        'surveyResponsible', scoped.payload ->> 'surveyResponsible',
        'projectResponsible', scoped.payload ->> 'projectResponsible',
        'source', scoped.payload ->> 'source',
        'surveyDate', scoped.payload ->> 'surveyDate',
        'surveyTime', scoped.payload ->> 'surveyTime',
        'projectId', scoped.payload ->> 'projectId',
        'projectName', scoped.payload ->> 'projectName',
        'directOffer', scoped.payload -> 'directOffer',
        'offerEmailVersionNumber', scoped.payload -> 'offerEmailVersionNumber',
        'sentOfferVersionNumber', scoped.payload -> 'sentOfferVersionNumber',
        'storeOfferMeta', scoped.store_offer_meta,
        'status', scoped.effective_status,
        'statusClass', case
          when scoped.effective_status = 'Akseptert' then 'sales-status-accepted'
          when scoped.effective_status = 'Avvist' then 'sales-status-declined'
          when scoped.effective_status = 'Befaring' then 'sales-status-survey'
          when scoped.effective_status = 'Tilbud' then 'sales-status-quote'
          else scoped.payload ->> 'statusClass'
        end,
        'nextStep', case
          when scoped.effective_status = 'Akseptert' then 'Aktiver som prosjekt'
          when scoped.effective_status = 'Avvist' then 'Tilbud avvist'
          else scoped.payload ->> 'nextStep'
        end,
        'iconName', case
          when scoped.effective_status = 'Akseptert' then 'home'
          when scoped.effective_status = 'Avvist' then 'declined'
          else scoped.payload ->> 'iconName'
        end,
        'acceptedAt', coalesce(to_jsonb(scoped.offer_accepted_at), scoped.payload -> 'acceptedAt'),
        'declinedAt', coalesce(to_jsonb(scoped.offer_declined_at), scoped.payload -> 'declinedAt'),
        'offerOriginalEmailSentAt', scoped.payload ->> 'offerEmailSentAt',
        'offerEmailSentAt', case
          when scoped.followup_sent_at is not null
            and scoped.followup_version_number is not null
            and scoped.followup_version_number = coalesce(
              nullif(scoped.payload ->> 'offerEmailVersionNumber', '')::integer,
              nullif(scoped.payload ->> 'sentOfferVersionNumber', '')::integer,
              0
            )
            and scoped.followup_sent_at >= coalesce(
              nullif(scoped.payload ->> 'offerEmailSentAt', '')::timestamptz,
              '-infinity'::timestamptz
            )
          then scoped.followup_sent_at
          else nullif(scoped.payload ->> 'offerEmailSentAt', '')::timestamptz
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
          scoped.payload ->> 'customer',
          scoped.payload ->> 'title',
          scoped.payload ->> 'offerTitle',
          scoped.payload ->> 'address',
          scoped.payload ->> 'postnr',
          scoped.payload ->> 'city',
          scoped.payload ->> 'phone',
          scoped.payload ->> 'email',
          scoped.request_ref,
          scoped.payload ->> 'responsible',
          scoped.payload ->> 'surveyResponsible',
          scoped.payload ->> 'projectResponsible',
          scoped.payload ->> 'source',
          scoped.effective_status,
          scoped.payload ->> 'nextStep',
          scoped.created_by_name,
          scoped.offer_search_text
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
