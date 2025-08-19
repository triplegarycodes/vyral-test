-- Fix security warnings by properly updating the function
-- First drop triggers, then function, then recreate with proper search_path

DROP TRIGGER IF EXISTS community_members_insert_trigger ON public.community_members;
DROP TRIGGER IF EXISTS community_members_delete_trigger ON public.community_members;
DROP FUNCTION IF EXISTS update_community_member_count() CASCADE;

-- Create function with proper search path
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

-- Recreate the triggers
CREATE TRIGGER community_members_insert_trigger
AFTER INSERT ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER community_members_delete_trigger
AFTER DELETE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();