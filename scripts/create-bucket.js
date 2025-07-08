// Simple script to create the photos bucket using Supabase API
// Run with: node scripts/create-bucket.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createPhotosBucket() {
  console.log('🔧 Creating photos storage bucket...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!')
    console.log('Please create a .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    return
  }

  console.log('🔗 Connecting to Supabase...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // First, let's see what buckets exist
    console.log('\n📋 Checking existing buckets...')
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets()

    if (listError) {
      console.log('❌ Failed to list buckets:', listError.message)
      console.log('This might indicate a connection or permission issue')
      return
    }

    console.log(
      'Current buckets:',
      buckets.map((b) => b.name),
    )

    const existingBucket = buckets.find((bucket) => bucket.name === 'photos')

    if (existingBucket) {
      console.log('✅ Photos bucket already exists!')
      console.log('Bucket details:', existingBucket)
    } else {
      console.log('\n📁 Creating photos bucket...')

      // Try to create the bucket
      const { data: newBucket, error: createError } =
        await supabase.storage.createBucket('photos', {
          public: true,
        })

      if (createError) {
        console.log('❌ Failed to create bucket:', createError.message)
        console.log('Error details:', createError)

        // Provide manual instructions
        console.log('\n💡 Manual Creation Required:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Navigate to Storage section')
        console.log('3. Click "Create a new bucket"')
        console.log('4. Set name to: photos')
        console.log('5. Enable "Public bucket": YES')
        console.log('6. Click "Create bucket"')
        return
      }

      console.log('✅ Photos bucket created successfully!')
      console.log('New bucket:', newBucket)
    }

    // Test upload to verify the bucket works
    console.log('\n🧪 Testing bucket functionality...')

    // Create a simple test file
    const testContent = 'Hello from photobooth!'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    const testPath = `test-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(testPath, testFile)

    if (uploadError) {
      console.log('❌ Test upload failed:', uploadError.message)
      console.log('This might be a permissions issue')
    } else {
      console.log('✅ Test upload successful!')

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(testPath)

      console.log('✅ Public URL generated:', urlData.publicUrl)

      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('photos')
        .remove([testPath])

      if (!deleteError) {
        console.log('✅ Test file cleaned up')
      }
    }

    console.log('\n🎉 Bucket setup complete!')
    console.log('Now run: node scripts/test-supabase.js')
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Full error:', error)
  }
}

createPhotosBucket()
