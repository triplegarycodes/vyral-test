import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Target, TrendingUp, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
}

export const MoneyHub = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    deadline: "",
    category: "general"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialGoals();
  }, []);

  const fetchFinancialGoals = async () => {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching goals",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setGoals(data || []);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to create goals", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('financial_goals')
      .insert([{
        user_id: user.id,
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        deadline: newGoal.deadline || null,
        category: newGoal.category,
        current_amount: 0
      }]);

    if (error) {
      toast({
        title: "Error creating goal",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Goal created!",
        description: "Your financial goal has been added"
      });
      setNewGoal({ title: "", target_amount: "", deadline: "", category: "general" });
      setShowAddGoal(false);
      fetchFinancialGoals();
    }
  };

  const updateProgress = async (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.max(0, goal.current_amount + amount);
    
    const { error } = await supabase
      .from('financial_goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive"
      });
    } else {
      fetchFinancialGoals();
      toast({
        title: "Progress updated!",
        description: `Added $${amount} to your goal`
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error deleting goal",
        description: error.message,
        variant: "destructive"
      });
    } else {
      fetchFinancialGoals();
      toast({
        title: "Goal deleted",
        description: "Your financial goal has been removed"
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Money Moves Hub
        </h1>
        <p className="text-muted-foreground">Master your finances and build your future</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <DollarSign className="w-8 h-8 text-gaming-green mx-auto mb-2" />
          <h3 className="font-semibold text-lg">${goals.reduce((sum, g) => sum + g.current_amount, 0).toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground">Total Saved</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Target className="w-8 h-8 text-accent mx-auto mb-2" />
          <h3 className="font-semibold text-lg">{goals.length}</h3>
          <p className="text-xs text-muted-foreground">Active Goals</p>
        </Card>
      </div>

      {/* Financial Goals */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Financial Goals</h2>
          <Button 
            variant="gaming" 
            size="sm" 
            onClick={() => setShowAddGoal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>

        {showAddGoal && (
          <Card className="p-4 mb-4 border-accent/30">
            <h3 className="font-semibold mb-3">Create New Goal</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., New laptop, College fund"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Target Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="500"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addGoal} className="flex-1">Create Goal</Button>
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No financial goals yet</p>
              <p className="text-sm">Create your first goal to start tracking your savings!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {goal.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>${goal.current_amount.toFixed(2)}</span>
                      <span>${goal.target_amount.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>
                  
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Target: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                  
                  {!isCompleted && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateProgress(goal.id, 10)}
                      >
                        +$10
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateProgress(goal.id, 25)}
                      >
                        +$25
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateProgress(goal.id, 50)}
                      >
                        +$50
                      </Button>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="text-center py-2">
                      <Badge className="bg-gaming-green text-white">
                        🎉 Goal Completed!
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Financial Tips */}
      <Card className="p-4 bg-gaming-purple/10 border-gaming-purple/30">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-6 h-6 text-gaming-purple" />
          <h3 className="font-semibold text-gaming-purple">Money Tips for Teens</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p>• Start with small, achievable goals ($50-$200)</p>
          <p>• Track every dollar - awareness is the first step</p>
          <p>• Consider the 50/30/20 rule: needs, wants, savings</p>
          <p>• Look for part-time work or freelance opportunities</p>
          <p>• Research scholarships and grants for education</p>
        </div>
      </Card>
    </div>
  );
};