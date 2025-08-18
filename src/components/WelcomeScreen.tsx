import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen = ({ onEnter }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-3xl gradient-primary p-1 glow-primary pulse-glow">
            <img 
              src="/lovable-uploads/049bd227-a8a2-4760-8bd6-2cb2bdf8d48d.png" 
              alt="Vyral Logo" 
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl font-gaming font-bold mb-4 gradient-primary bg-clip-text text-transparent">
          VYRAL
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-muted-foreground mb-2">Level Up Your Life</p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The ultimate teen hub for gamifying self-improvement, building habits, and connecting with your community.
        </p>
        
        {/* Features highlight */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Track goals & earn XP</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground">
            <Sparkles className="w-4 h-4 text-gaming-green" />
            <span>Grow your personal LyfeTree</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground">
            <Sparkles className="w-4 h-4 text-gaming-purple" />
            <span>Connect safely with teens</span>
          </div>
        </div>
        
        {/* Enter button */}
        <Button 
          variant="gaming" 
          size="lg" 
          onClick={onEnter}
          className="w-full group"
        >
          Enter Vyral
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Safe • Positive • Gaming-Inspired
        </p>
      </div>
    </div>
  );
};