-- Fix security warnings from previous migration

-- Fix function search path for update_community_member_count
DROP FUNCTION IF EXISTS update_community_member_count();

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;