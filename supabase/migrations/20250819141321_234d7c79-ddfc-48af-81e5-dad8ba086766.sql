-- Fix critical security issues

-- 1. Drop the incorrect public.profiles table and use only the main profiles table
DROP TABLE IF EXISTS public.profiles;

-- 2. Enable RLS on tables missing it
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vybetree_progress ENABLE ROW LEVEL SECURITY;

-- 3. Fix profiles RLS - lock down to user's own profile only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create public view for safe profile data display
CREATE OR REPLACE VIEW public_profiles_view AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url
FROM profiles;

-- Grant public access to the view only
GRANT SELECT ON public_profiles_view TO anon, authenticated;

-- 4. Add missing RLS policies for daily_tasks
CREATE POLICY "Users can manage their own daily tasks" 
ON daily_tasks 
FOR ALL 
USING (auth.uid() = user_id);

-- 5. Add missing RLS policies for vybetree_progress  
CREATE POLICY "Users can manage their own vybetree progress" 
ON vybetree_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- 6. Fix study_session_participants privacy
DROP POLICY IF EXISTS "Study session participants are viewable by everyone" ON study_session_participants;
CREATE POLICY "Users can view participants of sessions they created or joined" 
ON study_session_participants 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM study_sessions WHERE id = session_id
  ) OR 
  auth.uid() = user_id
);

-- Create public view for participant count only
CREATE OR REPLACE VIEW study_session_participants_public AS
SELECT 
  session_id,
  COUNT(*) as participant_count
FROM study_session_participants
GROUP BY session_id;

GRANT SELECT ON study_session_participants_public TO anon, authenticated;

-- 7. Add trigger for coin balance integrity
CREATE OR REPLACE TRIGGER coin_transactions_update_balance
AFTER INSERT ON coin_transactions
FOR EACH ROW
EXECUTE FUNCTION update_vybecoin_balance();

-- 8. Add basic rate limiting trigger for venting posts
CREATE OR REPLACE FUNCTION check_venting_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow max 10 posts per minute per user
  IF (
    SELECT COUNT(*) 
    FROM venting_posts 
    WHERE user_id = NEW.user_id 
    AND created_at > NOW() - INTERVAL '1 minute'
  ) >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 posts per minute';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER venting_posts_rate_limit
BEFORE INSERT ON venting_posts
FOR EACH ROW
EXECUTE FUNCTION check_venting_rate_limit();