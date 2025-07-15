const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImageUrls() {
  try {
    console.log('Testing image URL structure...')

    // Get a session with photos to see the URL structure
    const { data: sessions, error: queryError } = await supabase
      .from('photo_sessions')
      .select(
        `
        id,
        session_name,
        photos (
          id,
          image_url,
          order_number
        )
      `,
      )
      .limit(1)

    if (queryError) {
      console.error('Error fetching sessions:', queryError)
      return
    }

    if (sessions.length === 0 || sessions[0].photos.length === 0) {
      console.log('No sessions with photos found.')
      return
    }

    const session = sessions[0]
    console.log(`\nSession: ${session.session_name || 'Untitled'}`)
    console.log('Image URLs:')

    session.photos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.image_url}`)

      // Test current extraction logic
      const urlParts = photo.image_url.split('/')
      const extractedFilename = urlParts[urlParts.length - 1]
      console.log(`   Extracted filename: ${extractedFilename}`)

      // Also test if it's a full Supabase URL
      if (photo.image_url.includes('supabase')) {
        const match = photo.image_url.match(/\/photos\/(.+)$/)
        if (match) {
          console.log(`   Alternative extraction: ${match[1]}`)
        }
      }
    })

    // Test what files actually exist in storage
    console.log('\nFiles in storage bucket:')
    const { data: files, error: storageError } = await supabase.storage
      .from('photos')
      .list()

    if (storageError) {
      console.error('Storage access error:', storageError)
    } else {
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} (${file.id})`)
      })
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testImageUrls()
  .then(() => {
    console.log('\n✅ Image URL test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
