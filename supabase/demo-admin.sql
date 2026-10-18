-- =====================================================================
-- OPTIONAL: demo admin login for showcasing the dashboard to clients.
--
-- 1. Run migrations/0001_schema.sql and seed.sql first.
-- 2. Change v_password below to your own password, then run this file in the SQL editor.
-- 3. Sign in at /admin with the email and password set below.
--
-- WARNING: this writes directly into Supabase's auth tables and has NOT been
-- tested against your Supabase version. If sign-in fails, delete the user
-- (see the bottom of this file) and create one in Authentication -> Users instead.
-- DELETE THIS USER BEFORE THE SITE GOES PUBLIC.
-- =====================================================================

do $$
declare
  v_email    text := 'demo@freightline.example';
  v_password text := 'ChangeMe-Demo-2026!';   -- change this before running
  v_user_id  uuid;
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      v_email, extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;

  insert into public.admin_users (user_id, email)
  values (v_user_id, v_email)
  on conflict (user_id) do nothing;

  raise notice 'Demo admin ready: % (remember to delete it before going live)', v_email;
end $$;

-- ---------------------------------------------------------------------
-- To remove the demo admin (also removes its admin_users row):
--   delete from auth.users where email = 'demo@freightline.example';
-- ---------------------------------------------------------------------
