import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Star,
  Plus,
  Flame,
  Sparkles,
  Brain,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LevelUpAnimation } from "./LevelUpAnimation";
import type { User } from "@supabase/supabase-js";

interface AIGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  estimated_duration: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  streak_count: number;
  last_activity_date?: string;
}

// Progressive XP requirements: 10, 15, 30, 50, 80, 120, 170, 230, 300, 380, 470, 570, 680, 800, 930, 1070, 1220, 1380, 1550, 1730
const calculateXPRequired = (level: number): number => {
  if (level <= 1) return 10;
  if (level <= 2) return 15;
  if (level <= 3) return 30;
  
  // Progressive formula: base + (level * multiplier)
  return Math.floor(10 + (level - 1) * (level * 8));
};

export const LyfeBoard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aiGoals, setAiGoals] = useState<AIGoal[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [goalPreferences, setGoalPreferences] = useState({
    category: 'general',
    difficulty: 'easy',
    timeAvailable: '30 minutes',
    interests: ''
  });
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchAIGoals();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setUserProfile(data);
    }
  };

  const fetchAIGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setAiGoals(data || []);
    }
  };

  const generateAIGoals = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate goals",
        variant: "destructive"
      });
      return;
    }

    setGeneratingGoals(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-goals', {
        body: {
          category: goalPreferences.category,
          difficulty: goalPreferences.difficulty,
          timeAvailable: goalPreferences.timeAvailable,
          interests: goalPreferences.interests.split(',').map(i => i.trim()).filter(Boolean),
          currentGoals: aiGoals.filter(g => !g.completed).map(g => g.title)
        }
      });

      if (error) throw error;

      // Insert generated goals into database
      const goalsToInsert = data.goals.map((goal: any) => ({
        ...goal,
        user_id: user.id
      }));

      const { error: insertError } = await supabase
        .from('ai_goals')
        .insert(goalsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Goals generated!",
        description: `Created ${data.goals.length} personalized goals for you`
      });

      fetchAIGoals();
      setShowAIGenerator(false);

    } catch (error) {
      console.error("Error generating goals:", error);
      toast({
        title: "Error generating goals",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setGeneratingGoals(false);
    }
  };

  const completeGoal = async (goalId: string) => {
    if (!user || !userProfile) return;

    const goal = aiGoals.find(g => g.id === goalId);
    if (!goal) return;

    // Mark goal as completed
    const { error } = await supabase
      .from('ai_goals')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error completing goal",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Update user XP and level
    const newXP = userProfile.xp + goal.xp_reward;
    const currentLevelXP = calculateXPRequired(userProfile.level);
    let newLevel = userProfile.level;
    let remainingXP = newXP;

    // Calculate level ups
    while (remainingXP >= calculateXPRequired(newLevel) && newLevel < 20) {
      remainingXP -= calculateXPRequired(newLevel);
      newLevel++;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        last_activity_date: new Date().toDateString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    } else {
      // Show level up animation if leveled up
      if (newLevel > userProfile.level) {
        setLevelUpLevel(newLevel);
        setShowLevelUp(true);
      }

      toast({
        title: "Goal completed! 🎉",
        description: `+${goal.xp_reward} XP earned${newLevel > userProfile.level ? ` | Level ${newLevel}!` : ''}`
      });

      fetchUserProfile();
      fetchAIGoals();
    }
  };

  if (!userProfile) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            LyfeBoard
          </h1>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const xpRequired = calculateXPRequired(userProfile.level);
  const xpProgress = (userProfile.xp % xpRequired) / xpRequired * 100;
  const activeGoals = aiGoals.filter(g => !g.completed);
  const completedGoals = aiGoals.filter(g => g.completed);

  return (
    <div className="space-y-6 p-4">
      {/* Level Up Animation */}
      {showLevelUp && (
        <LevelUpAnimation 
          newLevel={levelUpLevel} 
          onComplete={() => setShowLevelUp(false)} 
        />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          LyfeBoard
        </h1>
        <p className="text-muted-foreground">Your personal command center</p>
      </div>

      {/* XP & Level Display - Separate Section */}
      <Card className="p-4 gradient-secondary border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gaming-orange" />
            <span className="font-semibold">Level {userProfile.level}</span>
          </div>
          <div className="flex items-center gap-1 text-gaming-orange">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{userProfile.streak_count}</span>
            <span className="text-xs">streak</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{userProfile.xp % xpRequired} / {xpRequired} XP</span>
            <span className="text-muted-foreground">to Level {userProfile.level + 1}</span>
          </div>
          <Progress 
            value={xpProgress} 
            className="h-2 xp-bar"
          />
        </div>
      </Card>

      {/* AI Goal Generator */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-gaming-purple" />
            <h2 className="text-lg font-semibold">AI Goal Generator</h2>
          </div>
          <Button 
            variant="gaming" 
            size="sm"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            disabled={generatingGoals}
          >
            <Plus className="w-4 h-4 mr-1" />
            {generatingGoals ? 'Generating...' : 'Generate Goals'}
          </Button>
        </div>

        {showAIGenerator && (
          <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border-dashed border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={goalPreferences.category} 
                  onValueChange={(value) => setGoalPreferences(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                    <SelectItem value="learning">Learning & Study</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="social">Social & Relationships</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select 
                  value={goalPreferences.difficulty} 
                  onValueChange={(value) => setGoalPreferences(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (10-30 XP)</SelectItem>
                    <SelectItem value="medium">Medium (25-60 XP)</SelectItem>
                    <SelectItem value="hard">Hard (50-100 XP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Available</label>
              <Select 
                value={goalPreferences.timeAvailable} 
                onValueChange={(value) => setGoalPreferences(prev => ({ ...prev, timeAvailable: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10 minutes">10 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2+ hours">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interests (comma-separated)</label>
              <Input
                placeholder="music, art, coding, sports..."
                value={goalPreferences.interests}
                onChange={(e) => setGoalPreferences(prev => ({ ...prev, interests: e.target.value }))}
              />
            </div>

            <Button 
              onClick={generateAIGoals} 
              disabled={generatingGoals}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generatingGoals ? 'Generating Goals...' : 'Generate Personalized Goals'}
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Get AI-powered, personalized daily goals based on your interests and available time!
        </p>
      </Card>

      {/* Active Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Goals
          </h3>
          <Badge variant="secondary">
            {completedGoals.length}/{aiGoals.length}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active goals</p>
              <p className="text-sm">Use the AI Goal Generator above to create some!</p>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <div 
                key={goal.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeGoal(goal.id)}
                    className="w-8 h-8 p-0"
                  >
                    ✓
                  </Button>
                  <div className="flex-1">
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {goal.estimated_duration}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  +{goal.xp_reward} XP
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Completions */}
      {completedGoals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gaming-orange" />
            Recently Completed
          </h3>
          
          <div className="space-y-3">
            {completedGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-gaming-green/10 border border-gaming-green/30">
                <div className="w-8 h-8 rounded-full bg-gaming-green flex items-center justify-center">
                  <span className="text-xs text-black font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gaming-green">{goal.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Completed {goal.completed_at && new Date(goal.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-gaming-green text-gaming-green">
                  +{goal.xp_reward} XP
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-16 flex-col gap-1">
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Weekly View</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-1">
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs">Progress</span>
        </Button>
      </div>
    </div>
  );
};