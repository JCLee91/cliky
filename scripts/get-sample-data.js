const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getSampleData() {
  try {
    // Get any projects (limit 2 for sample)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2)

    if (projectsError) {
      console.error('Projects error:', projectsError)
      return
    }

    console.log('\n=== SAMPLE PROJECTS ===')
    console.log(JSON.stringify(projects, null, 2))

    // Get tasks for these projects
    const mockData = {
      projects: projects || [],
      tasks: {}
    }

    for (const project of projects || []) {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true })

      if (!tasksError && tasks) {
        console.log(`\n=== TASKS FOR PROJECT: ${project.name} ===`)
        console.log(JSON.stringify(tasks, null, 2))
        mockData.tasks[project.id] = tasks
      }
    }

    // Format as mock data
    console.log('\n=== FORMATTED MOCK DATA ===')
    console.log('export const mockProjects = ' + JSON.stringify(mockData.projects, null, 2))
    console.log('\nexport const mockTasksByProject = ' + JSON.stringify(mockData.tasks, null, 2))

  } catch (error) {
    console.error('Query error:', error)
  }
}

getSampleData()