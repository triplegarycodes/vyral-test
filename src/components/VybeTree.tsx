import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TreePine, Star, Sparkles, Crown, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LevelUpAnimation } from "./LevelUpAnimation";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface Profile {
  level: number;
  xp: number;
  streak_count: number;
  vybecoin_balance: number;
}

export const VybeTree = () => {
  const { user, profile } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setUserProfile({
        level: profile.level,
        xp: profile.xp,
        streak_count: profile.streak_count,
        vybecoin_balance: profile.vybecoin_balance
      });
      setPreviousLevel(profile.level);
      setLoading(false);
    }
  }, [profile]);

  const getXPForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(50 * Math.pow(1.5, level - 2));
  };

  const getXPForNextLevel = (currentLevel: number): number => {
    return getXPForLevel(currentLevel + 1);
  };

  const getCurrentLevelProgress = (currentXP: number, currentLevel: number): number => {
    const currentLevelMinXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForNextLevel(currentLevel);
    const progressInLevel = currentXP - currentLevelMinXP;
    const totalLevelXP = nextLevelXP - currentLevelMinXP;
    return Math.max(0, Math.min(100, (progressInLevel / totalLevelXP) * 100));
  };

  const getTreeStage = (level: number): { icon: JSX.Element; description: string; color: string } => {
    if (level < 5) {
      return {
        icon: <Leaf className="w-16 h-16 text-gaming-green animate-pulse" />,
        description: "Young Sprout",
        color: "text-gaming-green"
      };
    } else if (level < 10) {
      return {
        icon: <TreePine className="w-16 h-16 text-gaming-green" />,
        description: "Growing Sapling", 
        color: "text-gaming-green"
      };
    } else if (level < 15) {
      return {
        icon: <TreePine className="w-16 h-16 text-primary" />,
        description: "Strong Tree",
        color: "text-primary"
      };
    } else if (level < 20) {
      return {
        icon: <TreePine className="w-16 h-16 text-gaming-purple" />,
        description: "Majestic Oak",
        color: "text-gaming-purple"
      };
    } else {
      return {
        icon: <TreePine className="w-16 h-16 text-gaming-orange animate-bounce" />,
        description: "Legendary Ancient Tree",
        color: "text-gaming-orange"
      };
    }
  };

  const addExampleXP = async () => {
    if (!user || !userProfile) return;

    const xpToAdd = 25;
    const newXP = userProfile.xp + xpToAdd;
    
    // Check if leveling up
    const currentLevelMinXP = getXPForLevel(userProfile.level);
    const nextLevelXP = getXPForNextLevel(userProfile.level);
    
    let newLevel = userProfile.level;
    if (newXP >= nextLevelXP) {
      newLevel = userProfile.level + 1;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Show level up animation if leveled up
    if (newLevel > userProfile.level) {
      setShowLevelUp(true);
      toast({
        title: "Level Up! 🎉",
        description: `Congratulations! You reached level ${newLevel}!`
      });
    } else {
      toast({
        title: "XP Gained! ⭐",
        description: `+${xpToAdd} XP earned!`
      });
    }

    // Update local state
    setUserProfile({
      ...userProfile,
      xp: newXP,
      level: newLevel
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <TreePine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">VybeTree Awaits</h3>
        <p className="text-muted-foreground">Sign in to grow your personal VybeTree and track your progress!</p>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card className="p-8 text-center">
        <TreePine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Loading Your Tree</h3>
        <p className="text-muted-foreground">Setting up your VybeTree...</p>
      </Card>
    );
  }

  const treeStage = getTreeStage(userProfile.level);
  const progressPercent = getCurrentLevelProgress(userProfile.xp, userProfile.level);
  const xpNeeded = getXPForNextLevel(userProfile.level) - userProfile.xp;

  return (
    <div className="space-y-6 p-4">
      {showLevelUp && (
        <LevelUpAnimation 
          newLevel={userProfile.level}
          onComplete={() => setShowLevelUp(false)}
        />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Your VybeTree
        </h1>
        <p className="text-muted-foreground">Watch your progress grow into something beautiful</p>
      </div>

      {/* Tree Visualization */}
      <Card className="p-6 text-center bg-gradient-to-b from-sky-100/20 to-green-100/20 border-gaming-green/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {treeStage.icon}
            {userProfile.level >= 20 && (
              <Crown className="w-6 h-6 text-gaming-orange absolute -top-2 -right-2 animate-pulse" />
            )}
          </div>
          
          <div className="text-center">
            <h2 className={`text-xl font-gaming font-bold ${treeStage.color}`}>
              {treeStage.description}
            </h2>
            <Badge variant="secondary" className="mt-2">
              Level {userProfile.level}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Level Progress</h3>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{userProfile.xp} XP</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Level {userProfile.level}</span>
              <span>Level {userProfile.level + 1}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">
              {xpNeeded} XP needed for next level
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <Sparkles className="w-6 h-6 text-accent mx-auto mb-2" />
          <h3 className="font-semibold text-lg">{userProfile.streak_count}</h3>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Crown className="w-6 h-6 text-gaming-orange mx-auto mb-2" />
          <h3 className="font-semibold text-lg">{userProfile.vybecoin_balance}</h3>
          <p className="text-xs text-muted-foreground">VybeCoins</p>
        </Card>
      </div>

      {/* Growth Milestones */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Growth Milestones</h3>
        <div className="space-y-2">
          <div className={`flex items-center gap-3 ${userProfile.level >= 5 ? 'text-gaming-green' : 'text-muted-foreground'}`}>
            <TreePine className="w-4 h-4" />
            <span className="text-sm">Reach Level 5 - Become a Sapling</span>
            {userProfile.level >= 5 && <Badge variant="secondary" className="ml-auto text-xs">Complete!</Badge>}
          </div>
          
          <div className={`flex items-center gap-3 ${userProfile.level >= 10 ? 'text-primary' : 'text-muted-foreground'}`}>
            <Star className="w-4 h-4" />
            <span className="text-sm">Reach Level 10 - Strong Tree</span>
            {userProfile.level >= 10 && <Badge variant="secondary" className="ml-auto text-xs">Complete!</Badge>}
          </div>
          
          <div className={`flex items-center gap-3 ${userProfile.level >= 15 ? 'text-gaming-purple' : 'text-muted-foreground'}`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Reach Level 15 - Majestic Oak</span>
            {userProfile.level >= 15 && <Badge variant="secondary" className="ml-auto text-xs">Complete!</Badge>}
          </div>
          
          <div className={`flex items-center gap-3 ${userProfile.level >= 20 ? 'text-gaming-orange' : 'text-muted-foreground'}`}>
            <Crown className="w-4 h-4" />
            <span className="text-sm">Reach Level 20 - Legendary Ancient</span>
            {userProfile.level >= 20 && <Badge variant="secondary" className="ml-auto text-xs">Complete!</Badge>}
          </div>
        </div>
      </Card>

      {/* Demo Button (remove in production) */}
      <Card className="p-4 bg-accent/10 border-accent/30">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Complete tasks to gain XP and grow your tree!</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addExampleXP}
            className="text-xs"
          >
            Demo: Add 25 XP
          </Button>
        </div>
      </Card>
    </div>
  );
};