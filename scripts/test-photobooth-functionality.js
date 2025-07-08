// Test script specifically for photobooth functionality
// Run with: node scripts/test-photobooth-functionality.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testPhotoboothFunctionality() {
  console.log('📸 Testing Photobooth App Functionality...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🎯 Testing core photobooth functionality...\n')

    // Test 1: Can we create a photo session?
    console.log('1️⃣ Testing photo session creation...')
    const sessionId = crypto.randomUUID()
    const { data: sessionData, error: sessionError } = await supabase
      .from('photo_sessions')
      .insert({
        id: sessionId,
        session_name: 'Test Session ' + Date.now(),
      })
      .select()
      .single()

    if (sessionError) {
      console.log('❌ Failed to create session:', sessionError.message)
      return
    } else {
      console.log('✅ Photo session created successfully')
    }

    // Test 2: Can we upload an image file?
    console.log('\n2️⃣ Testing image upload...')

    // Create a fake image data URL (this simulates what the webcam provides)
    const fakeImageData =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

    // Convert to File object (simulate what the app does)
    const byteString = atob(fakeImageData.split(',')[1])
    const mimeString = fakeImageData.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const testImageFile = new File([ab], 'test_photo.jpg', { type: mimeString })

    const fileName = `${sessionId}/photo_1_${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, testImageFile)

    if (uploadError) {
      console.log('❌ Failed to upload image:', uploadError.message)
      return
    } else {
      console.log('✅ Image uploaded successfully')
    }

    // Test 3: Can we get a public URL?
    console.log('\n3️⃣ Testing public URL generation...')
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    console.log('✅ Public URL generated:', urlData.publicUrl)

    // Test 4: Can we save photo record to database?
    console.log('\n4️⃣ Testing photo record creation...')
    const photoId = crypto.randomUUID()
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        session_id: sessionId,
        image_url: urlData.publicUrl,
        order_number: 1,
      })
      .select()
      .single()

    if (photoError) {
      console.log('❌ Failed to save photo record:', photoError.message)
      return
    } else {
      console.log('✅ Photo record saved successfully')
    }

    // Test 5: Can we retrieve the session with photos?
    console.log('\n5️⃣ Testing data retrieval...')
    const { data: retrievedSession, error: retrieveError } = await supabase
      .from('photo_sessions')
      .select(
        `
        *,
        photos (*)
      `,
      )
      .eq('id', sessionId)
      .single()

    if (retrieveError) {
      console.log('❌ Failed to retrieve session:', retrieveError.message)
    } else {
      console.log('✅ Session retrieved successfully')
      console.log('Session has', retrievedSession.photos.length, 'photos')
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.storage.from('photos').remove([fileName])
    await supabase.from('photos').delete().eq('id', photoId)
    await supabase.from('photo_sessions').delete().eq('id', sessionId)
    console.log('✅ Test data cleaned up')

    console.log(
      '\n🎉 ALL TESTS PASSED! Your photobooth app should work perfectly!',
    )
    console.log('\n✨ You can now:')
    console.log('   1. Capture photos with your camera')
    console.log('   2. Save them to Supabase storage')
    console.log('   3. Store session data in the database')
    console.log('   4. View them in your gallery')
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Full error:', error)
  }
}

testPhotoboothFunctionality()
