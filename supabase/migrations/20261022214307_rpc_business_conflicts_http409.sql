-- Business conflicts are HTTP 409, never a request to replay a transaction.
-- Only the 46 audited definitions below may change. Preserve every check and grant.
do $migration$
declare
  item record; definition text; changed text; before_meta jsonb; after_meta jsonb;
  targets jsonb := '[]'::jsonb; affected integer := 0;
begin
  -- Validate the entire manifest before changing any function.
  for item in select * from (values
      ('company_admin_private.apply_invite_options(uuid,uuid)', 'cbb66d95083e208eb0aae608af92fa6b', 1, false),
      ('public.company_admin_set_role(uuid,uuid,text,text)', 'f2d5da23b73627e525153e64ecb7ab82', 1, false),
      ('public.company_admin_set_status(uuid,uuid,jsonb,boolean)', 'ece9f410a9d1ef708dee232c1ca33d03', 1, false),
      ('public.controller_access_command(uuid,text,uuid,text,text,timestamp with time zone,bigint)', '647801c1b44710da58706ebc5e476559', 2, false),
      ('public.hr_contact_save(uuid,uuid,integer,integer,jsonb)', '8088222baebabe84bb032a0963bff2e5', 2, false),
      ('public.hr_content_purge(uuid,uuid,integer,text)', '26d8ab1938e50257193736874d98d2c9', 1, false),
      ('public.hr_conversation_command(uuid,uuid,integer,uuid,integer,text,jsonb)', '3ffcd308f35650d0ed085690b095d481', 2, false),
      ('public.hr_conversation_feedback_handle(uuid,uuid,integer,uuid,integer)', '9e234c6359f10e3592872608c9d265ed', 2, false),
      ('public.hr_conversation_notify(uuid,uuid,integer,uuid,integer)', '10d734256d5fd718dd6428d247d2f936', 2, false),
      ('public.hr_conversation_reminder(uuid,uuid,integer,uuid,integer,boolean)', '79357bd36f2297e4d0065df04dc38804', 2, false),
      ('public.hr_conversation_schedule_at_place(uuid,uuid,integer,uuid,integer,date,text,text)', '944587aa263f1490aba3a0558b92e3ce', 2, false),
      ('public.hr_conversation_schedule(uuid,uuid,integer,uuid,integer,date,text)', '161a1247de53f6c106aab740a3fe6f13', 2, false),
      ('public.hr_conversation_start_at_place(uuid,uuid,integer,uuid,uuid,integer,date,text,text)', '0edb7daa2cf0b739fc096ed86c0bccae', 2, false),
      ('public.hr_conversation_start_at(uuid,uuid,integer,uuid,uuid,integer,date,text)', 'a85651dc84787fb7b8ba1b286ef52c5b', 2, false),
      ('public.hr_conversation_start(uuid,uuid,integer,uuid,uuid,integer,date)', '2d236f700e4bbfc78b74fd7021f9eb8b', 2, false),
      ('public.hr_employee_command(uuid,text,jsonb)', '3269cdf0cc57f582321b0e54af7179e2', 1, false),
      ('public.hr_foundation_configure(uuid,integer,boolean,text,text,date)', '0bcd6cffd3074895854ed8d83c873631', 1, false),
      ('public.hr_sick_leave_command(uuid,uuid,integer,uuid,integer,text,jsonb)', '7ec655d09742c9730e75a66e140cb71d', 2, false),
      ('public.hr_sick_leave_start(uuid,uuid,integer,uuid,uuid,integer,date,text)', 'bc44d710144517464dd1c251de79b917', 2, false),
      ('public.hr_template_save(uuid,uuid,integer,jsonb,boolean)', 'ed6e12d3e3efaf862c519668e7262bf1', 1, false),
      ('public.kshms_acknowledge_batch(uuid,uuid,uuid[],text)', '813b4d2a83efddff2c3fe5e0154ffc84', 1, false),
      ('public.kshms_checklist_command(uuid,text,uuid,jsonb)', 'f270be2ce2eee6eea761f12ab1042944', 3, false),
      ('public.kshms_command(uuid,text,jsonb)', '3c2a238e3e99efe59210798ca165b599', 4, false),
      ('public.kshms_deviation_command(uuid,text,jsonb)', '8486f050498045d9a4ed6655f0b3f691', 1, false),
      ('public.kshms_execution_command(uuid,text,uuid,jsonb)', '1c1bec194290b9dc8ef2374c17ee14de', 2, false),
      ('public.kshms_progress_save(uuid,uuid,integer,text,text,text,jsonb,boolean)', 'b54665cce750041f0716789ba5784b7c', 3, false),
      ('public.kshms_publish_batch(uuid,uuid,jsonb,text,text,boolean,boolean,text)', 'c125d832eb7228bfc48e92ed78bf4112', 2, false),
      ('public.kshms_sja_command(uuid,text,uuid,jsonb)', '055cab6e08f0e24194356cdd0e130a2c', 3, false),
      ('public.organization_command(uuid,integer,text,jsonb)', 'd2f28a61774fb50dc087d3433a362468', 2, false),
      ('public.organization_group_command(uuid,uuid,integer,text,jsonb)', '5037226010a65e40b131b3cda18974d4', 1, false),
      ('public.organization_group_create(uuid,jsonb)', '55b5100a6c2e72655756d1ee72d7c76b', 1, false),
      ('public.organization_save_layout(uuid,integer,jsonb)', 'e1fafdc79fa25ce8d88fdd43d3cb7ceb', 1, false),
      ('public.people_modules_company_set(uuid,jsonb,boolean,boolean)', 'fad2803593d71f77c0f177e0b578368a', 1, false),
      ('public.people_modules_user_set(uuid,uuid,jsonb,boolean,text,boolean)', 'eb6fc00c13c52d4c1bb588d57d290ffe', 1, false),
      ('public.project_checklist_command(uuid,uuid,text,uuid,jsonb)', '7adda9b6db0db17645221d2e5960971c', 3, false),
      ('public.project_progress_editor(uuid,jsonb,boolean,bigint)', 'ec25247a54c91790ca1e35f32e5b6aa2', 1, false),
      ('public.rename_my_company_display_name(uuid,text,text)', 'a46973738c7c7ec9c9a22a9466037a39', 1, false),
      ('public.save_company_customer(jsonb,uuid,bigint,uuid)', '161b5c581a3d836054349895c131d9fa', 1, false),
      ('public.stocktake_admin_set(uuid,boolean,integer)', 'a2205e402eadadca0d5e4018a738b8b4', 1, false),
      ('public.stocktake_record(uuid,uuid,uuid,jsonb)', 'e1d79db38b3fd4b7c36a7b346747110e', 2, true),
      ('public.support_update(uuid,uuid,integer,text,uuid)', '0beb171d19ae17857b6fd80b7d9833bf', 1, false),
      ('public.time_export_create(uuid,uuid,date,date,integer)', 'eefa4aa7eada8b0671e1c9dbdb31303f', 2, false),
      ('public.time_file_begin(uuid,uuid,uuid,text,integer,text,text)', 'd69cb5ddf782883060ab7640249db393', 1, false),
      ('public.time_setup_save(uuid,integer,jsonb)', 'd44a3e483dc2cdcd6beb46af66c95a2a', 1, false),
      ('public.time_sheet_command(uuid,date,uuid,integer,uuid,text,jsonb,boolean,text)', '0796b2130a49818d74149adcad7ee074', 2, false),
      ('public.time_timer_command_v2(uuid,text,uuid,uuid,uuid,text,integer,text)', 'd5edc34eb89d6e3e7454e2d725dfe5ce', 2, false)
  ) as approved(signature, definition_md5, raises, keep_legacy_handler)
  loop
    if to_regprocedure(item.signature) is null then
      raise exception 'Missing audited function: %', item.signature;
    end if;
    select pg_get_functiondef(p.oid),
      jsonb_build_object('owner',p.proowner,'acl',p.proacl,'config',p.proconfig,'definer',p.prosecdef)
      into definition, before_meta from pg_proc p where p.oid=to_regprocedure(item.signature);
    if md5(definition) <> item.definition_md5
      or (select count(*) from regexp_matches(definition, $pattern$errcode[[:space:]]*=[[:space:]]*'40001'$pattern$, 'gi')) <> item.raises then
      raise exception 'Audited function changed; review before migration: %', item.signature;
    end if;
    targets := targets || jsonb_build_array(to_jsonb(item) || jsonb_build_object('definition',definition,'metadata',before_meta));
  end loop;
  for item in select * from jsonb_to_recordset(targets)
    as entry(signature text, definition text, raises integer, keep_legacy_handler boolean, metadata jsonb)
  loop
    definition := item.definition;
    changed := regexp_replace(definition, $pattern$(errcode[[:space:]]*=[[:space:]]*)'40001'$pattern$, $replacement$\1'PT409'$replacement$, 'gi');
    if item.keep_legacy_handler then
      -- Preserve handling of genuine PostgreSQL serialization failures as well.
      changed := replace(changed, $old$or sqlstate '40001' or sqlstate '55000'$old$,
        $new$or sqlstate '40001' or sqlstate 'PT409' or sqlstate '55000'$new$);
    end if;
    execute changed;
    select pg_get_functiondef(p.oid),
      jsonb_build_object('owner',p.proowner,'acl',p.proacl,'config',p.proconfig,'definer',p.prosecdef)
      into definition, after_meta from pg_proc p where p.oid=to_regprocedure(item.signature);
    if definition is distinct from changed or after_meta is distinct from item.metadata then
      raise exception 'Unexpected function or permission change: %', item.signature;
    end if;
    affected := affected + 1;
  end loop;
  if affected <> 46 then raise exception 'Expected 46 audited conflict functions, found %', affected; end if;
end
$migration$;
