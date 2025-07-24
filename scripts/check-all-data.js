const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing')
  console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAllData() {
  try {
    console.log('=== Checking Supabase Data ===\n')
    
    // 1. Check profiles table
    console.log('1. Profiles table:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (profilesError) {
      console.error('Profiles error:', profilesError)
    } else {
      console.log(`Found ${profiles?.length || 0} profiles`)
      if (profiles?.length > 0) {
        profiles.forEach(p => {
          console.log(`  - ${p.email} (${p.full_name || 'No name'})`)
        })
      }
    }
    
    // 2. Check projects table
    console.log('\n2. Projects table:')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(10)
    
    if (projectsError) {
      console.error('Projects error:', projectsError)
    } else {
      console.log(`Found ${projects?.length || 0} projects`)
      if (projects?.length > 0) {
        projects.forEach(p => {
          console.log(`  - "${p.name}" by user ${p.user_id.substring(0, 8)}...`)
        })
      }
    }
    
    // 3. Check tasks table
    console.log('\n3. Tasks table:')
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(10)
    
    if (tasksError) {
      console.error('Tasks error:', tasksError)
    } else {
      console.log(`Found ${tasks?.length || 0} tasks`)
      if (tasks?.length > 0) {
        tasks.forEach(t => {
          console.log(`  - "${t.title}" (${t.status}) for project ${t.project_id.substring(0, 8)}...`)
        })
      }
    }
    
    // 4. Find art4onenall@gmail.com specifically
    console.log('\n4. Looking for art4onenall@gmail.com:')
    const { data: specificProfile, error: specificError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'art4onenall@gmail.com')
      .single()
    
    if (specificError && specificError.code !== 'PGRST116') {
      console.error('Error finding user:', specificError)
    } else if (specificProfile) {
      console.log('Found user!')
      console.log(JSON.stringify(specificProfile, null, 2))
      
      // Get their projects
      const { data: userProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', specificProfile.id)
      
      console.log(`\nUser has ${userProjects?.length || 0} projects`)
      if (userProjects?.length > 0) {
        console.log(JSON.stringify(userProjects, null, 2))
      }
    } else {
      console.log('User not found in profiles table')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkAllData()