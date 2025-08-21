import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CreditCard, Upload, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface SponsorTier {
  id: string;
  name: string;
  price_cents: number;
  display_price: string;
  benefits: any;
  active: boolean;
}

interface Sponsor {
  id: string;
  organization_name: string;
  contact_email: string;
  phone: string;
  website_url: string;
  industry: string;
  status: string;
  stripe_customer_id: string;
}

interface SponsorSubscription {
  id: string;
  status: string;
  current_period_end: string;
  tier_name: string;
}

export const SponsorPortal = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<SponsorTier[]>([]);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [subscription, setSubscription] = useState<SponsorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const { toast } = useToast();

  const [sponsorForm, setSponsorForm] = useState({
    organization_name: "",
    contact_email: "",
    phone: "",
    website_url: "",
    industry: "",
    target_demographics: []
  });

  useEffect(() => {
    if (user) {
      fetchSponsorData();
    }
  }, [user]);

  const fetchSponsorData = async () => {
    setLoading(true);
    
    try {
      // Fetch sponsor tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('sponsor_tiers')
        .select('*')
        .eq('active', true)
        .order('price_cents', { ascending: true });

      if (tiersError) throw tiersError;
      setTiers(tiersData || []);

      // Fetch existing sponsor record
      const { data: sponsorData, error: sponsorError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (sponsorData) {
        setSponsor(sponsorData);
        setSponsorForm({
          organization_name: sponsorData.organization_name || "",
          contact_email: sponsorData.contact_email || "",
          phone: sponsorData.phone || "",
          website_url: sponsorData.website_url || "",
          industry: sponsorData.industry || "",
          target_demographics: Array.isArray(sponsorData.target_demographics) 
            ? sponsorData.target_demographics 
            : []
        });

        // Fetch subscription if sponsor exists
        const { data: subData } = await supabase
          .from('sponsor_subscriptions')
          .select(`
            *,
            sponsor_tiers!inner(name)
          `)
          .eq('sponsor_id', sponsorData.id)
          .single();

        if (subData) {
          setSubscription({
            ...subData,
            tier_name: subData.sponsor_tiers.name
          });
        }
      }

    } catch (error: any) {
      if (error.code !== 'PGRST116') { // Not found error is expected for new sponsors
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    
    setLoading(false);
  };

  const handleCreateCheckout = async () => {
    if (!selectedTier || !sponsorForm.organization_name || !sponsorForm.contact_email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-sponsor-checkout', {
        body: {
          tier_id: selectedTier,
          sponsor_data: sponsorForm
        }
      });

      if (error) throw error;

      // Open checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }

    } catch (error: any) {
      toast({
        title: "Error creating checkout",
        description: error.message,
        variant: "destructive"
      });
    }

    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-gaming-green';
      case 'pending': return 'text-gaming-orange';
      case 'past_due': return 'text-red-500';
      case 'canceled': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'past_due': return <XCircle className="w-4 h-4" />;
      case 'canceled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Access Required</h3>
        <p className="text-muted-foreground">Please sign in to access the sponsor portal</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-gaming font-bold gradient-primary bg-clip-text text-transparent">
          Sponsor Portal
        </h1>
        <p className="text-muted-foreground">
          Partner with VYRAL to reach engaged teen audiences
        </p>
      </div>

      {/* Existing Subscription Status */}
      {sponsor && subscription && (
        <Card className="p-6 bg-accent/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Subscription</h2>
            <div className={`flex items-center gap-2 ${getStatusColor(subscription.status)}`}>
              {getStatusIcon(subscription.status)}
              <Badge variant="outline" className={getStatusColor(subscription.status)}>
                {subscription.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Plan</Label>
              <p className="font-semibold">{subscription.tier_name}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Organization</Label>
              <p className="font-semibold">{sponsor.organization_name}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Next Billing</Label>
              <p className="font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Sponsorship Plans</TabsTrigger>
          <TabsTrigger value="assets">Manage Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Sponsorship Plans */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`p-6 cursor-pointer transition-all hover:border-primary/50 ${
                  selectedTier === tier.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-gaming font-bold">{tier.name}</h3>
                    <p className="text-2xl font-bold text-primary">{tier.display_price}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {Array.isArray(tier.benefits) && tier.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gaming-green flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {selectedTier === tier.id && (
                    <Badge className="bg-primary">Selected</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Sponsor Information Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
              <div className="space-y-2">
                <Label htmlFor="org_name">Organization Name *</Label>
                <Input
                  id="org_name"
                  value={sponsorForm.organization_name}
                  onChange={(e) => setSponsorForm({...sponsorForm, organization_name: e.target.value})}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={sponsorForm.contact_email}
                  onChange={(e) => setSponsorForm({...sponsorForm, contact_email: e.target.value})}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={sponsorForm.phone}
                  onChange={(e) => setSponsorForm({...sponsorForm, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={sponsorForm.website_url}
                  onChange={(e) => setSponsorForm({...sponsorForm, website_url: e.target.value})}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={sponsorForm.industry} 
                onValueChange={(value) => setSponsorForm({...sponsorForm, industry: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education & Learning</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="gaming">Gaming & Entertainment</SelectItem>
                  <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="fitness">Health & Fitness</SelectItem>
                  <SelectItem value="finance">Finance & Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateCheckout}
              disabled={submitting || !selectedTier}
              className="w-full mt-6"
              size="lg"
            >
              {submitting ? (
                <>
                  <LoadingSpinner />
                  Creating Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Start Sponsorship
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* Asset Management */}
        <TabsContent value="assets">
          <Card className="p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Asset Management</h3>
            <p className="text-muted-foreground">Upload and manage your sponsor assets after subscribing to a plan</p>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card className="p-8 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">View engagement metrics and performance data for your sponsored content</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
