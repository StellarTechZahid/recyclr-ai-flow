
-- Phase 1: Critical Security Fixes

-- 1. Fix the overly permissive RLS policy on subscribers table
DROP POLICY IF EXISTS "Users can insert their own subscription data" ON public.subscribers;

-- Create a proper RLS policy that validates user ownership
CREATE POLICY "Users can insert their own subscription data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2. Update the increment_usage function to be more secure
CREATE OR REPLACE FUNCTION public.increment_usage(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  current_user_id UUID;
BEGIN
  -- Get current user ID for security check
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current usage and limit
  SELECT repurposes_used, repurposes_limit 
  INTO current_usage, usage_limit
  FROM public.subscribers 
  WHERE email = user_email AND user_id = current_user_id;
  
  -- Check if user exists and hasn't exceeded limit
  IF current_usage IS NULL THEN
    -- Create new user record with proper validation
    INSERT INTO public.subscribers (
      user_id, email, repurposes_used, repurposes_limit
    ) VALUES (
      current_user_id, user_email, 1, 3
    );
    RETURN TRUE;
  ELSIF current_usage < usage_limit OR usage_limit = -1 THEN
    -- Increment usage
    UPDATE public.subscribers 
    SET repurposes_used = repurposes_used + 1,
        updated_at = now()
    WHERE email = user_email AND user_id = current_user_id;
    RETURN TRUE;
  ELSE
    -- Usage limit exceeded
    RETURN FALSE;
  END IF;
END;
$function$;

-- 3. Update the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;
