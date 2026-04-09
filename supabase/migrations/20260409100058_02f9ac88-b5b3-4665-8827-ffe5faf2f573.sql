
-- 1. Make user_id NOT NULL to prevent null user_id insertion
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;

-- 2. Drop existing INSERT policy and replace with one that enforces safe defaults
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;

CREATE POLICY "Users can insert their own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND subscription_tier = 'free'
  AND subscription_status = 'inactive'
  AND subscribed = false
  AND repurposes_limit = 3
  AND repurposes_used = 0
  AND stripe_customer_id IS NULL
);

-- 3. Drop existing UPDATE policy and replace with restricted one
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
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT s.stripe_customer_id FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.id = subscribers.id)
);

-- 4. Update SELECT policy to use authenticated role
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
