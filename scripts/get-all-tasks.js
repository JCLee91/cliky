const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const projectIds = [
  'afd8913c-abd4-4801-9aa4-fafd314889a5',
  'bc9e79c8-8b0e-41fd-930c-f66e014daf22',
  '440b5490-4721-4703-8af3-a8cd02662bfa',
  'b2c19b54-1b91-43a2-8284-941af71838fa'
]

async function getAllTasks() {
  console.log('export const mockTasks = {')
  
  for (const projectId of projectIds) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })
    
    if (!error && tasks && tasks.length > 0) {
      console.log(`  '${projectId}': [`)
      tasks.forEach((task, index) => {
        const comma = index < tasks.length - 1 ? ',' : ''
        console.log(`    ${JSON.stringify(task)}${comma}`)
      })
      console.log(`  ],`)
    } else {
      console.log(`  '${projectId}': [],`)
    }
  }
  
  console.log('}')
}

getAllTasks()