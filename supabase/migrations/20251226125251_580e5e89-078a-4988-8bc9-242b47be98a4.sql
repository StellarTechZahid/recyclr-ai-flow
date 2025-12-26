-- Brand Voice Profiles table
CREATE TABLE public.brand_voice_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT[] DEFAULT '{}',
  vocabulary JSONB DEFAULT '{}',
  sample_content TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand voice profiles" ON public.brand_voice_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own brand voice profiles" ON public.brand_voice_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brand voice profiles" ON public.brand_voice_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brand voice profiles" ON public.brand_voice_profiles FOR DELETE USING (auth.uid() = user_id);

-- Audience Personas table
CREATE TABLE public.audience_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  demographics JSONB DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  preferred_platforms TEXT[] DEFAULT '{}',
  content_preferences JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audience_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audience personas" ON public.audience_personas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own audience personas" ON public.audience_personas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audience personas" ON public.audience_personas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audience personas" ON public.audience_personas FOR DELETE USING (auth.uid() = user_id);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  target_platforms TEXT[] DEFAULT '{}',
  audience_persona_id UUID REFERENCES public.audience_personas(id) ON DELETE SET NULL,
  brand_voice_id UUID REFERENCES public.brand_voice_profiles(id) ON DELETE SET NULL,
  content_pieces JSONB DEFAULT '[]',
  schedule JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  metrics JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Trend Data table
CREATE TABLE public.trend_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  trend_type TEXT NOT NULL,
  trend_name TEXT NOT NULL,
  description TEXT,
  relevance_score NUMERIC DEFAULT 0,
  volume_data JSONB DEFAULT '{}',
  related_hashtags TEXT[] DEFAULT '{}',
  suggested_content TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trend_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trend data" ON public.trend_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own trend data" ON public.trend_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trend data" ON public.trend_data FOR DELETE USING (auth.uid() = user_id);

-- AI Generated Content table
CREATE TABLE public.ai_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  original_input TEXT,
  generated_output TEXT NOT NULL,
  platform TEXT,
  ai_model TEXT,
  metadata JSONB DEFAULT '{}',
  rating INTEGER,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI generated content" ON public.ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI generated content" ON public.ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI generated content" ON public.ai_generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own AI generated content" ON public.ai_generated_content FOR DELETE USING (auth.uid() = user_id);

-- Influencer Matches table
CREATE TABLE public.influencer_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  influencer_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  niche TEXT[] DEFAULT '{}',
  follower_count INTEGER,
  engagement_rate NUMERIC,
  match_score NUMERIC,
  contact_info JSONB DEFAULT '{}',
  collaboration_ideas TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'discovered',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.influencer_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own influencer matches" ON public.influencer_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own influencer matches" ON public.influencer_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own influencer matches" ON public.influencer_matches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own influencer matches" ON public.influencer_matches FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_brand_voice_profiles_updated_at BEFORE UPDATE ON public.brand_voice_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audience_personas_updated_at BEFORE UPDATE ON public.audience_personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_influencer_matches_updated_at BEFORE UPDATE ON public.influencer_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();