-- Make the content-files storage bucket private to require authentication for reads
UPDATE storage.buckets SET public = false WHERE id = 'content-files';

-- Add RLS policy for authenticated users to read their own files
-- (This may already exist, but we ensure it's in place)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view their own files' 
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can view their own files" 
    ON storage.objects 
    FOR SELECT 
    USING (
      bucket_id = 'content-files' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;