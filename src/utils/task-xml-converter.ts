import { Task } from '@/types/task'

export function generateTasksMarkdown(tasks: Task[]): string {
  const tasksByStatus = {
    todo: tasks.filter(task => !task.status || task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed')
  }

  let markdown = '# Task List\n\n'
  markdown += `Total tasks: ${tasks.length}\n`
  markdown += `Completed: ${tasksByStatus.completed.length}\n`
  markdown += `In Progress: ${tasksByStatus.in_progress.length}\n`
  markdown += `To Do: ${tasksByStatus.todo.length}\n\n`

  // Generate tasks by status
  const statuses = [
    { key: 'todo', title: '## 📋 To Do', tasks: tasksByStatus.todo },
    { key: 'in_progress', title: '## 🔄 In Progress', tasks: tasksByStatus.in_progress },
    { key: 'completed', title: '## ✅ Completed', tasks: tasksByStatus.completed }
  ]

  statuses.forEach(({ title, tasks: statusTasks }) => {
    if (statusTasks.length > 0) {
      markdown += `${title}\n\n`
      statusTasks.forEach((task, index) => {
        markdown += `### ${index + 1}. ${task.title}\n\n`
        markdown += `**Priority:** ${task.priority}\n`
        if (task.estimated_time) {
          markdown += `**Estimated Time:** ${task.estimated_time}\n`
        }
        markdown += `**Description:** ${task.description || 'No description'}\n`
        
        if (task.dependencies && task.dependencies.length > 0) {
          markdown += `**Dependencies:** ${task.dependencies.join(', ')}\n`
        }
        
        if (task.details) {
          markdown += `\n**Details:**\n${task.details}\n`
        }
        
        if (task.testStrategy) {
          markdown += `\n**Test Strategy:**\n${task.testStrategy}\n`
        }
        
        if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
          markdown += `\n**Acceptance Criteria:**\n`
          task.acceptanceCriteria.forEach((criteria, i) => {
            markdown += `- ${criteria}\n`
          })
        }
        
        if (task.subtasks && task.subtasks.length > 0) {
          markdown += `\n**Subtasks:**\n`
          task.subtasks.forEach((subtask, i) => {
            markdown += `${i + 1}. ${subtask.title} (${subtask.status})\n`
          })
        }
        
        markdown += `**Created:** ${new Date(task.created_at).toLocaleDateString('en-US')}\n\n`
        markdown += '---\n\n'
      })
    }
  })

  return markdown
}

export function generateTasksXML(tasks: Task[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tasks>\n'
  
  const tasksByStatus = {
    todo: tasks.filter(task => !task.status || task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed')
  }
  
  xml += `  <summary>\n`
  xml += `    <total>${tasks.length}</total>\n`
  xml += `    <completed>${tasksByStatus.completed.length}</completed>\n`
  xml += `    <in_progress>${tasksByStatus.in_progress.length}</in_progress>\n`
  xml += `    <todo>${tasksByStatus.todo.length}</todo>\n`
  xml += `  </summary>\n`
  
  tasks.forEach(task => {
    xml += `  <task id="${task.id}">\n`
    xml += `    <title><![CDATA[${task.title}]]></title>\n`
    xml += `    <description><![CDATA[${task.description || ''}]]></description>\n`
    xml += `    <priority>${task.priority}</priority>\n`
    xml += `    <status>${task.status || 'todo'}</status>\n`
    if (task.estimated_time) {
      xml += `    <estimated_time>${task.estimated_time}</estimated_time>\n`
    }
    if (task.details) {
      xml += `    <details><![CDATA[${task.details}]]></details>\n`
    }
    if (task.testStrategy) {
      xml += `    <test_strategy><![CDATA[${task.testStrategy}]]></test_strategy>\n`
    }
    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      xml += `    <acceptance_criteria>\n`
      task.acceptanceCriteria.forEach(criteria => {
        xml += `      <criterion><![CDATA[${criteria}]]></criterion>\n`
      })
      xml += `    </acceptance_criteria>\n`
    }
    if (task.dependencies && task.dependencies.length > 0) {
      xml += `    <dependencies>\n`
      task.dependencies.forEach(dep => {
        xml += `      <dependency>${dep}</dependency>\n`
      })
      xml += `    </dependencies>\n`
    }
    if (task.subtasks && task.subtasks.length > 0) {
      xml += `    <subtasks>\n`
      task.subtasks.forEach(subtask => {
        xml += `      <subtask id="${subtask.id}">\n`
        xml += `        <title><![CDATA[${subtask.title}]]></title>\n`
        xml += `        <description><![CDATA[${subtask.description}]]></description>\n`
        xml += `        <status>${subtask.status}</status>\n`
        xml += `      </subtask>\n`
      })
      xml += `    </subtasks>\n`
    }
    xml += `    <created_at>${task.created_at}</created_at>\n`
    xml += `  </task>\n`
  })
  
  xml += '</tasks>'
  return xml
}