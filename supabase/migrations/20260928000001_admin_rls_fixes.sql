-- Fix reported RLS failures:
--   1. "new row violates row-level security policy for table promo_codes"
--   2. recognitions reads/writes denied (admin list, member nominations)
-- Root causes: policies missing or is_admin() not present in the live DB.

-- ---------------------------------------------------------------------------
-- 1. Admin helper (idempotent — safe if already exists)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. promo_codes + user_promo_codes policies (re-asserted idempotently)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "admins_manage_promo_codes" ON public.promo_codes;
CREATE POLICY "admins_manage_promo_codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_read_active_promo_codes" ON public.promo_codes;
CREATE POLICY "users_read_active_promo_codes" ON public.promo_codes
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "users_read_own_redemptions" ON public.user_promo_codes;
CREATE POLICY "users_read_own_redemptions" ON public.user_promo_codes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_redemptions" ON public.user_promo_codes;
CREATE POLICY "users_insert_own_redemptions" ON public.user_promo_codes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. recognitions nominee policies — CRITICAL FIX
--    Migration 20260925000003 created these with (SELECT email FROM auth.users)
--    inside the policy expression. The authenticated/anon roles cannot read
--    auth.users, so EVERY query on recognitions fails with:
--      42501 "permission denied for table users"
--    Postgres evaluates all permissive policies, so the broken subquery breaks
--    even reads that other policies would allow. Fixed to use the JWT email
--    claim instead — no auth.users access required.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "recognitions_nominee_select" ON public.recognitions;
CREATE POLICY "recognitions_nominee_select" ON public.recognitions
  FOR SELECT TO authenticated
  USING (
    lower(nominee_email) = lower(auth.jwt() ->> 'email')
    OR nominee_email = (SELECT lower(email) FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "recognitions_nominee_update" ON public.recognitions;
CREATE POLICY "recognitions_nominee_update" ON public.recognitions
  FOR UPDATE TO authenticated
  USING (
    lower(nominee_email) = lower(auth.jwt() ->> 'email')
    OR nominee_email = (SELECT lower(email) FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    lower(nominee_email) = lower(auth.jwt() ->> 'email')
    OR nominee_email = (SELECT lower(email) FROM public.profiles WHERE id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 4. recognitions: public/member/admin access
--    - public can read published recognitions (Recognition page)
--    - members can submit nominations addressed to themselves
--    - members can read their own nominations
--    - admins can do everything
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "recognitions_public_read" ON public.recognitions;
CREATE POLICY "recognitions_public_read" ON public.recognitions
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "recognitions_submitter_insert" ON public.recognitions;
CREATE POLICY "recognitions_submitter_insert" ON public.recognitions
  FOR INSERT TO authenticated
  WITH CHECK (
    submitter_id = auth.uid()
    OR lower(submitter_email) = (SELECT lower(email) FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "recognitions_submitter_select" ON public.recognitions;
CREATE POLICY "recognitions_submitter_select" ON public.recognitions
  FOR SELECT TO authenticated
  USING (
    submitter_id = auth.uid()
    OR lower(submitter_email) = (SELECT lower(email) FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "recognitions_admin_all" ON public.recognitions;
CREATE POLICY "recognitions_admin_all" ON public.recognitions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Make sure the site admin account actually has role = 'admin'.
--    Without this, is_admin() returns false and every admin write is denied.
-- ---------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@summerlandestates.com'
  AND (role IS DISTINCT FROM 'admin');

-- Diagnostic: run this to confirm
--   select email, role from public.profiles where email = 'admin@summerlandestates.com';
