import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Coins, Star, Sparkles, Crown, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rarity: string;
  metadata: any;
  active: boolean;
}

interface UserProfile {
  vybecoin_balance: number;
}

export const VShop = () => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    setLoading(true);
    
    // Fetch shop items
    const { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (itemsError) {
      toast({
        title: "Error loading shop",
        description: itemsError.message,
        variant: "destructive"
      });
    } else {
      setShopItems(items || []);
    }

    // Fetch user profile for VybeCoin balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('vybecoin_balance')
      .single();

    if (profileError) {
      console.log("User not logged in or profile not found");
      setUserProfile({ vybecoin_balance: 0 });
    } else {
      setUserProfile(profile);
    }

    setLoading(false);
  };

  const purchaseItem = async (item: ShopItem) => {
    if (!userProfile || userProfile.vybecoin_balance < item.price) {
      toast({
        title: "Insufficient VybeCoins",
        description: `You need ${item.price} VybeCoins to purchase this item`,
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to make purchases", variant: "destructive" });
      return;
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('user_purchases')
      .insert([{
        user_id: user.id,
        sku: item.id,
        metadata: { item_name: item.name, price: item.price }
      }]);

    if (purchaseError) {
      toast({
        title: "Purchase failed",
        description: purchaseError.message,
        variant: "destructive"
      });
      return;
    }

    // Record coin transaction
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert([{
        user_id: user.id,
        amount: -item.price,
        reason: `Purchased ${item.name}`
      }]);

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }

    toast({
      title: "Purchase successful! 🎉",
      description: `You've unlocked ${item.name}!`
    });

    // Refresh user profile
    fetchShopData();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground';
      case 'rare': return 'text-primary';
      case 'epic': return 'text-gaming-purple';
      case 'legendary': return 'text-gaming-orange';
      default: return 'text-muted-foreground';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'rare': return <Sparkles className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4 text-gaming-orange" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tree_style': return <Sparkles className="w-5 h-5" />;
      case 'theme': return <Palette className="w-5 h-5" />;
      case 'badge': return <Crown className="w-5 h-5" />;
      case 'boost': return <Star className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(shopItems.map(item => item.category)))];

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            V-Shop
          </h1>
          <p className="text-muted-foreground">Loading amazing items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          V-Shop
        </h1>
        <p className="text-muted-foreground">Spend your VybeCoins on cool customizations</p>
      </div>

      {/* VybeCoin Balance */}
      <Card className="p-4 text-center bg-gradient-to-r from-gaming-purple/20 to-accent/20 border-accent/30">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-gaming font-bold">{userProfile?.vybecoin_balance || 0}</h2>
        </div>
        <p className="text-sm text-muted-foreground">VybeCoins Available</p>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tree_style">Tree</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
          <TabsTrigger value="boost">Boosts</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items in this category</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const canAfford = (userProfile?.vybecoin_balance || 0) >= item.price;
                
                return (
                  <Card key={item.id} className="p-4 hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className={`flex items-center gap-1 ${getRarityColor(item.rarity)}`}>
                              {getRarityIcon(item.rarity)}
                              <span className="text-xs capitalize">{item.rarity}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-accent" />
                              <span className="font-semibold">{item.price}</span>
                            </div>
                            
                            <Button
                              variant={canAfford ? "gaming" : "outline"}
                              size="sm"
                              disabled={!canAfford}
                              onClick={() => purchaseItem(item)}
                            >
                              {canAfford ? "Purchase" : "Can't Afford"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pro Tip */}
      <Card className="p-4 bg-gaming-green/10 border-gaming-green/30">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-gaming-green" />
          <div>
            <h3 className="font-semibold text-gaming-green">Pro Tip</h3>
            <p className="text-xs text-muted-foreground">
              Complete VybeStryke challenges to earn more VybeCoins and unlock exclusive items!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};