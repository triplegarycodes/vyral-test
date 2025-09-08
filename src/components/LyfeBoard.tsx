import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserProfile } from "@/components/UserProfile";
import { LevelUpAnimation } from "@/components/LevelUpAnimation";
import { 
  Target, 
  Plus, 
  Check, 
  Clock, 
  Trophy, 
  Zap, 
  Calendar,
  Sparkles,
  Brain,
  CheckCircle,
  Edit,
  Trash2,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  xp_reward: number;
}

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

export const LyfeBoard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [aiGoals, setAiGoals] = useState<AIGoal[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [aiPreferences, setAiPreferences] = useState({
    difficulty: 'easy',
    timeAvailable: '30 minutes',
    interests: ''
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    priority: 'medium'
  });
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const { toast } = useToast();

interface UserGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  xp_reward: number;
}

  useEffect(() => {
    if (user) {
      fetchAIGoals();
      fetchUserGoals();
    }
  }, [user]);

  const fetchUserGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Using ai_goals table for now since user_goals doesn't exist yet
      const { data, error } = await supabase
        .from('ai_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_type', 'personal')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserGoals(data || []);
    } catch (error) {
      console.error('Error fetching user goals:', error);
      toast({
        title: "Failed to load goals",
        description: "There was an error loading your goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAIGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAiGoals(data || []);
    } catch (error) {
      console.error('Error fetching AI goals:', error);
      toast({
        title: "Failed to load goals",
        description: "There was an error loading your goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getXPForLevel = (level: number) => {
    if (level === 1) return 10;
    return Math.floor(10 * Math.pow(1.5, level - 1));
  };

  const addXPAndCheckLevelUp = async (xpGained: number) => {
    if (!user || !profile) return;

    const currentXP = profile.xp;
    const currentLevel = profile.level;
    const newXP = currentXP + xpGained;
    
    // Calculate if level up occurs
    let newLevelValue = currentLevel;
    let totalXPNeeded = getXPForLevel(currentLevel + 1);
    
    while (newXP >= totalXPNeeded) {
      newLevelValue++;
      totalXPNeeded = getXPForLevel(newLevelValue + 1);
    }

    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update({ 
        xp: newXP, 
        level: newLevelValue,
        vybecoin_balance: profile.vybecoin_balance + (newLevelValue > currentLevel ? newLevelValue * 10 : 0)
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    // Refresh profile data
    await refreshProfile();

    // Show level up animation if level increased
    if (newLevelValue > currentLevel) {
      setNewLevel(newLevelValue);
      setShowLevelUp(true);
    }

    // Show XP gain toast
    toast({
      title: `+${xpGained} XP!`,
      description: newLevelValue > currentLevel ? `🎉 Level ${newLevelValue} achieved!` : "Great progress!",
    });
  };

  const createUserGoal = async () => {
    if (!user) return;

    if (!newGoal.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a goal title",
        variant: "destructive"
      });
      return;
    }

    const xpReward = newGoal.priority === 'high' ? 50 : newGoal.priority === 'medium' ? 35 : 25;

    const { error } = await supabase
      .from('ai_goals')
      .insert({
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        priority: newGoal.priority,
        target_date: newGoal.target_date || null,
        xp_reward: xpReward
      });

    if (error) {
      toast({
        title: "Error creating goal",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Goal created! 🎯",
      description: "Your personal goal has been added"
    });

    setNewGoal({
      title: '',
      description: '',
      category: 'personal',
      target_date: '',
      priority: 'medium'
    });
    setShowGoalDialog(false);
    fetchUserGoals();
  };

  const toggleUserGoalCompletion = async (goal: UserGoal) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_goals')
      .update({ 
        completed: !goal.completed,
        completed_at: !goal.completed ? new Date().toISOString() : null
      })
      .eq('id', goal.id);

    if (error) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (!goal.completed) {
      await addXPAndCheckLevelUp(goal.xp_reward);
    }

    fetchUserGoals();
  };

  const deleteUserGoal = async (goalId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error deleting goal",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Goal deleted",
      description: "Your goal has been removed"
    });

    fetchUserGoals();
  };

  const generateAIGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setGeneratingGoals(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-goals', {
        body: {
          difficulty: aiPreferences.difficulty,
          timeAvailable: aiPreferences.timeAvailable,
          interests: aiPreferences.interests.split(',').map(i => i.trim()).filter(Boolean)
        }
      });

      if (error) throw error;
      
      // Insert generated goals
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
      setShowAIDialog(false);
    } catch (error) {
      console.error('Error generating goals:', error);
      toast({
        title: "Error generating goals",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setGeneratingGoals(false);
    }
  };

  const toggleGoalCompletion = async (goal: AIGoal) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_goals')
      .update({ 
        completed: !goal.completed,
        completed_at: !goal.completed ? new Date().toISOString() : null
      })
      .eq('id', goal.id);

    if (error) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (!goal.completed) {
      await addXPAndCheckLevelUp(goal.xp_reward);
    }

    fetchAIGoals();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon={Target}
          title="Getting Ready..."
          description="Setting up your personal dashboard"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* User Profile */}
        <UserProfile />

        {/* XP Progress Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-gaming">
              <Zap className="w-5 h-5 text-gaming-orange" />
              Progress Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level {profile.level}</span>
                <span className="font-mono">
                  {profile.xp} / {getXPForLevel(profile.level + 1)} XP
                </span>
              </div>
              <Progress 
                value={Math.min(
                  ((profile.xp - getXPForLevel(profile.level)) / 
                   (getXPForLevel(profile.level + 1) - getXPForLevel(profile.level))) * 100, 
                  100
                )} 
                className="h-3 xp-bar" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-gaming-orange" />
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-lg font-gaming font-bold">{profile.streak_count}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Target className="w-6 h-6 mx-auto mb-1 text-gaming-green" />
                <p className="text-xs text-muted-foreground">Goals</p>
                <p className="text-lg font-gaming font-bold">{aiGoals.filter(g => g.completed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Goals Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-gaming">
                <User className="w-5 h-5 text-primary" />
                Personal Goals
              </CardTitle>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle className="font-gaming flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createUserGoal(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="e.g., Learn guitar, Read 5 books"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        placeholder="More details about your goal..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">📚 Academic</SelectItem>
                          <SelectItem value="personal">🌱 Personal</SelectItem>
                          <SelectItem value="extracurricular">🎯 Extracurricular</SelectItem>
                          <SelectItem value="financial">💰 Financial</SelectItem>
                          <SelectItem value="health">💪 Health</SelectItem>
                          <SelectItem value="creative">🎨 Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low (+25 XP)</SelectItem>
                          <SelectItem value="medium">🟡 Medium (+35 XP)</SelectItem>
                          <SelectItem value="high">🔴 High (+50 XP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Date (optional)</Label>
                      <Input
                        type="date"
                        value={newGoal.target_date}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Create and track your personal goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userGoals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No Personal Goals Yet"
                description="Create your first goal to start tracking your progress!"
                actionLabel="Add Goal"
                onAction={() => setShowGoalDialog(true)}
              />
            ) : (
              <div className="space-y-3">
                {userGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border transition-all ${
                      goal.completed 
                        ? 'bg-muted/30 border-gaming-green/30' 
                        : 'bg-card/50 border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Button
                        size="sm"
                        variant={goal.completed ? "default" : "outline"}
                        className={`mt-0.5 ${goal.completed ? 'bg-gaming-green hover:bg-gaming-green/80' : ''}`}
                        onClick={() => toggleUserGoalCompletion(goal)}
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className={`text-xs mt-1 ${goal.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1 text-gaming-orange" />
                            {goal.xp_reward} XP
                          </Badge>
                        </div>
                        {goal.target_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal);
                            setNewGoal({
                              title: goal.title,
                              description: goal.description || '',
                              category: goal.category,
                              priority: goal.priority,
                              target_date: goal.target_date || ''
                            });
                            setShowGoalDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUserGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userGoals.length > 5 && (
                  <Button variant="ghost" className="w-full">
                    View All Goals ({userGoals.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Goals Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-gaming">
                <Brain className="w-5 h-5 text-gaming-purple" />
                AI Goals
              </CardTitle>
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="gaming">
                    <Plus className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle className="font-gaming flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gaming-purple" />
                      AI Goal Generator
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={generateAIGoals} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select
                        value={aiPreferences.difficulty}
                        onValueChange={(value) => setAiPreferences(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy - Small steps</SelectItem>
                          <SelectItem value="medium">Medium - Balanced</SelectItem>
                          <SelectItem value="hard">Hard - Challenge me</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Available</Label>
                      <Select
                        value={aiPreferences.timeAvailable}
                        onValueChange={(value) => setAiPreferences(prev => ({ ...prev, timeAvailable: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15 minutes">15 minutes</SelectItem>
                          <SelectItem value="30 minutes">30 minutes</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="2+ hours">2+ hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Interests (optional)</Label>
                      <Input
                        placeholder="music, art, coding, sports..."
                        value={aiPreferences.interests}
                        onChange={(e) => setAiPreferences(prev => ({ ...prev, interests: e.target.value }))}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={generatingGoals}>
                      {generatingGoals ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Goals
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Personalized goals powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiGoals.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No Goals Yet"
                description="Generate your first AI-powered goals to start your journey!"
                actionLabel="Generate Goals"
                onAction={() => setShowAIDialog(true)}
              />
            ) : (
              <div className="space-y-3">
                {aiGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border transition-all ${
                      goal.completed 
                        ? 'bg-muted/30 border-gaming-green/30' 
                        : 'bg-card/50 border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Button
                        size="sm"
                        variant={goal.completed ? "default" : "outline"}
                        className={`mt-0.5 ${goal.completed ? 'bg-gaming-green hover:bg-gaming-green/80' : ''}`}
                        onClick={() => toggleGoalCompletion(goal)}
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className={`text-xs mt-1 ${goal.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1 text-gaming-orange" />
                            {goal.xp_reward} XP
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiGoals.length > 5 && (
                  <Button variant="ghost" className="w-full">
                    View All Goals ({aiGoals.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level Up Animation */}
        {showLevelUp && (
          <LevelUpAnimation
            newLevel={newLevel}
            onComplete={() => setShowLevelUp(false)}
          />
        )}
      </div>
    </div>
  );
};