import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Sparkles, Lock } from "lucide-react";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  comingSoon?: boolean;
  color?: string;
}

export const FeaturePlaceholder = ({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  comingSoon = false,
  color = "primary" 
}: FeaturePlaceholderProps) => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 mx-auto rounded-2xl gradient-${color === 'primary' ? 'primary' : 'accent'} p-1 glow-${color === 'primary' ? 'primary' : 'accent'} mb-4`}>
          <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
        
        {comingSoon && (
          <Badge variant="outline" className="mt-2 border-gaming-orange text-gaming-orange">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
        )}
      </div>

      {/* Feature Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          What's Coming
        </h3>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Action */}
      <div className="text-center">
        {comingSoon ? (
          <Button variant="outline" disabled className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Feature In Development
          </Button>
        ) : (
          <Button variant="gaming" className="w-full">
            Get Started
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">
          Part of the Vyral ecosystem for teen growth
        </p>
      </div>
    </div>
  );
};