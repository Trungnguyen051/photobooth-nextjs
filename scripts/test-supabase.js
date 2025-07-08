// Test script to diagnose Supabase connection issues
// Run with: node scripts/test-supabase.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment Variables:')
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  console.log()

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required environment variables!')
    console.log('Please create a .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test database connection
    console.log('📊 Testing database connection...')
    const { data: sessions, error: dbError } = await supabase
      .from('photo_sessions')
      .select('*')
      .limit(1)

    if (dbError) {
      console.log('❌ Database test failed:', dbError.message)
    } else {
      console.log('✅ Database connection successful')
      console.log('Found sessions:', sessions?.length || 0)
    }

    // Test storage bucket
    console.log('\n💾 Testing storage bucket...')
    const { data: buckets, error: storageError } =
      await supabase.storage.listBuckets()

    if (storageError) {
      console.log('❌ Storage test failed:', storageError.message)
    } else {
      console.log('✅ Storage connection successful')
      const photosBucket = buckets.find((bucket) => bucket.name === 'photos')
      if (photosBucket) {
        console.log(
          '✅ Photos bucket exists and is',
          photosBucket.public ? 'public' : 'private',
        )
      } else {
        console.log('❌ Photos bucket not found')
      }
    }

    // Test file upload (small test file)
    console.log('\n📁 Testing file upload...')
    const testFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    })
    const testFileName = `test_${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.log('❌ File upload test failed:', uploadError.message)
    } else {
      console.log('✅ File upload successful')

      // Test public URL generation
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(testFileName)

      console.log('✅ Public URL generated:', urlData.publicUrl)

      // Clean up test file
      await supabase.storage.from('photos').remove([testFileName])
      console.log('✅ Test file cleaned up')
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }

  console.log('\n🎯 Diagnosis complete!')
}

testSupabaseConnection()
