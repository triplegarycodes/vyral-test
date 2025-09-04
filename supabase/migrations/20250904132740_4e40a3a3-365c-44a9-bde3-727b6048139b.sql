-- ====================================
-- Fix Missing RLS Policies
-- ====================================

-- Check if daily_tasks table has RLS enabled but no policies
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily tasks" ON public.daily_tasks
FOR ALL USING (auth.uid() = user_id);

-- Check if vybetree_progress table has RLS enabled but no policies  
ALTER TABLE public.vybetree_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own VybeTree progress" ON public.vybetree_progress
FOR ALL USING (auth.uid() = user_id);

-- Check public.profiles table which might be the duplicate one
-- If there's a duplicate public.profiles table, we need to drop it or fix it
-- Let's first check what columns it has

-- Drop the problematic duplicate profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;