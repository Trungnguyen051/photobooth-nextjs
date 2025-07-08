# Manual Database Setup Instructions

Since the database tables don't exist yet, you need to set them up manually in your Supabase dashboard. Follow these steps:

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**

## Step 2: Create the Tables

Copy and paste this SQL code into the SQL editor and run it:

```sql
-- Create photo_sessions table
CREATE TABLE photo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES photo_sessions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_photos_session_id ON photos(session_id);
CREATE INDEX idx_photos_order ON photos(session_id, order_number);

-- Enable Row Level Security (RLS)
ALTER TABLE photo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to photo_sessions" ON photo_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to photo_sessions" ON photo_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to photos" ON photos
  FOR INSERT WITH CHECK (true);
```

## Step 3: Create the Storage Bucket (MANUAL ONLY)

**Important**: Storage bucket creation requires admin privileges and cannot be done via the anon key. You MUST create it manually.

1. Navigate to **Storage** in the left sidebar of your Supabase dashboard
2. Click **"Create a new bucket"**
3. Fill in the details:
   - **Name**: `photos` (exactly this, case-sensitive)
   - **Public bucket**: ✅ **YES** (absolutely critical!)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: Add these one by one:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
4. Click **"Create bucket"**

**Double-check**: Make sure "Public bucket" is enabled! This is the most common cause of upload failures.

## Step 4: Set Storage Policies

Go back to **SQL Editor** and run this SQL to set up storage policies:

```sql
-- Create policies for storage bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'photos');
```

## Step 5: Verify Setup

After completing the above steps, run the test script to verify everything is working:

```bash
node scripts/test-supabase.js
```

You should see:

- ✅ Database connection successful
- ✅ Photos bucket exists and is public
- ✅ File upload successful

## Step 6: Test Your App

Once the setup is complete, try using your photobooth app:

1. Capture 4 photos
2. Click "Save to Gallery"
3. Check the browser console for any errors

## Troubleshooting

### If you get permission errors:

- Make sure the storage bucket is marked as **public**
- Verify all the storage policies were created successfully

### If tables still don't exist:

- Double-check that you ran the SQL in Step 2 successfully
- Look for any error messages in the SQL editor

### If uploads fail:

- Check that your `.env.local` file has the correct Supabase credentials
- Verify the bucket name is exactly `photos` (case-sensitive)

## Environment Variables

Make sure you have a `.env.local` file in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard under **Settings > API**.
