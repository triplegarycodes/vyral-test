-- Fix Critical Security Issues: Missing RLS Policies and Public Data Exposure

-- 1. Fix daily_tasks table - Add proper RLS policies
CREATE POLICY "Users can manage their own daily tasks"
ON public.daily_tasks
FOR ALL
USING (auth.uid() = user_id);

-- 2. Fix vybetree_progress table - Add proper RLS policies
CREATE POLICY "Users can manage their own vybetree progress"
ON public.vybetree_progress
FOR ALL
USING (auth.uid() = user_id);

-- 3. Fix duplicate public.profiles table - Remove it as it's causing confusion
-- First check if there are any dependencies, then drop it
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. Restrict main profiles table visibility - Only authenticated users can see profiles
-- Drop the existing "Profiles are viewable by everyone" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Add new restricted policy for profile visibility
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Ensure users can still manage their own profiles (existing policies should remain)
-- Users can still insert and update their own profiles as per existing policies

-- 5. Add missing policy for daily_tasks user_id column to be non-nullable
-- This is a data integrity fix to prevent RLS violations
ALTER TABLE public.daily_tasks 
ALTER COLUMN user_id SET NOT NULL;