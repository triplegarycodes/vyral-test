-- Create sponsorship system tables

-- Sponsor tiers: defines the three plans with benefits and pricing
CREATE TABLE public.sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL, -- Monthly price in cents
  display_price TEXT NOT NULL, -- Display price like "$100/mo"
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_sponsors INTEGER DEFAULT NULL, -- NULL = unlimited
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default sponsor tiers
INSERT INTO public.sponsor_tiers (name, price_cents, display_price, benefits) VALUES 
('Trending', 10000, '$100/mo', '["Logo placement in sidebar", "Brand mention in daily content", "Access to teen engagement metrics"]'),
('Boosted', 25000, '$250/mo', '["Featured placement in study sections", "Custom promotional cards", "Weekly sponsored content", "Priority support"]'),
('Vyral', 50000, '$500/mo', '["Exclusive section branding", "Custom integrations", "Monthly analytics report", "Direct teen feedback sessions", "Premium placement across all features"]');

-- Sponsors: each sponsoring business
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  website_url TEXT,
  industry TEXT,
  target_demographics JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'canceled')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sponsor subscriptions: connects sponsor to tier and manages billing
CREATE TABLE public.sponsor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.sponsor_tiers(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'past_due', 'canceled', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sponsor assets: logo, tagline, website link, and special deals
CREATE TABLE public.sponsor_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'banner', 'video', 'deal_card', 'content')),
  title TEXT,
  description TEXT,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Stores asset URLs, text, etc.
  display_settings JSONB DEFAULT '{}'::jsonb, -- Colors, placement preferences, etc.
  admin_approved BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_tiers (public read)
CREATE POLICY "Sponsor tiers are viewable by everyone" 
ON public.sponsor_tiers 
FOR SELECT 
USING (active = true);

-- RLS Policies for sponsors (owner access only)
CREATE POLICY "Users can view their own sponsor records" 
ON public.sponsors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sponsor records" 
ON public.sponsors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsor records" 
ON public.sponsors 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for sponsor_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.sponsor_subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sponsors 
    WHERE id = sponsor_subscriptions.sponsor_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.sponsor_subscriptions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sponsors 
    WHERE id = sponsor_subscriptions.sponsor_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own subscriptions" 
ON public.sponsor_subscriptions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.sponsors 
    WHERE id = sponsor_subscriptions.sponsor_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for sponsor_assets
CREATE POLICY "Users can manage their own sponsor assets" 
ON public.sponsor_assets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.sponsors 
    WHERE id = sponsor_assets.sponsor_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Approved assets are viewable by everyone" 
ON public.sponsor_assets 
FOR SELECT 
USING (admin_approved = true AND active = true);

-- Triggers for updated_at columns
CREATE TRIGGER update_sponsor_tiers_updated_at
BEFORE UPDATE ON public.sponsor_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsor_subscriptions_updated_at
BEFORE UPDATE ON public.sponsor_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsor_assets_updated_at
BEFORE UPDATE ON public.sponsor_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();