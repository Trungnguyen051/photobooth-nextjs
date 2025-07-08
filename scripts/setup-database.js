// Script to set up the database tables and storage
// Run with: node scripts/setup-database.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupDatabase() {
  console.log('🔧 Setting up Supabase Database...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!')
    console.log('Please create a .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('📋 Creating photo_sessions table...')

    // Create photo_sessions table
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS photo_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          session_name TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `,
    })

    if (sessionsError) {
      console.log(
        '❌ Failed to create photo_sessions table:',
        sessionsError.message,
      )
      console.log(
        '💡 You may need to run this SQL manually in the Supabase SQL editor',
      )
    } else {
      console.log('✅ photo_sessions table created successfully')
    }

    console.log('📋 Creating photos table...')

    // Create photos table
    const { error: photosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS photos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL REFERENCES photo_sessions(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          order_number INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `,
    })

    if (photosError) {
      console.log('❌ Failed to create photos table:', photosError.message)
      console.log(
        '💡 You may need to run this SQL manually in the Supabase SQL editor',
      )
    } else {
      console.log('✅ photos table created successfully')
    }

    console.log('📋 Creating indexes...')

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photos(session_id);
        CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(session_id, order_number);
      `,
    })

    if (indexError) {
      console.log('⚠️ Warning: Failed to create indexes:', indexError.message)
    } else {
      console.log('✅ Indexes created successfully')
    }

    console.log('🔒 Setting up Row Level Security...')

    // Enable RLS and create policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE photo_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow public read access to photo_sessions" ON photo_sessions;
        DROP POLICY IF EXISTS "Allow public insert access to photo_sessions" ON photo_sessions;
        DROP POLICY IF EXISTS "Allow public read access to photos" ON photos;
        DROP POLICY IF EXISTS "Allow public insert access to photos" ON photos;
        
        -- Create new policies
        CREATE POLICY "Allow public read access to photo_sessions" ON photo_sessions FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access to photo_sessions" ON photo_sessions FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow public read access to photos" ON photos FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access to photos" ON photos FOR INSERT WITH CHECK (true);
      `,
    })

    if (rlsError) {
      console.log(
        '⚠️ Warning: Failed to set up RLS policies:',
        rlsError.message,
      )
    } else {
      console.log('✅ RLS policies created successfully')
    }

    // Test the tables
    console.log('\n🧪 Testing database tables...')

    const { data: sessionsData, error: testError } = await supabase
      .from('photo_sessions')
      .select('*')
      .limit(1)

    if (testError) {
      console.log('❌ Database test failed:', testError.message)
    } else {
      console.log('✅ Database tables are working correctly')
      console.log('Found sessions:', sessionsData?.length || 0)
    }

    console.log('\n🎉 Database setup complete!')
    console.log(
      '💡 If any steps failed, you can run the SQL manually in the Supabase dashboard',
    )
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('\n💡 Manual Setup Instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the migration files in order:')
    console.log('   - supabase/migrations/001_create_photo_tables.sql')
    console.log('   - supabase/migrations/002_create_storage_bucket.sql')
  }
}

setupDatabase()
