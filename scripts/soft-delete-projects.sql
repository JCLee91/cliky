-- Add soft delete support to projects table
-- This allows projects to be marked as deleted without actually removing the data

-- Add deleted_at column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better query performance when filtering non-deleted projects
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON public.projects(deleted_at);

-- Create a view for active (non-deleted) projects for convenience
CREATE OR REPLACE VIEW public.active_projects AS
SELECT * FROM public.projects
WHERE deleted_at IS NULL;

-- Add comment to explain soft delete pattern
COMMENT ON COLUMN public.projects.deleted_at IS 'Timestamp when project was soft deleted. NULL means project is active.';

-- Example query to soft delete a project:
-- UPDATE public.projects SET deleted_at = NOW() WHERE id = 'project-id';

-- Example query to restore a deleted project:
-- UPDATE public.projects SET deleted_at = NULL WHERE id = 'project-id';