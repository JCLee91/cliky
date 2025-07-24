const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Need service role key to access auth.users')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAuthUsers() {
  try {
    // Check auth.users using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error listing users:', error)
      return
    }

    console.log(`\nTotal users: ${users.length}`)
    
    // Find art4onenall@gmail.com
    const targetUser = users.find(u => u.email === 'art4onenall@gmail.com')
    
    if (targetUser) {
      console.log('\n=== FOUND USER ===')
      console.log('ID:', targetUser.id)
      console.log('Email:', targetUser.email)
      console.log('Created:', targetUser.created_at)
      console.log('Metadata:', JSON.stringify(targetUser.user_metadata, null, 2))
      
      // Now get their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .single()
        
      if (profile) {
        console.log('\n=== PROFILE ===')
        console.log(JSON.stringify(profile, null, 2))
      } else {
        console.log('\nNo profile found for this user ID')
      }
      
      // Get projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', targetUser.id)
        .order('created_at', { ascending: false })
        
      console.log(`\n=== PROJECTS (${projects?.length || 0}) ===`)
      if (projects?.length > 0) {
        console.log(JSON.stringify(projects, null, 2))
      }
      
    } else {
      console.log('\nUser art4onenall@gmail.com not found')
      
      // List all emails for debugging
      console.log('\nAll user emails:')
      users.forEach(u => console.log(`- ${u.email}`))
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAuthUsers()