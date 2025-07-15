-- Add DELETE policies for photo_sessions and photos tables
-- This migration adds the missing DELETE policies that were updated in the initial migration

-- Add DELETE policy for photo_sessions
CREATE POLICY "Allow public delete access to photo_sessions" ON photo_sessions
  FOR DELETE USING (true);

-- Add UPDATE policy for photo_sessions (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'photo_sessions' 
    AND policyname = 'Allow public update access to photo_sessions'
  ) THEN
    CREATE POLICY "Allow public update access to photo_sessions" ON photo_sessions
      FOR UPDATE USING (true);
  END IF;
END $$;

-- Add DELETE policy for photos
CREATE POLICY "Allow public delete access to photos" ON photos
  FOR DELETE USING (true);

-- Add UPDATE policy for photos (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'photos' 
    AND policyname = 'Allow public update access to photos'
  ) THEN
    CREATE POLICY "Allow public update access to photos" ON photos
      FOR UPDATE USING (true);
  END IF;
END $$;
