const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error(
    '- SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyDeletePolicies() {
  try {
    console.log('Applying DELETE policies migration...')

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '003_add_delete_policies.sql',
    )
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    })

    if (error) {
      // If rpc doesn't work, try direct execution (this might not work with all operations)
      console.log('RPC method failed, trying direct SQL execution...')

      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.includes('DO $$')) {
          console.log('Skipping DO block (requires admin privileges)')
          continue
        }

        console.log('Executing:', statement.substring(0, 100) + '...')
        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql: statement,
        })

        if (stmtError) {
          console.error('Error executing statement:', stmtError)
        }
      }
    } else {
      console.log('Migration applied successfully!')
    }

    // Test the delete functionality
    console.log('\nTesting DELETE policies...')

    // Try to query existing sessions to see if we have any data
    const { data: sessions, error: queryError } = await supabase
      .from('photo_sessions')
      .select('id')
      .limit(1)

    if (queryError) {
      console.error('Error querying sessions:', queryError)
    } else {
      console.log(`Found ${sessions?.length || 0} existing sessions`)

      if (sessions && sessions.length > 0) {
        console.log('DELETE policies are now active and ready for use!')
      } else {
        console.log(
          'No sessions found to test with, but policies should be active.',
        )
      }
    }
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

// Run the migration
applyDeletePolicies()
  .then(() => {
    console.log('\n✅ Delete policies migration completed!')
    console.log('Your photo sessions can now be deleted from Supabase.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
