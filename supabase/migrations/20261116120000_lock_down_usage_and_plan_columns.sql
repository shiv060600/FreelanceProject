-- Lock down plan / usage data that clients could previously write themselves.
--
-- Found by dumping the live `public` schema:
--   * daily_reset() is SECURITY DEFINER and executable by anon/authenticated,
--     so anyone holding the public anon key could reset EVERY user's AI usage.
--   * handle_ai_usage(user_id_param) trusted the caller-supplied id and was
--     executable by anon, so anyone could burn another user's daily quota.
--   * user_usage had a FOR ALL policy: a user could set their own ai_uses = 0.
--   * users had unrestricted UPDATE on the caller's own row (grants + policy
--     have no column limits), so a user could set subscription = 'Unlimited
--     Freelancer', raise max_invoices / max_contracts, or edit lifetime_earnings.
--
-- Server-side code (service_role, Stripe/Polar webhook, pg_cron as postgres)
-- is unaffected: those roles bypass RLS and keep their grants.

-- 1) daily_reset: only the database owner / service role (cron) may call it.
REVOKE EXECUTE ON FUNCTION public.daily_reset() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.daily_reset() TO service_role;

-- 2) handle_ai_usage: signed-in users may only increment THEIR OWN counter.
--    Signature is unchanged, so /api/ai-contract-generate keeps working.
CREATE OR REPLACE FUNCTION public.handle_ai_usage(user_id_param text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_usage integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND user_id_param IS DISTINCT FROM (SELECT auth.uid())::text THEN
    RAISE EXCEPTION 'not allowed to change another user''s usage'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_usage (user_id, ai_uses)
  VALUES (user_id_param, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET ai_uses = public.user_usage.ai_uses + 1
  RETURNING ai_uses INTO current_usage;

  RETURN current_usage;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_ai_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_ai_usage(text) TO authenticated, service_role;

-- 3) user_usage: read-only for users; writes go through handle_ai_usage().
DROP POLICY IF EXISTS "Users can manage their own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_usage;
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid())::text = user_id);

REVOKE ALL ON TABLE public.user_usage FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_usage FROM authenticated;

-- 4) users: clients may only edit harmless profile columns.
--    Plan and limit columns (subscription, subscription_status, credits,
--    max_invoices, max_contracts, lifetime_earnings, total_paid_invoices,
--    email, user_id, token_identifier, email_verified, ...) are now writable
--    by service_role only.
REVOKE UPDATE, INSERT, DELETE ON TABLE public.users FROM anon, authenticated;
REVOKE SELECT ON TABLE public.users FROM anon;
GRANT UPDATE (name, full_name, avatar_url, image, cash_app_username, venmo_username)
  ON TABLE public.users TO authenticated;

-- invoice_count is still incremented from the browser in
-- create-invoice-dialog.tsx, so it stays writable for now. That means the
-- free-plan invoice cap can still be bypassed; the real fix is a trigger on
-- public.invoices that maintains invoice_count, after which this grant should
-- be removed.
GRANT UPDATE (invoice_count) ON TABLE public.users TO authenticated;
