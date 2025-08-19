import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Sparkles } from "lucide-react";

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete: () => void;
}

export const LevelUpAnimation = ({ newLevel, onComplete }: LevelUpAnimationProps) => {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 100);
    const timer2 = setTimeout(() => setStage(2), 800);
    const timer3 = setTimeout(() => setStage(3), 1500);
    const timer4 = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const getLevelMessage = (level: number) => {
    if (level <= 5) return "Getting Started! 🌱";
    if (level <= 10) return "Building Momentum! ⚡";
    if (level <= 15) return "On Fire! 🔥";
    return "Legendary Status! 👑";
  };

  const getLevelReward = (level: number) => {
    if (level === 5) return "Unlocked: Goal Categories!";
    if (level === 10) return "Unlocked: Advanced Challenges!";
    if (level === 15) return "Unlocked: Community Features!";
    if (level === 20) return "Unlocked: VybeLink Premium!";
    return `Unlocked: Level ${level} Badge!`;
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Background glow effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          stage >= 1 ? 'bg-primary/20 blur-3xl scale-150' : 'scale-0'
        }`} />
        
        <Card className={`relative p-8 text-center transition-all duration-800 ${
          stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        } ${stage >= 2 ? 'glow-primary' : ''}`}>
          
          {/* Floating particles */}
          {stage >= 2 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 1000}ms`,
                    animationDuration: '1s'
                  }}
                >
                  {i % 4 === 0 ? <Star className="w-3 h-3 text-gaming-orange" /> :
                   i % 4 === 1 ? <Sparkles className="w-3 h-3 text-gaming-purple" /> :
                   i % 4 === 2 ? <Zap className="w-3 h-3 text-gaming-cyan" /> :
                   <Trophy className="w-3 h-3 text-gaming-green" />}
                </div>
              ))}
            </div>
          )}
          
          {/* Main content */}
          <div className="relative z-10 space-y-4">
            <div className={`transition-all duration-500 ${
              stage >= 2 ? 'scale-110' : 'scale-100'
            }`}>
              <Trophy className="w-16 h-16 mx-auto text-gaming-orange mb-4" />
            </div>
            
            <h2 className="text-3xl font-gaming font-bold gradient-primary bg-clip-text text-transparent">
              LEVEL UP!
            </h2>
            
            <div className={`transition-all duration-500 delay-300 ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <Badge variant="outline" className="text-2xl px-6 py-2 border-primary text-primary">
                Level {newLevel}
              </Badge>
            </div>
            
            <div className={`space-y-2 transition-all duration-500 delay-500 ${
              stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-lg font-semibold text-gaming-green">
                {getLevelMessage(newLevel)}
              </p>
              
              <p className="text-sm text-muted-foreground">
                {getLevelReward(newLevel)}
              </p>
            </div>
            
            {/* XP bonus animation */}
            <div className={`transition-all duration-500 delay-700 ${
              stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}>
              <div className="flex items-center justify-center gap-2 text-gaming-cyan">
                <Zap className="w-5 h-5" />
                <span className="font-bold">+{newLevel * 10} Bonus XP!</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};