# Firmaets kunderegister

Opt-in saved customer profiles, shared only within the active authenticated company. No automatic backfill or saving of one-time customers. Available in existing new/edit project and request/offer customer fields. The checkbox starts off; an explicit Save customer button persists only contact/address data, not project or offer data. Selecting a profile copies data into the existing draft; later profile edits never update historical projects/offers. Users must check project address after reuse.

Server scope uses approved, active profile and current_active_company_scope_id with membership validation. RPC accepts no company selector; expected company is a fail-closed guard for work-profile changes, not a routing parameter. Table has RLS and no direct client privileges. All mutations use scoped security-definer RPC, revision guard prevents silent concurrent overwrites. Existing Systemadmin support editing remains disabled.

CompanyCustomerSearch offers dropdown and search; CompanyCustomerSave is a separate framed opt-in at the bottom before create-offer actions. Shared provider preserves selected revision and company-change fencing. The initial dropdown loads up to 30 scoped profiles; name/email search narrows larger registries.
