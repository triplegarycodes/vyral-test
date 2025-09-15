import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BookOpen, Award, TrendingUp, Coins, CheckCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import moneyMovesLogo from "@/assets/money-moves-logo.png";

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  completed: boolean;
}

interface UserProgress {
  completedLessons: string[];
  totalXP: number;
}

export const MoneyMoves = () => {
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLessons: [],
    totalXP: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Complete finance course with 10 lessons
  const courseLessons: CourseLesson[] = [
    {
      id: "lesson-1",
      title: "Understanding Money Basics",
      description: "Learn the fundamental concepts of money, value, and exchange",
      content: "Money is a medium of exchange that allows us to trade goods and services efficiently. In this lesson, we'll explore the history of money, from bartering systems to modern digital currencies. Understanding how money works is the foundation of all financial literacy.",
      xpReward: 50,
      completed: false
    },
    {
      id: "lesson-2", 
      title: "Budgeting Your Way to Success",
      description: "Master the art of creating and sticking to a budget",
      content: "A budget is your financial roadmap. Learn the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. We'll show you how to track expenses, identify spending patterns, and make adjustments to reach your financial goals.",
      xpReward: 75,
      completed: false
    },
    {
      id: "lesson-3",
      title: "The Magic of Compound Interest",
      description: "Discover how your money can grow exponentially over time",
      content: "Albert Einstein called compound interest the 'eighth wonder of the world.' Learn how starting early, even with small amounts, can lead to significant wealth over time. We'll calculate real examples and show you the power of consistent investing.",
      xpReward: 100,
      completed: false
    },
    {
      id: "lesson-4",
      title: "Debt Management Strategies",
      description: "Learn how to tackle debt effectively and avoid financial traps",
      content: "Not all debt is bad, but managing it properly is crucial. Explore the difference between good debt (investments) and bad debt (consumption), and learn strategies like the debt snowball and avalanche methods to become debt-free.",
      xpReward: 75,
      completed: false
    },
    {
      id: "lesson-5",
      title: "Building Your Emergency Fund",
      description: "Create a financial safety net for unexpected expenses",
      content: "Life is unpredictable, but your finances don't have to be. Learn why you need 3-6 months of expenses saved, how to start building your emergency fund even on a tight budget, and where to keep this money for easy access.",
      xpReward: 60,
      completed: false
    },
    {
      id: "lesson-6",
      title: "Introduction to Investing",
      description: "Start your journey into growing wealth through investments",
      content: "Investing isn't just for the wealthy. Learn about different investment vehicles like stocks, bonds, and mutual funds. Understand risk vs. reward, diversification, and how to start investing with just a few dollars.",
      xpReward: 125,
      completed: false
    },
    {
      id: "lesson-7",
      title: "Understanding Credit and Credit Scores",
      description: "Master the credit system and build a strong credit profile",
      content: "Your credit score affects everything from loan rates to job opportunities. Learn how credit scores are calculated, what factors impact them, and practical steps to build and maintain excellent credit throughout your life.",
      xpReward: 90,
      completed: false
    },
    {
      id: "lesson-8",
      title: "Insurance and Risk Management",
      description: "Protect your financial future with proper insurance coverage",
      content: "Insurance is your financial protection against life's uncertainties. Learn about different types of insurance (health, auto, life, disability), how much coverage you need, and how to find the best rates while avoiding over-insurance.",
      xpReward: 80,
      completed: false
    },
    {
      id: "lesson-9",
      title: "Tax Planning Fundamentals",
      description: "Optimize your tax strategy and keep more of your money",
      content: "Taxes are one of your largest expenses, but proper planning can reduce your burden legally. Learn about tax-advantaged accounts, deductions, credits, and basic tax planning strategies that can save you thousands.",
      xpReward: 110,
      completed: false
    },
    {
      id: "lesson-10",
      title: "Creating Your Financial Future",
      description: "Put it all together with a comprehensive financial plan",
      content: "Now that you've learned the fundamentals, it's time to create your personalized financial roadmap. We'll help you set SMART financial goals, create action plans, and build habits that will lead to long-term financial success.",
      xpReward: 150,
      completed: false
    }
  ];

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Load completed lessons from user preferences or a dedicated table
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('custom_quote_collections')
        .eq('user_id', user.id)
        .single();

      if (preferences?.custom_quote_collections && Array.isArray(preferences.custom_quote_collections)) {
        const savedProgress = preferences.custom_quote_collections.find(
          (item: any) => item?.type === 'money_moves_progress'
        );
        
        if (savedProgress && typeof savedProgress === 'object' && savedProgress !== null && 'data' in savedProgress) {
          setUserProgress(savedProgress.data as unknown as UserProgress);
        }
      }
    }
    
    setLoading(false);
  };

  const completeLesson = async (lesson: CourseLesson) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to track progress",
        variant: "destructive"
      });
      return;
    }

    if (userProgress.completedLessons.includes(lesson.id)) {
      toast({
        title: "Already completed",
        description: "You've already completed this lesson!",
        variant: "destructive"
      });
      return;
    }

    // Update progress
    const newProgress = {
      completedLessons: [...userProgress.completedLessons, lesson.id],
      totalXP: userProgress.totalXP + lesson.xpReward
    };
    
    setUserProgress(newProgress);

    // Award XP to user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, total_points')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          xp: profile.xp + lesson.xpReward,
          total_points: profile.total_points + lesson.xpReward
        })
        .eq('user_id', user.id);
    }

    // Save progress to user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('custom_quote_collections')
      .eq('user_id', user.id)
      .single();

    const collections = Array.isArray(preferences?.custom_quote_collections) ? [...preferences.custom_quote_collections] : [];
    const progressIndex = collections.findIndex((item: any) => item?.type === 'money_moves_progress');
    
    if (progressIndex >= 0) {
      collections[progressIndex] = {
        type: 'money_moves_progress',
        data: newProgress
      };
    } else {
      collections.push({
        type: 'money_moves_progress',
        data: newProgress
      });
    }

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        custom_quote_collections: collections
      });

    toast({
      title: "Lesson completed! 🎉",
      description: `You earned ${lesson.xpReward} XP!`,
    });

    setActiveLesson(null);
  };

  const progressPercentage = (userProgress.completedLessons.length / courseLessons.length) * 100;

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary p-1">
            <img 
              src={moneyMovesLogo}
              alt="MoneyMoves" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            MoneyMoves
          </h1>
          <p className="text-muted-foreground">Loading your financial journey...</p>
        </div>
      </div>
    );
  }

  if (activeLesson) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveLesson(null)}
          >
            ← Back to Course
          </Button>
          <div className="w-8 h-8 rounded-lg gradient-primary p-1">
            <img 
              src={moneyMovesLogo}
              alt="MoneyMoves" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">{activeLesson.title}</h1>
            <p className="text-muted-foreground">{activeLesson.description}</p>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="leading-relaxed">{activeLesson.content}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gaming-orange" />
              <span className="font-semibold">{activeLesson.xpReward} XP</span>
            </div>
            
            <Button 
              variant="gaming" 
              onClick={() => completeLesson(activeLesson)}
              disabled={userProgress.completedLessons.includes(activeLesson.id)}
            >
              {userProgress.completedLessons.includes(activeLesson.id) ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                "Complete Lesson"
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary p-1">
          <img 
            src={moneyMovesLogo}
            alt="MoneyMoves" 
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          MoneyMoves
        </h1>
        <p className="text-muted-foreground">Master your finances through interactive learning</p>
      </div>

      {/* Progress Overview */}
      <Card className="p-4 bg-gradient-to-r from-gaming-green/20 to-accent/20 border-accent/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Course Progress</h2>
          <Badge variant="secondary">{userProgress.completedLessons.length}/{courseLessons.length}</Badge>
        </div>
        <Progress value={progressPercentage} className="mb-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-gaming-orange" />
            <span className="font-semibold">{userProgress.totalXP} Total XP</span>
          </div>
        </div>
      </Card>

      {/* Course Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Financial Literacy Course</h2>
        
        {courseLessons.map((lesson, index) => {
          const isCompleted = userProgress.completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !userProgress.completedLessons.includes(courseLessons[index - 1].id);
          
          return (
            <Card 
              key={lesson.id} 
              className={`p-4 ${isCompleted ? 'bg-gaming-green/10 border-gaming-green/30' : isLocked ? 'opacity-50' : 'hover:border-accent/50'} transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-gaming-green/20' : 'bg-muted/30'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-gaming-green" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Lesson {index + 1}: {lesson.title}</h3>
                      {isCompleted && <Badge variant="secondary" className="text-xs">Complete</Badge>}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {lesson.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-gaming-orange" />
                        <span className="text-sm font-semibold">{lesson.xpReward} XP</span>
                      </div>
                      
                      <Button
                        variant={isCompleted ? "outline" : "gaming"}
                        size="sm"
                        disabled={isLocked}
                        onClick={() => setActiveLesson(lesson)}
                      >
                        {isLocked ? (
                          "Locked"
                        ) : isCompleted ? (
                          "Review"
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Course Completion Reward */}
      {progressPercentage === 100 && (
        <Card className="p-4 bg-gaming-orange/10 border-gaming-orange/30">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-gaming-orange" />
            <div>
              <h3 className="font-semibold text-gaming-orange">Course Master!</h3>
              <p className="text-sm text-muted-foreground">
                Congratulations! You've completed the entire financial literacy course and earned {userProgress.totalXP} XP!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};