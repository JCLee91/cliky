-- Add acceptance_criteria column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB DEFAULT '[]'::JSONB;

-- This column will store an array of acceptance criteria strings
-- Example: ["User can login", "Session persists", "Error messages shown"]