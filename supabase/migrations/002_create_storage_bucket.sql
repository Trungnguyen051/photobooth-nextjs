-- Create storage bucket for photos if it doesn't exist
-- This migration ensures the photos bucket is created properly

-- First, create the bucket
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'photos'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'photos',
            'photos',
            true,
            10485760, -- 10MB limit
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        );
    END IF;
END $$;

-- Create comprehensive storage policies
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads to photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access to photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access to photos bucket" ON storage.objects;

-- Create new policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- Verify bucket was created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photos') THEN
        RAISE NOTICE 'Photos bucket created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create photos bucket';
    END IF;
END $$;
