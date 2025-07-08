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

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to photo_sessions" ON photo_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to photo_sessions" ON photo_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to photos" ON photos
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Create policies for storage bucket
CREATE POLICY "Allow public uploads to photos bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow public read access to photos bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Allow public update access to photos bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos');

CREATE POLICY "Allow public delete access to photos bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos');
