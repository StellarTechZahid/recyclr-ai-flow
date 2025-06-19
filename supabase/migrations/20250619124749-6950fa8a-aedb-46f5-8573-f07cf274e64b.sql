
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create content table for storing user content
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('document', 'blog_post', 'social_post', 'video_script', 'note')),
  original_content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'google_docs', 'manual', 'url')),
  source_url TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies for content
CREATE POLICY "Users can view their own content" 
  ON public.content 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own content" 
  ON public.content 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own content" 
  ON public.content 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own content" 
  ON public.content 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create repurposed_content table for AI-generated variations
CREATE TABLE public.repurposed_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'blog')),
  content_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on repurposed_content
ALTER TABLE public.repurposed_content ENABLE ROW LEVEL SECURITY;

-- Create policies for repurposed_content
CREATE POLICY "Users can view their own repurposed content" 
  ON public.repurposed_content 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own repurposed content" 
  ON public.repurposed_content 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own repurposed content" 
  ON public.repurposed_content 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own repurposed content" 
  ON public.repurposed_content 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for content files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-files', 'content-files', true);

-- Create policy for content files bucket
CREATE POLICY "Users can upload content files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'content-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view content files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'content-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update content files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'content-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete content files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'content-files' AND auth.uid()::text = (storage.foldername(name))[1]);
