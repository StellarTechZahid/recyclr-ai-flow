-- Create post_analytics table for real-time engagement tracking
CREATE TABLE public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analytics" 
ON public.post_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics for their posts" 
ON public.post_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.post_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_post_analytics_user_id ON public.post_analytics(user_id);
CREATE INDEX idx_post_analytics_platform ON public.post_analytics(platform);
CREATE INDEX idx_post_analytics_recorded_at ON public.post_analytics(recorded_at);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_analytics_updated_at
BEFORE UPDATE ON public.post_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for aggregated analytics
CREATE VIEW public.user_analytics_summary AS
SELECT 
  user_id,
  platform,
  COUNT(*) as total_posts,
  SUM(views) as total_views,
  SUM(likes) as total_likes,
  SUM(shares) as total_shares,
  SUM(comments) as total_comments,
  SUM(clicks) as total_clicks,
  AVG(engagement_rate) as avg_engagement_rate,
  DATE_TRUNC('day', recorded_at) as date
FROM public.post_analytics
GROUP BY user_id, platform, DATE_TRUNC('day', recorded_at)
ORDER BY date DESC;