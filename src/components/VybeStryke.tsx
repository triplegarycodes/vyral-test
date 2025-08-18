import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Target, Trophy, Clock, Coins, Star, CheckCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  vybecoin_reward: number;
  daily: boolean;
}

interface ChallengeProgress {
  id: string;
  challenge_id: string;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
}

export const VybeStryke = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<ChallengeProgress[]>([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchUserProgress();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('vybestryke_challenges')
      .select('*')
      .eq('active', true)
      .order('xp_reward', { ascending: true });

    if (error) {
      toast({
        title: "Error loading challenges",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setChallenges(data || []);
    }
    setLoading(false);
  };

  const fetchUserProgress = async () => {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('*');

    if (error) {
      console.error("Error fetching progress:", error);
    } else {
      setUserProgress(data || []);
    }
  };

  const startChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('user_challenge_progress')
      .upsert([{
        challenge_id: challengeId,
        completed: false,
        started_at: new Date().toISOString()
      }], { onConflict: 'user_id,challenge_id' });

    if (error) {
      toast({
        title: "Error starting challenge",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Challenge started!",
        description: "Good luck completing this challenge!"
      });
      fetchUserProgress();
    }
  };

  const completeChallenge = async (challenge: Challenge) => {
    // Mark challenge as completed
    const { error: progressError } = await supabase
      .from('user_challenge_progress')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('challenge_id', challenge.id);

    if (progressError) {
      toast({
        title: "Error completing challenge",
        description: progressError.message,
        variant: "destructive"
      });
      return;
    }

    // Award VybeCoins
    if (challenge.vybecoin_reward > 0) {
      const { error: coinError } = await supabase
        .from('coin_transactions')
        .insert([{
          amount: challenge.vybecoin_reward,
          reason: `Completed challenge: ${challenge.title}`
        }]);

      if (coinError) {
        console.error("Error awarding coins:", coinError);
      }
    }

    toast({
      title: "Challenge completed! 🎉",
      description: `Earned ${challenge.xp_reward} XP and ${challenge.vybecoin_reward} VybeCoins!`
    });

    fetchUserProgress();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-gaming-green';
      case 'medium': return 'text-gaming-orange';
      case 'hard': return 'text-gaming-purple';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'academic': return '📚';
      case 'wellness': return '🧘';
      case 'creativity': return '🎨';
      default: return '⭐';
    }
  };

  const getUserProgress = (challengeId: string) => {
    return userProgress.find(p => p.challenge_id === challengeId);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'daily') return challenge.daily;
    if (activeTab === 'all') return true;
    return challenge.category === activeTab;
  });

  const completedToday = userProgress.filter(p => 
    p.completed && 
    p.completed_at && 
    new Date(p.completed_at).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            VybeStryke
          </h1>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          VybeStryke
        </h1>
        <p className="text-muted-foreground">Daily challenges to level up your life</p>
      </div>

      {/* Daily Stats */}
      <Card className="p-4 bg-gradient-to-r from-gaming-purple/20 to-accent/20 border-accent/30">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <Trophy className="w-8 h-8 text-gaming-orange mx-auto mb-1" />
            <h3 className="font-semibold text-lg">{completedToday}</h3>
            <p className="text-xs text-muted-foreground">Completed Today</p>
          </div>
          <div className="text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-1" />
            <h3 className="font-semibold text-lg">{challenges.filter(c => c.daily).length}</h3>
            <p className="text-xs text-muted-foreground">Daily Challenges</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-accent mx-auto mb-1" />
            <h3 className="font-semibold text-lg">{userProgress.filter(p => p.completed).length}</h3>
            <p className="text-xs text-muted-foreground">Total Complete</p>
          </div>
        </div>
      </Card>

      {/* Challenge Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="academic">Study</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No challenges in this category</p>
              </div>
            ) : (
              filteredChallenges.map((challenge) => {
                const progress = getUserProgress(challenge.id);
                const isCompleted = progress?.completed || false;
                const isStarted = !!progress && !isCompleted;
                
                return (
                  <Card key={challenge.id} className={`p-4 ${isCompleted ? 'bg-gaming-green/10 border-gaming-green/30' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{getCategoryIcon(challenge.category)}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{challenge.title}</h3>
                            {challenge.daily && (
                              <Badge variant="secondary" className="text-xs">Daily</Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}
                            >
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {challenge.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-accent" />
                              <span>{challenge.xp_reward} XP</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-gaming-orange" />
                              <span>{challenge.vybecoin_reward} Coins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-gaming-green">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : isStarted ? (
                          <Button
                            variant="gaming"
                            size="sm"
                            onClick={() => completeChallenge(challenge)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startChallenge(challenge.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isStarted && !isCompleted && (
                      <div className="mt-3 p-3 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">In Progress</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Started {new Date(progress.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Streak Info */}
      <Card className="p-4 bg-gaming-orange/10 border-gaming-orange/30">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-gaming-orange" />
          <div>
            <h3 className="font-semibold text-gaming-orange">Build Your Streak</h3>
            <p className="text-xs text-muted-foreground">
              Complete daily challenges to build streaks and earn bonus rewards!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};