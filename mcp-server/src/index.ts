#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Task, Project, MCPTaskWithStatus, TaskFilter } from './types.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'CLIKY_USER_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is required in environment variables`);
    process.exit(1);
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Initialize MCP server
const server = new Server({
  name: "cliky-task-manager",
  version: "0.1.0",
  description: "Manage Cliky tasks directly from Cursor"
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Helper function to get tasks with virtual status
// Since the DB doesn't have status, we'll track it separately
const taskStatusMap = new Map<string, 'pending' | 'in_progress' | 'completed' | 'blocked'>();

// Tool definitions
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "get_next_task",
      description: "Get the next pending task and automatically set it to in_progress",
      inputSchema: {
        type: "object",
        properties: {
          projectId: { 
            type: "string", 
            description: "Filter by specific project ID (optional)" 
          }
        }
      }
    },
    {
      name: "update_task_status",
      description: "Update the virtual status of a task (status is not stored in DB)",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { 
            type: "string",
            description: "The ID of the task to update"
          },
          status: { 
            type: "string", 
            enum: ["pending", "in_progress", "completed", "blocked"],
            description: "The new status for the task"
          },
          notes: {
            type: "string",
            description: "Optional notes about the status change"
          }
        },
        required: ["taskId", "status"]
      }
    },
    {
      name: "get_task_details",
      description: "Get detailed information about a specific task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { 
            type: "string",
            description: "The ID of the task to retrieve"
          }
        },
        required: ["taskId"]
      }
    },
    {
      name: "complete_task_and_get_next",
      description: "Mark current task as completed and get the next pending task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { 
            type: "string",
            description: "The ID of the task to complete"
          },
          completionNotes: { 
            type: "string",
            description: "Notes about what was completed"
          }
        },
        required: ["taskId"]
      }
    },
    {
      name: "list_my_tasks",
      description: "List all tasks from your projects",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["all", "pending", "in_progress", "completed", "blocked"],
            description: "Filter by virtual status (default: all)"
          },
          projectId: {
            type: "string",
            description: "Filter by project ID (optional)"
          },
          limit: {
            type: "number",
            description: "Maximum number of tasks to return (default: 10)"
          }
        }
      }
    }
  ]
}));

