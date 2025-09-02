import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useStats, levelToXpRequired, formatNumber } from '@/contexts/StatsContext';
import { Coins, Gem, Plus, X, Settings, Trophy, Zap, Heart, Brain, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatsDockProps {
  className?: string;
}

export const StatsDock: React.FC<StatsDockProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { stats, gainXP, addCoins, buyUpgrade, prestige, updateSettings, calculateTimeToNext, canPrestige, calculatePrestigeShards } = useStats();
  const { toast } = useToast();
  const dockRef = useRef<HTMLDivElement>(null);

  // Calculate progress to next level
  const currentLevelXP = stats.level > 1 ? levelToXpRequired(stats.level, stats.settings.constants) : 0;
  const nextLevelXP = levelToXpRequired(stats.level + 1, stats.settings.constants);
  const progressPercent = Math.min(100, ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  const timeToNext = calculateTimeToNext();

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Handle swipe down to close
  const handleTouchStart = useRef<{ y: number; time: number } | null>(null);
  
  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!handleTouchStart.current) return;
    
    const deltaY = e.changedTouches[0].clientY - handleTouchStart.current.y;
    const deltaTime = Date.now() - handleTouchStart.current.time;
    
    // Swipe down gesture: positive deltaY, quick motion
    if (deltaY > 50 && deltaTime < 300) {
      setIsExpanded(false);
    }
    
    handleTouchStart.current = null;
  };

  const handleUpgradeBuy = (track: string, mode: 'buy1' | 'buy10' | 'buyMax') => {
    const before = { ...stats };
    buyUpgrade(track, mode);
    
    // Show toast for successful purchase
    toast({
      title: "Upgrade Purchased!",
      description: `${track} upgraded successfully!`,
    });
  };

  const handlePrestige = () => {
    if (!canPrestige()) return;
    
    const shardsGained = calculatePrestigeShards();
    prestige();
    
    toast({
      title: "🌟 Prestige Complete!",
      description: `Gained ${shardsGained} shards! Your journey begins anew.`,
    });
  };

  // Dev sandbox for testing
  const activateSandbox = () => {
    let count = 0;
    const interval = setInterval(() => {
      addCoins(10000);
      gainXP(500);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        toast({
          title: "Sandbox Complete",
          description: "Added 100K VCoins and 5K XP",
        });
      }
    }, 1000);
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div 
        ref={dockRef}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${className}`}
        style={{ paddingBottom: isExpanded ? '0' : '80px' }} // Account for navigation
      >
        {/* Compact Dock */}
        <div 
          className={`bg-card/95 backdrop-blur-lg border-t border-border h-14 flex items-center px-4 cursor-pointer transition-opacity ${
            isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={() => setIsExpanded(true)}
        >
          {/* Level Badge */}
          <div className="relative w-7 h-7 mr-3">
            <div className="absolute inset-0 rounded-full bg-primary/20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{stats.level}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="flex-1 mx-3">
            <Progress value={progressPercent} className="h-2 mb-1" />
            <p className="text-xs text-muted-foreground">
              Next in {timeToNext}m
            </p>
          </div>

          {/* Wallet Pill */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium">{formatNumber(stats.vcoins)}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Gem className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium">{formatNumber(stats.shards)}</span>
            </div>
            <Button size="sm" variant="ghost" className="w-6 h-6 p-0 ml-1">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expanded Drawer */}
        <div 
          className={`bg-card border-t border-border transition-all duration-300 ${
            isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ height: isExpanded ? '65vh' : '0' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-gaming font-bold gradient-primary bg-clip-text text-transparent">
                Stats Dashboard
              </h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Big Level Card */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-primary/20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="2"
                      />
                      <circle
                        cx="16" 
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={`${2 * Math.PI * 14 * (1 - progressPercent / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">Lv {stats.level}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Level {stats.level} Vybester</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatNumber(stats.totalXP)} / {formatNumber(nextLevelXP)} XP
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <Trophy className="w-3 h-3 mr-1" />
                      {stats.streakDays} day streak
                    </Badge>
                    {stats.level >= 25 && (
                      <Badge variant="outline" className="text-gaming-green">
                        Rising Star
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Upgrades Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* LyfeTree Upgrade */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-gaming-green" />
                  <h4 className="font-semibold text-sm">LyfeTree</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Level {stats.lyfeTreeLevel} • +{(stats.xpMult * 100 - 100).toFixed(1)}% XP
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('LyfeTree', 'buy1')}>
                    Buy 1
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('LyfeTree', 'buyMax')}>
                    Max
                  </Button>
                </div>
              </Card>

              {/* XP Booster */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-semibold text-sm">XP Booster</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Level {stats.xpBoosterLevel}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('XPBooster', 'buy1')}>
                    Buy 1
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('XPBooster', 'buyMax')}>
                    Max
                  </Button>
                </div>
              </Card>

              {/* Focus Regen */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold text-sm">Focus Regen</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Level {stats.focusRegenLevel} • +{(stats.regenMult * 100 - 100).toFixed(1)}% Regen
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('FocusRegen', 'buy1')}>
                    Buy 1
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('FocusRegen', 'buyMax')}>
                    Max
                  </Button>
                </div>
              </Card>

              {/* Study Crit */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold text-sm">Study Crit</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Level {stats.studyCritLevel} • +{(stats.vcoinMult * 100 - 100).toFixed(1)}% VCoins
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('StudyCrit', 'buy1')}>
                    Buy 1
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2 py-1 h-7"
                    onClick={() => handleUpgradeBuy('StudyCrit', 'buyMax')}>
                    Max
                  </Button>
                </div>
              </Card>
            </div>

            {/* Stats Row */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Stats Overview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">HP</p>
                  <p className="font-medium">{formatNumber(stats.hp)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stamina Regen</p>
                  <p className="font-medium">{formatNumber(stats.staminaRegen)}/min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">XP Rate</p>
                  <p className="font-medium">{formatNumber(stats.xpRatePerMinute)}/min</p>
                </div>
              </div>
            </Card>

            {/* Prestige */}
            {canPrestige() && (
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-300">Prestige Available!</h4>
                    <p className="text-sm text-muted-foreground">
                      Gain {calculatePrestigeShards()} shards and restart your journey
                    </p>
                  </div>
                  <Button variant="gaming" onClick={handlePrestige}>
                    Prestige
                  </Button>
                </div>
              </Card>
            )}

            {/* Dev Tools */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Dev Tools</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={activateSandbox}>
                    Sandbox Mode
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => gainXP(1000)}>
                    +1K XP
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addCoins(5000)}>
                    +5K Coins
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};