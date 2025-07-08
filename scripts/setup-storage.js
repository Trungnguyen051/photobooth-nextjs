// Script to create the photos storage bucket
// Run with: node scripts/setup-storage.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupStorageBucket() {
  console.log('🔧 Setting up Supabase Storage Bucket...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if bucket already exists
    console.log('📋 Checking existing buckets...')
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets()

    if (listError) {
      console.log('❌ Failed to list buckets:', listError.message)
      return
    }

    const existingBucket = buckets.find((bucket) => bucket.name === 'photos')

    if (existingBucket) {
      console.log('✅ Photos bucket already exists')
      console.log('Bucket is', existingBucket.public ? 'public' : 'private')
    } else {
      console.log('📁 Creating photos bucket...')

      // Create the bucket
      const { data: createData, error: createError } =
        await supabase.storage.createBucket('photos', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 10485760, // 10MB
        })

      if (createError) {
        console.log('❌ Failed to create bucket:', createError.message)
        console.log(
          '💡 You may need to create it manually in the Supabase dashboard',
        )
        console.log(
          'Go to: Storage > Create a new bucket > Name: "photos" > Public: true',
        )
        return
      }

      console.log('✅ Photos bucket created successfully!')
    }

    // Test the bucket by uploading a small test file
    console.log('\n🧪 Testing bucket with file upload...')
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const testFileName = `test_${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.log('❌ Test upload failed:', uploadError.message)
    } else {
      console.log('✅ Test upload successful!')

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(testFileName)

      console.log('✅ Public URL works:', urlData.publicUrl)

      // Clean up
      await supabase.storage.from('photos').remove([testFileName])
      console.log('✅ Test file cleaned up')
    }

    console.log('\n🎉 Storage setup complete!')
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

setupStorageBucket()
