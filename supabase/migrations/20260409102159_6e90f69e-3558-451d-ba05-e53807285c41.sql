
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can update their own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND subscription_tier = (SELECT s.subscription_tier FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND subscription_status = (SELECT s.subscription_status FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND subscribed = (SELECT s.subscribed FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND repurposes_limit = (SELECT s.repurposes_limit FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND repurposes_used = (SELECT s.repurposes_used FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT s.stripe_customer_id FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND trial_end IS NOT DISTINCT FROM (SELECT s.trial_end FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
  AND subscription_end IS NOT DISTINCT FROM (SELECT s.subscription_end FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
);
