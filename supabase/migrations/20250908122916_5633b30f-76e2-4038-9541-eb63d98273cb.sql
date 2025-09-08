-- Add Google OAuth support
-- No database changes needed, this is handled in the authentication settings

-- Add content moderation tables for safe text filtering
CREATE TABLE public.content_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_text TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  flagged_words TEXT[],
  severity_level TEXT DEFAULT 'none',
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can manage content moderation"
ON public.content_moderation
FOR ALL 
USING (true);

-- Add achievement system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'trophy',
  points_reward INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements
FOR SELECT 
USING (is_active = true);

-- User achievements junction table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_data JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
ON public.user_achievements
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add B-Vyral creative posts table
CREATE TABLE public.creative_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  media_urls TEXT[],
  post_type TEXT NOT NULL DEFAULT 'art', -- art, music, writing, etc
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own creative posts"
ON public.creative_posts
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creative posts"
ON public.creative_posts
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved creative posts"
ON public.creative_posts
FOR SELECT 
USING (moderation_status = 'approved' OR auth.uid() = user_id);

-- Creative post likes
CREATE TABLE public.creative_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.creative_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own creative post likes"
ON public.creative_post_likes
FOR ALL 
USING (auth.uid() = user_id);

-- Creative post comments
CREATE TABLE public.creative_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  moderation_status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create comments on approved posts"
ON public.creative_post_comments
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.creative_posts 
  WHERE id = creative_post_comments.post_id 
  AND moderation_status = 'approved'
));

CREATE POLICY "Users can view approved comments"
ON public.creative_post_comments
FOR SELECT 
USING (moderation_status = 'approved');

-- Add triggers for updating counts
CREATE OR REPLACE FUNCTION public.update_creative_post_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'creative_post_likes' THEN
      UPDATE public.creative_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'creative_post_comments' THEN
      UPDATE public.creative_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'creative_post_likes' THEN
      UPDATE public.creative_posts 
      SET likes_count = GREATEST(0, likes_count - 1) 
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'creative_post_comments' THEN
      UPDATE public.creative_posts 
      SET comments_count = GREATEST(0, comments_count - 1) 
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER update_creative_post_likes_count 
  AFTER INSERT OR DELETE ON public.creative_post_likes 
  FOR EACH ROW EXECUTE FUNCTION public.update_creative_post_counts();

CREATE TRIGGER update_creative_post_comments_count 
  AFTER INSERT OR DELETE ON public.creative_post_comments 
  FOR EACH ROW EXECUTE FUNCTION public.update_creative_post_counts();

-- User-created spaces for VybeZone
CREATE TABLE public.user_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'mentorship', -- mentorship, support, study
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  member_count INTEGER DEFAULT 1,
  moderation_level TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own spaces"
ON public.user_spaces
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own spaces"
ON public.user_spaces
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Public spaces are viewable by everyone"
ON public.user_spaces
FOR SELECT 
USING (is_public = true OR auth.uid() = creator_id);

-- Space members
CREATE TABLE public.space_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.user_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- member, moderator, creator
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(space_id, user_id)
);

ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join/leave spaces"
ON public.space_members
FOR ALL 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.user_spaces 
  WHERE id = space_members.space_id 
  AND creator_id = auth.uid()
));

-- Private venting entries
CREATE TABLE public.private_venting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mood_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.private_venting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own venting entries"
ON public.private_venting
FOR ALL 
USING (auth.uid() = user_id);

-- Enhanced AI goals table updates
ALTER TABLE public.ai_goals 
ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.ai_goals(id),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recurring_type TEXT, -- daily, weekly, monthly
ADD COLUMN IF NOT EXISTS recurring_days INTEGER[]; -- for weekly: [1,3,5] = Mon, Wed, Fri