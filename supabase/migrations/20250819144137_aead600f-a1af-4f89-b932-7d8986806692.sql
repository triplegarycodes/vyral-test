-- Add tables for improved VybeZone and LyfeBoard functionality

-- Create communities table for VybeZone
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Users',
  color text NOT NULL DEFAULT 'text-primary', 
  category text NOT NULL DEFAULT 'general',
  member_count integer NOT NULL DEFAULT 0,
  is_moderated boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Communities are viewable by everyone
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities 
FOR SELECT 
USING (true);

-- Create community_members table for tracking memberships
CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_moderator boolean NOT NULL DEFAULT false,
  UNIQUE(community_id, user_id)
);

-- Enable RLS on community_members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Users can view community memberships
CREATE POLICY "Users can view community memberships" 
ON public.community_members 
FOR SELECT 
USING (true);

-- Users can join communities
CREATE POLICY "Users can join communities" 
ON public.community_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can leave communities they joined
CREATE POLICY "Users can leave communities" 
ON public.community_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create AI-generated goals table for LyfeBoard
CREATE TABLE public.ai_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'easy',
  xp_reward integer NOT NULL DEFAULT 25,
  estimated_duration text NOT NULL DEFAULT '30 minutes',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_goals
ALTER TABLE public.ai_goals ENABLE ROW LEVEL SECURITY;

-- Users can manage their own AI goals
CREATE POLICY "Users can manage their own AI goals" 
ON public.ai_goals 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for ai_goals updated_at
CREATE TRIGGER update_ai_goals_updated_at
BEFORE UPDATE ON public.ai_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample communities
INSERT INTO public.communities (name, description, icon, color, category, member_count) VALUES
('Study Squad', 'Connect with fellow students and share study tips', 'BookOpen', 'text-primary', 'education', 1247),
('Creative Corner', 'Share your art, music, and creative projects', 'Palette', 'text-gaming-purple', 'creative', 892),
('Gaming Guild', 'Discuss games, find teammates, and share achievements', 'Gamepad2', 'text-gaming-green', 'gaming', 2156),
('Music Makers', 'For musicians, producers, and music lovers', 'Music', 'text-gaming-orange', 'music', 634),
('Fitness Friends', 'Workout buddies and health motivation', 'Dumbbell', 'text-gaming-cyan', 'fitness', 543),
('Tech Innovators', 'Coding, programming, and tech discussions', 'Code', 'text-accent', 'technology', 789),
('Book Club', 'Reading recommendations and literary discussions', 'Book', 'text-muted-foreground', 'literature', 421),
('Mental Health Warriors', 'Support, resources, and positive vibes', 'Heart', 'text-destructive', 'wellness', 1032);

-- Create function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = GREATEST(0, member_count - 1) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to update member count
CREATE TRIGGER community_members_insert_trigger
AFTER INSERT ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER community_members_delete_trigger
AFTER DELETE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();