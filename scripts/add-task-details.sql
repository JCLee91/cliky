-- Add missing columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS test_strategy TEXT;

-- Update RLS policies if needed
-- (existing policies should still work as they don't specify columns)