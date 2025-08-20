import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Settings, Crown, Coins } from "lucide-react";

export const UserProfile = () => {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) return null;

  const getXPForLevel = (level: number) => {
    if (level === 1) return 10;
    return Math.floor(10 * Math.pow(1.5, level - 1));
  };

  const currentLevelXP = getXPForLevel(profile.level);
  const nextLevelXP = getXPForLevel(profile.level + 1);
  const progressInLevel = profile.xp - currentLevelXP;
  const progressToNext = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min((progressInLevel / progressToNext) * 100, 100);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-gaming">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-gaming">{profile.display_name || profile.username}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1 text-gaming-orange" />
                  Level {profile.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Coins className="w-3 h-3 mr-1 text-gaming-green" />
                  {profile.vybecoin_balance}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-mono">{profile.xp} / {nextLevelXP}</span>
          </div>
          <Progress value={progressPercentage} className="h-2 xp-bar" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {profile.level}</span>
            <span>Level {profile.level + 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};