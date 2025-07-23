# Database Migration Guide

## Add Task Details Columns

To store all TaskMaster output in the database, run this migration in your Supabase SQL Editor:

```sql
-- Add missing columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS test_strategy TEXT;
```

This will add:
- `details`: Implementation details and guidance
- `test_strategy`: Testing approach and strategies

The columns are nullable and won't affect existing data.