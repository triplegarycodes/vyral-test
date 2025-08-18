-- Fix security linter issues by adding missing RLS policies and enabling RLS

-- Enable RLS on shop_items table
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on vybestryke_challenges table  
ALTER TABLE public.vybestryke_challenges ENABLE ROW LEVEL SECURITY;

-- Add policies for shop_items - everyone can view, only admins can modify
CREATE POLICY "Shop items are viewable by everyone" 
ON public.shop_items FOR SELECT USING (true);

-- Add policies for vybestryke_challenges - everyone can view, only admins can modify
CREATE POLICY "VybeStryke challenges are viewable by everyone" 
ON public.vybestryke_challenges FOR SELECT USING (true);