'use client'

import { Task } from '@/types/task'
import { DownloadMenu } from '@/components/ui/download-menu'
import { generateTasksMarkdown, generateTasksXML } from '@/utils/task-xml-converter'

interface TaskDownloadButtonProps {
  tasks: Task[]
  projectName?: string
}

export function TaskDownloadButton({ tasks, projectName }: TaskDownloadButtonProps) {
  if (tasks.length === 0) {
    return null
  }

  // Create a custom content generator that returns the appropriate format
  const contentGenerator = () => {
    // This will be overridden by the DownloadMenu component
    // based on the selected format
    return generateTasksMarkdown(tasks)
  }

  // We need to create a wrapper that can handle both formats
  const downloadContent = {
    markdown: () => generateTasksMarkdown(tasks),
    xml: () => generateTasksXML(tasks)
  }

  // Pass markdown content and custom XML converter
  return (
    <DownloadMenu 
      content={generateTasksMarkdown(tasks)} 
      filename={projectName ? `${projectName}_Tasks` : "tasks"}
      customXMLConverter={() => generateTasksXML(tasks)}
    />
  )
}