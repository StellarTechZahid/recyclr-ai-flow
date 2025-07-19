
-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  repurposes_used INTEGER DEFAULT 0,
  repurposes_limit INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Insert subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create usage tracking function
CREATE OR REPLACE FUNCTION public.increment_usage(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get current usage and limit
  SELECT repurposes_used, repurposes_limit 
  INTO current_usage, usage_limit
  FROM public.subscribers 
  WHERE email = user_email;
  
  -- Check if user exists and hasn't exceeded limit
  IF current_usage IS NULL THEN
    -- Create new user record
    INSERT INTO public.subscribers (
      user_id, email, repurposes_used, repurposes_limit
    ) VALUES (
      auth.uid(), user_email, 1, 3
    );
    RETURN TRUE;
  ELSIF current_usage < usage_limit OR usage_limit = -1 THEN
    -- Increment usage
    UPDATE public.subscribers 
    SET repurposes_used = repurposes_used + 1,
        updated_at = now()
    WHERE email = user_email;
    RETURN TRUE;
  ELSE
    -- Usage limit exceeded
    RETURN FALSE;
  END IF;
END;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
