-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  idea TEXT NOT NULL,
  features JSONB DEFAULT '[]'::JSONB,
  user_flow TEXT,
  tech_preferences TEXT[] DEFAULT '{}',
  trd_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'trd_generated', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table  
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_time TEXT,
  dependencies UUID[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tasks table
CREATE POLICY "Users can view tasks for their projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their projects" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their projects" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their projects" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON public.tasks(order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects table
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();