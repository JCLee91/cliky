import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Common database queries to reduce code duplication
 */

export async function getUserProjects(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No projects found for this user');
  }

  return data.map(p => p.id);
}

export interface TaskQueryOptions {
  projectId?: string;
  orderBy?: 'priority' | 'created_at';
  limit?: number;
}

export async function getTasksForProjects(
  supabase: SupabaseClient,
  projectIds: string[],
  options: TaskQueryOptions = {}
) {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, idea)
    `)
    .in('project_id', projectIds);

  // Add project filter if provided
  if (options.projectId && projectIds.includes(options.projectId)) {
    query = query.eq('project_id', options.projectId);
  }

  // Apply ordering
  query = query
    .order(options.orderBy || 'priority', { ascending: false })
    .order('created_at', { ascending: true });

  // Apply limit if specified
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data || [];
}

export async function getTaskById(
  supabase: SupabaseClient,
  taskId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, idea, user_id)
    `)
    .eq('id', taskId)
    .single();

  if (error || !data) {
    throw new Error('Task not found');
  }

  // Verify user has access to this task
  if (data.project?.user_id !== userId) {
    throw new Error('Access denied: Task belongs to another user');
  }

  return data;
}