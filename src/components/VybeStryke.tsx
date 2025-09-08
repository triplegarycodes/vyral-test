import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Shuffle, Brain, Zap, Star, Trophy, Target, Clock, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  streak_bonus?: number;
}

interface DailyStreak {
  current_streak: number;
  last_completed: string | null;
}

export const VybeStryke = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [streak, setStreak] = useState<DailyStreak>({ current_streak: 0, last_completed: null });
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDailyChallenges();
      loadStreak();
    }
  }, [user]);

  const loadDailyChallenges = async () => {
    if (!user) return;

    // Generate 3 daily challenges
    const challenges: Challenge[] = [
      {
        id: 'daily_1',
        title: 'Morning Mindfulness',
        description: 'Take 5 minutes to practice deep breathing or meditation',
        category: 'wellness',
        xp_reward: 25,
        coin_reward: 10,
        difficulty: 'easy',
        completed: false
      },
      {
        id: 'daily_2', 
        title: 'Learning Boost',
        description: 'Spend 30 minutes on educational content or studying',
        category: 'academic',
        xp_reward: 40,
        coin_reward: 15,
        difficulty: 'medium',
        completed: false
      },
      {
        id: 'daily_3',
        title: 'Creative Expression',
        description: 'Create something - write, draw, code, or make music for 20 minutes',
        category: 'creative',
        xp_reward: 35,
        coin_reward: 12,
        difficulty: 'medium',
        completed: false
      }
    ];

    setDailyChallenges(challenges);
    setLoading(false);
  };

  const loadStreak = async () => {
    if (!user || !profile) return;
    
    setStreak({
      current_streak: profile.streak_count || 0,
      last_completed: null
    });
  };

  const completeChallenge = async (challenge: Challenge) => {
    if (!user || challenge.completed) return;

    // Update user XP and coins
    const newXP = (profile?.xp || 0) + challenge.xp_reward;
    const newCoins = (profile?.vybecoin_balance || 0) + challenge.coin_reward;
    const newStreak = streak.current_streak + 1;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        vybecoin_balance: newCoins,
        streak_count: newStreak
      })
      .eq('user_id', user.id);

    if (profileError) {
      toast({
        title: "Error updating progress",
        description: profileError.message,
        variant: "destructive"
      });
      return;
    }

    // Update local state
    setDailyChallenges(prev => 
      prev.map(c => c.id === challenge.id ? { ...c, completed: true } : c)
    );
    setCompletedToday(prev => [...prev, challenge.id]);
    setStreak(prev => ({ ...prev, current_streak: newStreak }));
    
    // Show celebration animation
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    // Refresh profile data
    await refreshProfile();

    toast({
      title: "Challenge Complete! 🎉",
      description: `+${challenge.xp_reward} XP, +${challenge.coin_reward} VybeCoins`,
    });
  };

  const completedCount = dailyChallenges.filter(c => c.completed).length;
  const totalXP = dailyChallenges.filter(c => c.completed).reduce((sum, c) => sum + c.xp_reward, 0);
  const totalCoins = dailyChallenges.filter(c => c.completed).reduce((sum, c) => sum + c.coin_reward, 0);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            VybeStryke
          </h1>
          <p className="text-muted-foreground">Loading your daily challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 relative">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          VybeStryke
        </h1>
        <p className="text-muted-foreground">Complete daily challenges to grow stronger</p>
      </div>

      {/* Daily Progress */}
      <Card className="p-4 bg-gradient-to-r from-gaming-purple/20 to-accent/20 border-accent/30">
        <div className="text-center mb-4">
          <h2 className="text-xl font-gaming font-bold mb-2">Today's Progress</h2>
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <Trophy className="w-6 h-6 text-gaming-orange mx-auto mb-1" />
              <p className="text-sm font-semibold">{completedCount}/3</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 text-gaming-green mx-auto mb-1" />
              <p className="text-sm font-semibold">{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div className="text-center">
              <Coins className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-sm font-semibold">{totalCoins}</p>
              <p className="text-xs text-muted-foreground">VybeCoins</p>
            </div>
          </div>
          <Progress value={(completedCount / 3) * 100} className="h-3" />
        </div>

        {/* Streak Counter */}
        <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-gaming-orange" />
            <span className="text-lg font-gaming font-bold">{streak.current_streak}</span>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </Card>

      {/* Daily Challenges */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Daily Challenges
        </h2>

        <div className="space-y-4">
          {dailyChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all ${
                challenge.completed 
                  ? 'bg-gaming-green/10 border-gaming-green/30' 
                  : 'bg-card/50 border-border/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${challenge.completed ? 'text-gaming-green' : ''}`}>
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gaming-green" />
                      <span>{challenge.xp_reward} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-accent" />
                      <span>{challenge.coin_reward} Coins</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant={challenge.completed ? "secondary" : "gaming"}
                  size="sm"
                  disabled={challenge.completed}
                  onClick={() => completeChallenge(challenge)}
                >
                  {challenge.completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Done!
                    </>
                  ) : (
                    "Complete"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};