// Tool implementations
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  const userId = process.env.CLIKY_USER_ID;

  try {
    switch (name) {
      case "get_next_task": {
        // First, get user's projects
        const { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId);

        if (projectError || !projects || projects.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No projects found for this user."
            }]
          };
        }

        const projectIds = projects.map(p => p.id);

        // Build query for tasks
        let query = supabase
          .from('tasks')
          .select(`
            *,
            project:projects(id, name, idea)
          `)
          .in('project_id', projectIds);

        // Add project filter if provided
        if (args.projectId && projectIds.includes(args.projectId)) {
          query = query.eq('project_id', args.projectId);
        }

        // Get all tasks and filter by virtual status
        const { data: tasks, error } = await query
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (error || !tasks || tasks.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No tasks available."
            }]
          };
        }

        // Find first task that's not completed or in progress
        const nextTask = tasks.find(task => {
          const status = taskStatusMap.get(task.id);
          return !status || status === 'pending';
        });

        if (!nextTask) {
          return {
            content: [{
              type: "text",
              text: "No pending tasks available. All tasks are either in progress or completed."
            }]
          };
        }

        // Update virtual status to in_progress
        taskStatusMap.set(nextTask.id, 'in_progress');

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              task: {
                ...nextTask,
                status: 'in_progress'
              },
              message: `Started task #${nextTask.id}: ${nextTask.title}`,
              project: nextTask.project?.name || 'No project',
              acceptance_criteria: nextTask.acceptance_criteria || []
            }, null, 2)
          }]
        };
      }

      case "update_task_status": {
        const { taskId, status, notes } = args;
        
        // Verify task belongs to user
        const { data: task, error } = await supabase
          .from('tasks')
          .select(`
            *,
            project:projects(id, user_id)
          `)
          .eq('id', taskId)
          .single();

        if (error || !task || task.project?.user_id !== userId) {
          return {
            content: [{
              type: "text",
              text: "Task not found or you don't have access to it."
            }]
          };
        }

        // Update virtual status
        taskStatusMap.set(taskId, status);

        return {
          content: [{
            type: "text",
            text: `Task #${taskId} status updated to ${status}${notes ? `\nNotes: ${notes}` : ''}`
          }]
        };
      }

      case "get_task_details": {
        const { taskId } = args;
        
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            project:projects(id, name, idea, user_id)
          `)
          .eq('id', taskId)
          .single();

        if (error || !data || data.project?.user_id !== userId) {
          return {
            content: [{
              type: "text",
              text: "Task not found or you don't have access to it."
            }]
          };
        }

        const status = taskStatusMap.get(taskId) || 'pending';

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              ...data,
              status,
              project: {
                id: data.project.id,
                name: data.project.name,
                idea: data.project.idea
              }
            }, null, 2)
          }]
        };
      }

      case "complete_task_and_get_next": {
        const { taskId, completionNotes } = args;
        
        // Mark current task as completed
        taskStatusMap.set(taskId, 'completed');

        // Get next task (reuse get_next_task logic)
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId);

        if (!projects || projects.length === 0) {
          return {
            content: [{
              type: "text",
              text: `Task #${taskId} completed! No more tasks available.`
            }]
          };
        }

        const projectIds = projects.map(p => p.id);
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            *,
            project:projects(id, name, idea)
          `)
          .in('project_id', projectIds)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        const nextTask = tasks?.find(task => {
          const status = taskStatusMap.get(task.id);
          return !status || status === 'pending';
        });

        if (!nextTask) {
          return {
            content: [{
              type: "text",
              text: `Task #${taskId} completed! All tasks are done.`
            }]
          };
        }

        // Start next task
        taskStatusMap.set(nextTask.id, 'in_progress');

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              completedTask: taskId,
              completionNotes,
              nextTask: {
                ...nextTask,
                status: 'in_progress'
              },
              message: `Task #${taskId} completed! Starting task #${nextTask.id}: ${nextTask.title}`
            }, null, 2)
          }]
        };
      }

      case "list_my_tasks": {
        const { status = 'all', projectId, limit = 10 } = args;
        
        // Get user's projects
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId);

        if (!projects || projects.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No projects found."
            }]
          };
        }

        const projectIds = projects.map(p => p.id);
        
        let query = supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            priority,
            created_at,
            project:projects(id, name)
          `)
          .in('project_id', projectIds);

        if (projectId && projectIds.includes(projectId)) {
          query = query.eq('project_id', projectId);
        }

        const { data: tasks, error } = await query
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (error || !tasks) {
          return {
            content: [{
              type: "text",
              text: `Error fetching tasks: ${error?.message || 'Unknown error'}`
            }]
          };
        }

        // Filter by virtual status if needed
        let filteredTasks = tasks;
        if (status !== 'all') {
          filteredTasks = tasks.filter(task => {
            const taskStatus = taskStatusMap.get(task.id) || 'pending';
            return taskStatus === status;
          });
        }

        // Add virtual status to results
        const tasksWithStatus = filteredTasks.slice(0, limit).map(task => ({
          ...task,
          status: taskStatusMap.get(task.id) || 'pending'
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              tasks: tasksWithStatus,
              count: tasksWithStatus.length,
              totalAvailable: filteredTasks.length,
              filter: { status, projectId, limit }
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
});

// Resource handlers for current task info
server.setRequestHandler("resources/list", async () => ({
  resources: [{
    uri: "task://current",
    name: "Current In-Progress Tasks",
    description: "All tasks currently being worked on",
    mimeType: "application/json"
  }]
}));

server.setRequestHandler("resources/read", async (request) => {
  const userId = process.env.CLIKY_USER_ID;
  
  if (request.params.uri === "task://current") {
    // Get user's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    if (!projects || projects.length === 0) {
      return {
        contents: [{
          uri: "task://current",
          mimeType: "application/json",
          text: JSON.stringify({ message: "No projects found" })
        }]
      };
    }

    // Get all tasks and find in-progress ones
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name, idea)
      `)
      .in('project_id', projects.map(p => p.id));

    const inProgressTasks = tasks?.filter(task => 
      taskStatusMap.get(task.id) === 'in_progress'
    ) || [];

    return {
      contents: [{
        uri: "task://current",
        mimeType: "application/json",
        text: JSON.stringify(inProgressTasks, null, 2)
      }]
    };
  }
  
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Cliky MCP Task Manager started successfully");