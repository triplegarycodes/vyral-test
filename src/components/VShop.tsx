import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Coins, Star, Sparkles, Crown, Palette, Zap, TreePine, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import shopLogo from "@/assets/shop-logo.png";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rarity: string;
  icon: React.ReactNode;
  stackable: boolean;
}

interface UserProfile {
  vybecoin_balance: number;
}

export const VShop = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [purchasedItems, setPurchasedItems] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  // 8 unique and fun shop items
  const shopItems: ShopItem[] = [
    {
      id: "glow-avatar",
      name: "Glow Avatar Frame",
      description: "Make your profile picture shine with a magical glow effect",
      price: 150,
      category: "cosmetic",
      rarity: "rare",
      icon: <Sparkles className="w-5 h-5" />,
      stackable: false
    },
    {
      id: "rainbow-tree",
      name: "Rainbow Tree Skin",
      description: "Transform your VybeTree into a stunning rainbow masterpiece",
      price: 300,
      category: "tree",
      rarity: "epic",
      icon: <TreePine className="w-5 h-5 text-gaming-purple" />,
      stackable: false
    },
    {
      id: "xp-boost",
      name: "2x XP Boost",
      description: "Double your XP gain for 24 hours of active play",
      price: 200,
      category: "boost",
      rarity: "common",
      icon: <Zap className="w-5 h-5 text-gaming-orange" />,
      stackable: true
    },
    {
      id: "crown-badge",
      name: "Golden Crown Badge",
      description: "Show your royal status with this prestigious badge",
      price: 500,
      category: "badge",
      rarity: "legendary",
      icon: <Crown className="w-5 h-5 text-gaming-orange" />,
      stackable: false
    },
    {
      id: "streak-shield",
      name: "Streak Shield",
      description: "Protect your streak from breaking for one missed day",
      price: 100,
      category: "utility",
      rarity: "common",
      icon: <Heart className="w-5 h-5 text-gaming-green" />,
      stackable: true
    },
    {
      id: "custom-theme",
      name: "Neon Dreams Theme",
      description: "Unlock the exclusive neon-themed color palette",
      price: 250,
      category: "theme",
      rarity: "rare",
      icon: <Palette className="w-5 h-5" />,
      stackable: false
    },
    {
      id: "mega-boost",
      name: "Mega VybeCoin Boost",
      description: "Earn 50% more VybeCoins from all activities for 48 hours",
      price: 350,
      category: "boost",
      rarity: "epic",
      icon: <Coins className="w-5 h-5 text-accent" />,
      stackable: true
    },
    {
      id: "exclusive-title",
      name: "\"VybeChampion\" Title",
      description: "Display the exclusive VybeChampion title on your profile",
      price: 400,
      category: "badge",
      rarity: "legendary",
      icon: <Star className="w-5 h-5 text-gaming-orange" />,
      stackable: false
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserProfile({ vybecoin_balance: 0 });
      setLoading(false);
      return;
    }

    // Fetch user profile for VybeCoin balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('vybecoin_balance')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.log("Profile not found, creating default");
      setUserProfile({ vybecoin_balance: 100 });
    } else {
      setUserProfile(profile);
    }

    // Fetch purchased items from database
    const { data: purchases, error: purchaseError } = await supabase
      .from('shop_purchases')
      .select('item_id, quantity')
      .eq('user_id', user.id);

    if (purchaseError) {
      console.error('Error fetching purchases:', purchaseError);
    } else {
      // Convert to the format our component expects
      const purchaseMap: {[key: string]: number} = {};
      purchases?.forEach(purchase => {
        purchaseMap[purchase.item_id] = (purchaseMap[purchase.item_id] || 0) + purchase.quantity;
      });
      setPurchasedItems(purchaseMap);
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
      toast({ 
        title: "Please log in", 
        description: "You must be logged in to make purchases", 
        variant: "destructive" 
      });
      return;
    }

    // Check if item is already purchased and not stackable
    if (!item.stackable && purchasedItems[item.id] > 0) {
      toast({
        title: "Already Owned",
        description: "You already own this item!",
        variant: "destructive"
      });
      return;
    }

    // Update user's VybeCoin balance
    const newBalance = userProfile.vybecoin_balance - item.price;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ vybecoin_balance: newBalance })
      .eq('user_id', user.id);

    if (updateError) {
      toast({
        title: "Purchase failed",
        description: updateError.message,
        variant: "destructive"
      });
      return;
    }

    // Record the purchase in the database
    const { error: purchaseError } = await supabase
      .from('shop_purchases')
      .insert({
        user_id: user.id,
        item_id: item.id,
        item_name: item.name,
        price_paid: item.price,
        metadata: { category: item.category, rarity: item.rarity }
      });

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

    // Update local state
    setUserProfile(prev => prev ? { ...prev, vybecoin_balance: newBalance } : null);
    
    const newPurchasedItems = { ...purchasedItems };
    newPurchasedItems[item.id] = (newPurchasedItems[item.id] || 0) + 1;
    setPurchasedItems(newPurchasedItems);

    toast({
      title: "Purchase successful! 🎉",
      description: `You've unlocked ${item.name}!`,
    });
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
      case 'common': return <Star className="w-3 h-3" />;
      case 'rare': return <Sparkles className="w-3 h-3" />;
      case 'epic': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Crown className="w-3 h-3 text-gaming-orange" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = ['all', 'cosmetic', 'tree', 'boost', 'badge', 'theme', 'utility'];

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary p-1">
            <img 
              src={shopLogo}
              alt="V-Shop" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary p-1">
          <img 
            src={shopLogo}
            alt="V-Shop" 
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="cosmetic">Style</TabsTrigger>
          <TabsTrigger value="boost">Boosts</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
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
                const isOwned = !item.stackable && (purchasedItems[item.id] || 0) > 0;
                
                return (
                  <Card key={item.id} className={`p-4 hover:border-accent/50 transition-colors ${isOwned ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center">
                          {item.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className={`flex items-center gap-1 ${getRarityColor(item.rarity)}`}>
                              {getRarityIcon(item.rarity)}
                              <span className="text-xs capitalize">{item.rarity}</span>
                            </div>
                            {isOwned && <Badge variant="secondary" className="text-xs">Owned</Badge>}
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
                              variant={canAfford && !isOwned ? "gaming" : "outline"}
                              size="sm"
                              disabled={!canAfford || isOwned}
                              onClick={() => purchaseItem(item)}
                            >
                              {isOwned ? "Owned" : canAfford ? "Purchase" : "Can't Afford"}
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
              Complete VybeStryke challenges and MoneyMoves quests to earn more VybeCoins!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};