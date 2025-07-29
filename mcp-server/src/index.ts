#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import type { Task, Project, MCPTaskWithStatus } from './types.js';
import { TaskStatusStore } from './utils/storage.js';
import { getUserProjects, getTasksForProjects, getTaskById } from './utils/queries.js';
import { handleError, ProjectNotFoundError, AccessDeniedError } from './utils/errors.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'CLIKY_USER_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is required in environment variables`);
    process.exit(1);
  }
}

// Initialize Supabase client with anon key (safe for client-side use)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!  // Using anon key with RLS
);

// Initialize MCP server
const server = new McpServer({
  name: "cliky-task-manager",
  version: "0.2.0",
  description: "Manage Cliky tasks directly from Cursor"
});

// Initialize persistent task status storage
const userId = process.env.CLIKY_USER_ID!;
const taskStatusStore = new TaskStatusStore(userId);

// Clean up old completed tasks on startup
taskStatusStore.cleanup();

// Input validation schemas
const TaskIdSchema = z.string().uuid('Invalid task ID format');
const ProjectIdSchema = z.string().uuid('Invalid project ID format');

// Register tool: Get next task
server.registerTool(
  "get_next_task",
  {
    description: "Get the next pending task and automatically set it to in_progress",
    inputSchema: {
      projectId: ProjectIdSchema.optional().describe("Filter by specific project ID (optional)")
    }
  },
  async ({ projectId }) => {
    try {
      // Get user's project IDs
      const projectIds = await getUserProjects(supabase, userId);

      // Get tasks with optional project filter
      const tasks = await getTasksForProjects(supabase, projectIds, {
        projectId,
        limit: 100 // Reasonable limit to avoid loading too many tasks
      });

      if (tasks.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No tasks available."
          }]
        };
      }

      // Find first task that's not completed or in progress
      const nextTask = tasks.find(task => {
        const status = taskStatusStore.get(task.id);
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

      // Update status to in_progress
      taskStatusStore.set(nextTask.id, 'in_progress');

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
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${handleError(error)}`
        }]
      };
    }
  }
);

// Register tool: Update task status
server.registerTool(
  "update_task_status",
  {
    description: "Update the status of a task",
    inputSchema: {
      taskId: TaskIdSchema.describe("The ID of the task to update"),
      status: z.enum(["pending", "in_progress", "completed", "blocked"])
        .describe("The new status for the task"),
      notes: z.string().optional().describe("Optional notes about the status change")
    }
  },
  async ({ taskId, status, notes }) => {
    try {
      // Verify task exists and user has access
      const task = await getTaskById(supabase, taskId, userId);

      // Update status
      taskStatusStore.set(taskId, status);

      return {
        content: [{
          type: "text",
          text: `Task #${taskId} status updated to ${status}${notes ? `\nNotes: ${notes}` : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${handleError(error)}`
        }]
      };
    }
  }
);

// Register tool: Get task details
server.registerTool(
  "get_task_details",
  {
    description: "Get detailed information about a specific task",
    inputSchema: {
      taskId: TaskIdSchema.describe("The ID of the task to retrieve")
    }
  },
  async ({ taskId }) => {
    try {
      const data = await getTaskById(supabase, taskId, userId);
      const status = taskStatusStore.get(taskId) || 'pending';

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
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${handleError(error)}`
        }]
      };
    }
  }
);

// Register tool: Complete task and get next
server.registerTool(
  "complete_task_and_get_next",
  {
    description: "Mark current task as completed and get the next pending task",
    inputSchema: {
      taskId: TaskIdSchema.describe("The ID of the task to complete"),
      completionNotes: z.string().optional().describe("Notes about what was completed")
    }
  },
  async ({ taskId, completionNotes }) => {
    try {
      // Verify task exists and user has access
      await getTaskById(supabase, taskId, userId);

      // Mark current task as completed
      taskStatusStore.set(taskId, 'completed');

      // Get next task
      const projectIds = await getUserProjects(supabase, userId);
      const tasks = await getTasksForProjects(supabase, projectIds, {
        limit: 100
      });

      const nextTask = tasks.find(task => {
        const status = taskStatusStore.get(task.id);
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
      taskStatusStore.set(nextTask.id, 'in_progress');

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            completedTask: taskId,
            completionNotes: completionNotes,
            nextTask: {
              ...nextTask,
              status: 'in_progress'
            },
            message: `Task #${taskId} completed! Starting task #${nextTask.id}: ${nextTask.title}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${handleError(error)}`
        }]
      };
    }
  }
);

// Register tool: List my tasks
server.registerTool(
  "list_my_tasks",
  {
    description: "List all tasks from your projects",
    inputSchema: {
      status: z.enum(["all", "pending", "in_progress", "completed", "blocked"])
        .optional()
        .default("all")
        .describe("Filter by status (default: all)"),
      projectId: ProjectIdSchema.optional().describe("Filter by project ID (optional)"),
      limit: z.number().optional().default(10).describe("Maximum number of tasks to return (default: 10)")
    }
  },
  async ({ status = "all", projectId, limit = 10 }) => {
    try {
      // Get user's projects
      const projectIds = await getUserProjects(supabase, userId);
      
      // Get tasks
      const tasks = await getTasksForProjects(supabase, projectIds, {
        projectId,
        limit: 100 // Get more tasks for filtering
      });

      // Filter by status if needed
      let filteredTasks = tasks;
      if (status !== 'all') {
        filteredTasks = tasks.filter(task => {
          const taskStatus = taskStatusStore.get(task.id) || 'pending';
          return taskStatus === status;
        });
      }

      // Add status to results and limit
      const tasksWithStatus = filteredTasks.slice(0, limit).map(task => ({
        ...task,
        status: taskStatusStore.get(task.id) || 'pending'
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
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${handleError(error)}`
        }]
      };
    }
  }
);

// Register resource: Current in-progress tasks
server.registerResource(
  "current_tasks",
  "task://current",
  {
    name: "Current In-Progress Tasks",
    description: "All tasks currently being worked on",
    mimeType: "application/json"
  },
  async (uri) => {
    try {
      // Get user's projects
      const projectIds = await getUserProjects(supabase, userId);

      // Get all tasks
      const tasks = await getTasksForProjects(supabase, projectIds);

      // Filter for in-progress tasks
      const inProgressTasks = tasks.filter(task => 
        taskStatusStore.get(task.id) === 'in_progress'
      );

      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(inProgressTasks, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ 
            error: handleError(error)
          })
        }]
      };
    }
  }
);

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cliky MCP Task Manager v0.2.0 started successfully");
  console.error(`User ID: ${userId}`);
  console.error(`Status data stored in: ${join(__dirname, '../.data')}`);
}

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});