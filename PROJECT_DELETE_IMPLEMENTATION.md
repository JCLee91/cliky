# Project Delete Feature Implementation

## Overview
Implemented soft delete functionality for projects. When a project is deleted, it's not removed from the database but marked with a `deleted_at` timestamp.

## Implementation Details

### 1. Database Changes
- Added `deleted_at` column to projects table
- Created index for performance optimization
- Created SQL migration script: `scripts/soft-delete-projects.sql`

### 2. UI Components
- Added delete button (trash icon) next to "New Project" button
- Created `DeleteProjectDialog` component for confirmation
- Delete button shows in red to indicate destructive action

### 3. Logic Updates
- Updated `deleteProject` in `use-project.ts` to perform soft delete
- Modified all project queries to exclude deleted items (`deleted_at IS NULL`)
- Updated project store to filter out deleted projects
- Clear selected project when it's deleted

### 4. Data Safety
- Projects are never permanently deleted from database
- Can be restored by setting `deleted_at = NULL`
- All associated data (tasks, etc.) remains intact

## Database Migration

Run this SQL script in your Supabase SQL editor:

```sql
-- Add soft delete support to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON public.projects(deleted_at);

-- Create a view for active projects (optional)
CREATE OR REPLACE VIEW public.active_projects AS
SELECT * FROM public.projects
WHERE deleted_at IS NULL;
```

## Usage

1. Click the trash icon button next to "New Project"
2. Confirm deletion in the modal
3. Project disappears immediately from UI
4. Data remains in database with `deleted_at` timestamp

## Restoring Deleted Projects

To restore a deleted project, run:
```sql
UPDATE public.projects 
SET deleted_at = NULL 
WHERE id = 'your-project-id';
```