
-- Update default repurposes_limit to 25
ALTER TABLE public.subscribers ALTER COLUMN repurposes_limit SET DEFAULT 25;

-- Update INSERT policy to use new limit
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
  AND repurposes_limit = 25
  AND repurposes_used = 0
  AND stripe_customer_id IS NULL
);

-- Update increment_usage function to use new limit
CREATE OR REPLACE FUNCTION public.increment_usage(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT repurposes_used, repurposes_limit 
  INTO current_usage, usage_limit
  FROM public.subscribers 
  WHERE email = user_email AND user_id = current_user_id;
  
  IF current_usage IS NULL THEN
    INSERT INTO public.subscribers (
      user_id, email, repurposes_used, repurposes_limit
    ) VALUES (
      current_user_id, user_email, 1, 25
    );
    RETURN TRUE;
  ELSIF current_usage < usage_limit OR usage_limit = -1 THEN
    UPDATE public.subscribers 
    SET repurposes_used = repurposes_used + 1,
        updated_at = now()
    WHERE email = user_email AND user_id = current_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
