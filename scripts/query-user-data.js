const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function queryUserData() {
  try {
    // 1. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'art4onenall@gmail.com')
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    } else {
      console.log('\n=== USER PROFILE ===')
      console.log(JSON.stringify(profile, null, 2))
    }

    if (!profile) {
      console.log('No profile found for art4onenall@gmail.com')
      return
    }

    // 2. Get user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Projects error:', projectsError)
    } else {
      console.log('\n=== PROJECTS ===')
      console.log(JSON.stringify(projects, null, 2))

      // 3. Get tasks for each project
      for (const project of projects || []) {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .order('position', { ascending: true })

        if (tasksError) {
          console.error(`Tasks error for project ${project.id}:`, tasksError)
        } else {
          console.log(`\n=== TASKS FOR PROJECT: ${project.name} ===`)
          console.log(JSON.stringify(tasks, null, 2))
        }
      }
    }

    // 4. Create mock data format
    console.log('\n=== MOCK DATA FORMAT ===')
    const mockData = {
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      } : null,
      projects: projects || [],
      tasks: {}
    }

    // Organize tasks by project
    for (const project of projects || []) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true })
      
      mockData.tasks[project.id] = tasks || []
    }

    console.log(JSON.stringify(mockData, null, 2))

  } catch (error) {
    console.error('Query error:', error)
  }
}

queryUserData()