-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Fix public.profiles table (seems to have incorrect structure based on schema)
-- The public.profiles table in the schema shows timestamp columns where they should be text/uuid
-- Let's add the missing policies for the main profiles table

-- Add comprehensive content moderation
CREATE TABLE IF NOT EXISTS public.content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'post', 'comment', 'creative_post', etc.
  content_id uuid NOT NULL,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_reason text NOT NULL,
  flag_description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for content_flags
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Policies for content_flags
CREATE POLICY "Users can flag content"
  ON public.content_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own flags"
  ON public.content_flags
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Add shop_purchases table to replace localStorage
CREATE TABLE IF NOT EXISTS public.shop_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_name text NOT NULL,
  price_paid integer NOT NULL,
  quantity integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for shop_purchases
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for shop_purchases
CREATE POLICY "Users can manage their own purchases"
  ON public.shop_purchases
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add rate limiting table for content creation
CREATE TABLE IF NOT EXISTS public.user_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type)
);

-- Enable RLS for user_rate_limits
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for user_rate_limits
CREATE POLICY "Users can view their own rate limits"
  ON public.user_rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.user_rate_limits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add content moderation function
CREATE OR REPLACE FUNCTION public.moderate_content(content_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flagged_words text[] := ARRAY[
    'spam', 'scam', 'hate', 'violence', 'harassment',
    'inappropriate', 'offensive', 'toxic', 'bullying'
  ];
  word text;
  severity text := 'clean';
  detected_issues text[] := ARRAY[]::text[];
BEGIN
  -- Convert to lowercase for checking
  content_text := lower(content_text);
  
  -- Check for flagged words
  FOREACH word IN ARRAY flagged_words
  LOOP
    IF content_text LIKE '%' || word || '%' THEN
      detected_issues := array_append(detected_issues, word);
      severity := 'flagged';
    END IF;
  END LOOP;
  
  -- Check for excessive caps (potential spam)
  IF length(regexp_replace(content_text, '[^A-Z]', '', 'g')) > length(content_text) * 0.5 THEN
    detected_issues := array_append(detected_issues, 'excessive_caps');
    severity := 'warning';
  END IF;
  
  -- Check for repeated characters (potential spam)
  IF content_text ~ '(.)\1{4,}' THEN
    detected_issues := array_append(detected_issues, 'repeated_chars');
    severity := 'warning';
  END IF;
  
  RETURN jsonb_build_object(
    'severity', severity,
    'issues', detected_issues,
    'approved', CASE WHEN severity = 'clean' THEN true ELSE false END
  );
END;
$$;

-- Add trigger to automatically moderate content on posts
CREATE OR REPLACE FUNCTION public.auto_moderate_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moderation_result jsonb;
BEGIN
  -- Moderate the content
  moderation_result := public.moderate_content(NEW.content);
  
  -- Set moderation status based on result
  IF (moderation_result->>'approved')::boolean = false THEN
    NEW.moderation_status := 'pending';
  ELSE
    NEW.moderation_status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add triggers for auto-moderation
DROP TRIGGER IF EXISTS auto_moderate_posts_trigger ON public.posts;
CREATE TRIGGER auto_moderate_posts_trigger
  BEFORE INSERT OR UPDATE OF content ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_moderate_post();

DROP TRIGGER IF EXISTS auto_moderate_creative_posts_trigger ON public.creative_posts;
CREATE TRIGGER auto_moderate_creative_posts_trigger
  BEFORE INSERT OR UPDATE OF content ON public.creative_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_moderate_post();

-- Update existing posts/comments to have proper moderation status
UPDATE public.posts SET moderation_status = 'approved' WHERE moderation_status IS NULL;
UPDATE public.creative_posts SET moderation_status = 'approved' WHERE moderation_status IS NULL;
UPDATE public.post_comments SET moderation_status = 'approved' WHERE moderation_status IS NULL;
UPDATE public.creative_post_comments SET moderation_status = 'approved' WHERE moderation_status IS NULL;