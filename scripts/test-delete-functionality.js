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

async function testDeleteFunctionality() {
  try {
    console.log('Testing delete functionality...')

    // First, let's see what sessions exist
    const { data: sessions, error: queryError } = await supabase
      .from('photo_sessions')
      .select(
        `
        id,
        session_name,
        created_at,
        photos (
          id,
          image_url,
          order_number
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Error fetching sessions:', queryError)
      return
    }

    console.log(`Found ${sessions.length} sessions:`)
    sessions.forEach((session, index) => {
      console.log(
        `${index + 1}. ${session.session_name || 'Untitled'} (${
          session.id
        }) - ${session.photos.length} photos`,
      )
    })

    if (sessions.length === 0) {
      console.log('No sessions to test delete with.')
      return
    }

    // Test if we can actually delete by attempting to delete a non-existent session
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const { error: deleteError } = await supabase
      .from('photo_sessions')
      .delete()
      .eq('id', fakeId)

    if (deleteError) {
      console.error('Delete test failed with error:', deleteError)
      console.log('This suggests there might be a permission or policy issue.')
    } else {
      console.log(
        'Delete operation succeeded (no rows affected, which is expected)',
      )
      console.log('This suggests delete permissions are working correctly.')
    }

    // Test storage deletion
    console.log('\nTesting storage access...')
    const { data: files, error: storageError } = await supabase.storage
      .from('photos')
      .list()

    if (storageError) {
      console.error('Storage access error:', storageError)
    } else {
      console.log(`Found ${files.length} files in storage`)
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDeleteFunctionality()
  .then(() => {
    console.log('\n✅ Delete functionality test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
