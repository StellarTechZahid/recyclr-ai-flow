-- Fix subscribers table RLS policies
-- Remove insecure email-based access and overly permissive INSERT policy

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Insert subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

-- Create secure policies using only user_id = auth.uid()
CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription"
ON public.subscribers
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription"
ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());