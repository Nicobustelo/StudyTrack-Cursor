-- payments: SELECT only for authenticated (insert/update via service_role)
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- access_purchases: SELECT only for authenticated (insert/update via service_role)
CREATE POLICY access_purchases_select_own ON public.access_purchases
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- daily_activity (user_id)
CREATE POLICY daily_activity_select_own ON public.daily_activity
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY daily_activity_insert_own ON public.daily_activity
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY daily_activity_update_own ON public.daily_activity
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY daily_activity_delete_own ON public.daily_activity
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
