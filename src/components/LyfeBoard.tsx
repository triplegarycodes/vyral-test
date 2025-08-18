import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Star,
  Plus,
  Flame
} from "lucide-react";

export const LyfeBoard = () => {
  const userStats = {
    level: 12,
    xp: 2400,
    xpToNext: 3000,
    streak: 7,
    totalPoints: 15420
  };

  const todayGoals = [
    { id: 1, title: "Morning workout", completed: true, xp: 50 },
    { id: 2, title: "Read 20 pages", completed: true, xp: 30 },
    { id: 3, title: "Practice guitar", completed: false, xp: 40 },
    { id: 4, title: "Journal reflection", completed: false, xp: 25 }
  ];

  const recentAchievements = [
    { title: "Week Warrior", description: "7-day streak achieved!", icon: Flame },
    { title: "Knowledge Seeker", description: "Read 100 pages this month", icon: Star },
    { title: "Early Bird", description: "Wake up before 7 AM for 5 days", icon: Trophy }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header Stats */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          LyfeBoard
        </h1>
        <p className="text-muted-foreground">Your personal command center</p>
      </div>

      {/* Level & XP Card */}
      <Card className="p-6 gradient-secondary border-primary/20 glow-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Level {userStats.level}</h2>
            <p className="text-sm text-muted-foreground">
              {userStats.xp.toLocaleString()} / {userStats.xpToNext.toLocaleString()} XP
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gaming-orange mb-1">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{userStats.streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
        
        <div className="relative">
          <Progress 
            value={(userStats.xp / userStats.xpToNext) * 100} 
            className="h-3 xp-bar"
          />
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20"></div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Badge variant="outline" className="border-primary text-primary">
            <Zap className="w-3 h-3 mr-1" />
            {userStats.totalPoints.toLocaleString()} Total XP
          </Badge>
          <Button variant="gaming" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </Card>

      {/* Today's Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today's Quests
          </h3>
          <Badge variant="secondary">
            {todayGoals.filter(g => g.completed).length}/{todayGoals.length}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {todayGoals.map((goal) => (
            <div 
              key={goal.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-gaming ${
                goal.completed 
                  ? 'bg-gaming-green/10 border-gaming-green/30' 
                  : 'bg-muted/50 border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  goal.completed 
                    ? 'bg-gaming-green border-gaming-green' 
                    : 'border-muted-foreground'
                }`}>
                  {goal.completed && <span className="text-xs text-black">✓</span>}
                </div>
                <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                  {goal.title}
                </span>
              </div>
              <Badge variant={goal.completed ? "default" : "outline"} className="text-xs">
                +{goal.xp} XP
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gaming-orange" />
          Recent Achievements
        </h3>
        
        <div className="space-y-3">
          {recentAchievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                <achievement.icon className="w-5 h-5 text-background" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

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