import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TreePine, Leaf, Star, Sparkles } from "lucide-react";

export const LyfeTree = () => {
  const treeData = {
    level: 8,
    branches: [
      { name: "Health", level: 3, progress: 75, color: "gaming-green" },
      { name: "Education", level: 4, progress: 60, color: "primary" },
      { name: "Creativity", level: 2, progress: 90, color: "gaming-purple" },
      { name: "Relationships", level: 3, progress: 45, color: "gaming-orange" },
      { name: "Finance", level: 1, progress: 30, color: "accent" }
    ]
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          LyfeTree
        </h1>
        <p className="text-muted-foreground">Watch your life areas grow and flourish</p>
      </div>

      {/* Tree Visualization */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-muted/20"></div>
        
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full gradient-primary p-1 glow-primary mb-4">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <TreePine className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-gaming font-bold text-primary">
              Level {treeData.level} Tree
            </h2>
            <p className="text-sm text-muted-foreground">Growing strong and healthy</p>
          </div>

          {/* Branches */}
          <div className="space-y-4">
            {treeData.branches.map((branch, index) => (
              <div key={branch.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-${branch.color}/20 flex items-center justify-center`}>
                    <Leaf className={`w-4 h-4 text-${branch.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{branch.name}</h3>
                    <p className="text-xs text-muted-foreground">Level {branch.level}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${branch.color} transition-all duration-500`}
                      style={{ width: `${branch.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{branch.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Growth Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <Star className="w-8 h-8 text-gaming-orange mx-auto mb-2" />
          <h3 className="font-semibold text-lg">24</h3>
          <p className="text-xs text-muted-foreground">Achievements</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
          <h3 className="font-semibold text-lg">5.2k</h3>
          <p className="text-xs text-muted-foreground">Growth XP</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="gaming" className="w-full">
          Water Your Tree (+50 XP)
        </Button>
        <Button variant="outline" className="w-full">
          View Growth History
        </Button>
      </div>

      {/* Seasonal Event */}
      <Card className="p-4 bg-gaming-purple/10 border-gaming-purple/30">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-gaming-purple" />
          <div>
            <h3 className="font-semibold text-gaming-purple">Winter Growth Event</h3>
            <p className="text-xs text-muted-foreground">Double XP for Health goals until Jan 31st</p>
          </div>
        </div>
      </Card>
    </div>
  );
};