-- ====================================
-- VYRAL Complete Backend Schema
-- ====================================

-- User streaks tracking
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL, -- 'daily_goals', 'study', 'exercise', 'meditation', etc.
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enhanced user profiles with privacy settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS moderation_flags INTEGER DEFAULT 0;

-- Comprehensive points ledger for all transactions
CREATE TABLE public.points_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL, -- positive or negative
  transaction_type TEXT NOT NULL, -- 'goal_completion', 'challenge_complete', 'shop_purchase', 'streak_bonus', 'referral', etc.
  reference_id UUID, -- links to goal, challenge, purchase, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced goals system
ALTER TABLE public.ai_goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'personal' CHECK (goal_type IN ('personal', 'academic', 'health', 'social', 'creative', 'financial'));
ALTER TABLE public.ai_goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE public.ai_goals ADD COLUMN IF NOT EXISTS reminder_time TIME;
ALTER TABLE public.ai_goals ADD COLUMN IF NOT EXISTS streak_contribution BOOLEAN DEFAULT true;

-- User tasks (sub-goals)
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.ai_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  points_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentorship system
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_areas TEXT[] NOT NULL,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.mentor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  subject_area TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Money education quests
CREATE TABLE public.money_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'budgeting', 'saving', 'investing', 'entrepreneurship', etc.
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  points_reward INTEGER DEFAULT 50,
  estimated_time INTEGER, -- minutes
  content JSONB DEFAULT '{}', -- quest content, videos, links, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.money_quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.money_quests(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_data JSONB DEFAULT '{}', -- track specific progress within quest
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- Enhanced social posts system (B-Vyral)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[], -- array of image/video URLs from storage
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll', 'achievement')),
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderation and safety
CREATE TABLE public.moderation_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'profile', 'message')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate_content', 'violence', 'hate_speech', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User friendships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- VybeTree progress tracking
CREATE TABLE public.vybetree_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL, -- 'health', 'education', 'creativity', 'social', 'financial'
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, area_name)
);

-- Analytics events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- User streaks indexes
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX idx_user_streaks_type ON public.user_streaks(streak_type);
CREATE INDEX idx_user_streaks_last_activity ON public.user_streaks(last_activity_date);

-- Points ledger indexes
CREATE INDEX idx_points_ledger_user_id ON public.points_ledger(user_id);
CREATE INDEX idx_points_ledger_type ON public.points_ledger(transaction_type);
CREATE INDEX idx_points_ledger_created_at ON public.points_ledger(created_at);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_moderation_status ON public.posts(moderation_status);

-- Comments indexes
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON public.post_comments(parent_comment_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Rate limiting indexes
CREATE INDEX idx_rate_limits_user_action ON public.rate_limits(user_id, action_type);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- ====================================
-- ROW LEVEL SECURITY POLICIES
-- ====================================

-- User streaks policies
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
FOR ALL USING (auth.uid() = user_id);

-- Points ledger policies
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points history" ON public.points_ledger
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert points transactions" ON public.points_ledger
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User tasks policies
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" ON public.user_tasks
FOR ALL USING (auth.uid() = user_id);

-- Mentors policies
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage their own profile" ON public.mentors
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view verified mentors" ON public.mentors
FOR SELECT USING (verification_status = 'verified' AND is_active = true);

-- Mentor requests policies
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their mentee requests" ON public.mentor_requests
FOR ALL USING (auth.uid() = mentee_id);

CREATE POLICY "Mentors can view and update their requests" ON public.mentor_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mentors 
    WHERE mentors.id = mentor_requests.mentor_id 
    AND mentors.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can update their requests" ON public.mentor_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.mentors 
    WHERE mentors.id = mentor_requests.mentor_id 
    AND mentors.user_id = auth.uid()
  )
);

-- Money quests policies
ALTER TABLE public.money_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Money quests are viewable by everyone" ON public.money_quests
FOR SELECT USING (is_active = true);

