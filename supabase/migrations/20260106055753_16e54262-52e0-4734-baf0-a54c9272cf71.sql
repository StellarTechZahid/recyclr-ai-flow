-- Fix 1: Recreate user_analytics_summary as a secure view
-- First drop the existing view
DROP VIEW IF EXISTS public.user_analytics_summary;

-- Recreate with security_invoker = true (Postgres 15+)
CREATE VIEW public.user_analytics_summary
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  platform,
  date_trunc('day', recorded_at) as date,
  COUNT(*) as total_posts,
  SUM(views) as total_views,
  SUM(likes) as total_likes,
  SUM(comments) as total_comments,
  SUM(shares) as total_shares,
  SUM(clicks) as total_clicks,
  AVG(engagement_rate) as avg_engagement_rate
FROM public.post_analytics
GROUP BY user_id, platform, date_trunc('day', recorded_at);

-- Fix 2: Remove redundant email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update handle_new_user function to not copy email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;