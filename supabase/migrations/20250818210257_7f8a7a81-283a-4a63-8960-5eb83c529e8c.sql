-- Fix profiles table structure and add missing tables for full functionality
-- First, drop and recreate profiles table with correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  vybecoin_balance integer DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  xp integer DEFAULT 0 NOT NULL,
  streak_count integer DEFAULT 0 NOT NULL,
  last_activity_date date,
  study_preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shop items table
CREATE TABLE public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  rarity text DEFAULT 'common',
  metadata jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Financial goals table
CREATE TABLE public.financial_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  deadline date,
  category text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS and policies for financial goals
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own financial goals" 
ON public.financial_goals FOR ALL USING (auth.uid() = user_id);

-- VybeStryke challenges table
CREATE TABLE public.vybestryke_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'fitness', 'academic', 'wellness', 'creativity'
  difficulty text DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  xp_reward integer NOT NULL,
  vybecoin_reward integer DEFAULT 0,
  daily boolean DEFAULT false,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- User challenge progress table
CREATE TABLE public.user_challenge_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.vybestryke_challenges(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  progress_data jsonb DEFAULT '{}',
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS and policies
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own challenge progress" 
ON public.user_challenge_progress FOR ALL USING (auth.uid() = user_id);

-- Study sessions for VybeLink
CREATE TABLE public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text,
  session_date timestamp with time zone NOT NULL,
  duration_minutes integer,
  max_participants integer DEFAULT 4,
  current_participants integer DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Study session participants
CREATE TABLE public.study_session_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(session_id, user_id)
);

-- Enable RLS for study sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Study sessions are viewable by everyone" 
ON public.study_sessions FOR SELECT USING (true);

CREATE POLICY "Users can create their own study sessions" 
ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" 
ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Study session participants are viewable by everyone" 
ON public.study_session_participants FOR SELECT USING (true);

CREATE POLICY "Users can join study sessions" 
ON public.study_session_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample shop items
INSERT INTO public.shop_items (name, description, price, category, rarity) VALUES
('Neon Tree Glow', 'Make your LyfeTree glow with neon colors', 500, 'tree_style', 'rare'),
('Rainbow Leaves', 'Colorful rainbow leaf animation', 300, 'tree_style', 'common'),
('Golden Crown Badge', 'Show off your achievements', 750, 'badge', 'epic'),
('Study Streak Boost', 'Double XP for academic goals for 3 days', 1000, 'boost', 'rare'),
('Creative Spark Theme', 'Purple gradient dashboard theme', 400, 'theme', 'common'),
('Midnight Ocean Theme', 'Dark blue gradient theme', 400, 'theme', 'common'),
('Sunset Vibes Theme', 'Orange-pink gradient theme', 400, 'theme', 'common'),
('Forest Guardian Tree', 'Mystical tree with floating leaves', 1200, 'tree_style', 'legendary'),
('XP Multiplier (24h)', 'Double all XP gains for 24 hours', 800, 'boost', 'rare'),
('Diamond Badge Frame', 'Premium frame for your badges', 600, 'badge', 'epic');

-- Insert sample VybeStryke challenges
INSERT INTO public.vybestryke_challenges (title, description, category, difficulty, xp_reward, vybecoin_reward, daily) VALUES
('Morning Meditation', 'Start your day with 10 minutes of meditation', 'wellness', 'easy', 100, 25, true),
('Read for 30 Minutes', 'Read any book for at least 30 minutes', 'academic', 'easy', 150, 30, true),
('Drink 8 Glasses of Water', 'Stay hydrated throughout the day', 'wellness', 'easy', 75, 20, true),
('Complete a Creative Project', 'Work on any creative project for 1 hour', 'creativity', 'medium', 200, 50, false),
('Exercise for 45 Minutes', 'Any form of physical activity', 'fitness', 'medium', 250, 60, false),
('Learn 10 New Vocabulary Words', 'Study and memorize new words', 'academic', 'medium', 180, 40, false),
('Write in Journal', 'Reflect on your day in writing', 'wellness', 'easy', 120, 25, true),
('Practice Instrument', 'Play music for at least 30 minutes', 'creativity', 'medium', 200, 45, false),
('Organize Study Space', 'Clean and organize your study area', 'academic', 'easy', 100, 25, false),
('Social Media Detox', 'Avoid social media for 4 hours', 'wellness', 'hard', 300, 75, false);