-- Money quest progress policies
ALTER TABLE public.money_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quest progress" ON public.money_quest_progress
FOR ALL USING (auth.uid() = user_id);

-- Posts policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own posts" ON public.posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view posts based on visibility" ON public.posts
FOR SELECT USING (
  moderation_status = 'approved' AND (
    visibility = 'public' OR 
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE ((requester_id = auth.uid() AND addressee_id = posts.user_id) OR 
             (requester_id = posts.user_id AND addressee_id = auth.uid()))
      AND status = 'accepted'
    )) OR 
    user_id = auth.uid()
  )
);

-- Post likes policies
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own likes" ON public.post_likes
FOR ALL USING (auth.uid() = user_id);

-- Post comments policies  
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create comments on visible posts" ON public.post_comments
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id 
    AND (
      posts.visibility = 'public' OR 
      posts.user_id = auth.uid() OR
      (posts.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE ((requester_id = auth.uid() AND addressee_id = posts.user_id) OR 
               (requester_id = posts.user_id AND addressee_id = auth.uid()))
        AND status = 'accepted'
      ))
    )
  )
);

CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
FOR SELECT USING (
  moderation_status = 'approved' AND
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id 
    AND (
      posts.visibility = 'public' OR 
      posts.user_id = auth.uid() OR
      (posts.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE ((requester_id = auth.uid() AND addressee_id = posts.user_id) OR 
               (requester_id = posts.user_id AND addressee_id = auth.uid()))
        AND status = 'accepted'
      ))
    )
  )
);

CREATE POLICY "Users can update their own comments" ON public.post_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
FOR DELETE USING (auth.uid() = user_id);

-- Moderation flags policies
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create moderation flags" ON public.moderation_flags
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.moderation_flags
FOR SELECT USING (auth.uid() = reporter_id);

-- Friendships policies
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their friendships" ON public.friendships
FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- VybeTree areas policies
ALTER TABLE public.vybetree_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own VybeTree areas" ON public.vybetree_areas
FOR ALL USING (auth.uid() = user_id);

-- Analytics events policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events" ON public.analytics_events
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Rate limits policies
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (auth.uid() = user_id);

-- ====================================
-- TRIGGERS AND FUNCTIONS
-- ====================================

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.posts 
      SET likes_count = GREATEST(0, likes_count - 1) 
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.posts 
      SET comments_count = GREATEST(0, comments_count - 1) 
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for post counts
CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Function to calculate VybeTree growth score
CREATE OR REPLACE FUNCTION public.calculate_vybetree_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  area_score INTEGER;
BEGIN
  -- Calculate weighted score from all VybeTree areas
  SELECT COALESCE(SUM(
    CASE area_name
      WHEN 'health' THEN level * 25 + (xp / 100)
      WHEN 'education' THEN level * 30 + (xp / 100) 
      WHEN 'creativity' THEN level * 20 + (xp / 100)
      WHEN 'social' THEN level * 15 + (xp / 100)
      WHEN 'financial' THEN level * 10 + (xp / 100)
      ELSE level * 10 + (xp / 100)
    END
  ), 0) INTO score
  FROM public.vybetree_areas 
  WHERE user_id = user_uuid;
  
  -- Add streak bonuses
  SELECT COALESCE(SUM(current_streak * 5), 0) INTO area_score
  FROM public.user_streaks
  WHERE user_id = user_uuid;
  
  score := score + area_score;
  
  -- Add quest completion bonus
  SELECT COALESCE(COUNT(*) * 15, 0) INTO area_score
  FROM public.money_quest_progress
  WHERE user_id = user_uuid AND completed = true;
  
  score := score + area_score;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updated_at columns
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_requests_updated_at
  BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_money_quests_updated_at
  BEFORE UPDATE ON public.money_quests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_money_quest_progress_updated_at
  BEFORE UPDATE ON public.money_quest_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vybetree_areas_updated_at
  BEFORE UPDATE ON public.vybetree_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();