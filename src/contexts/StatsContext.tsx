import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Progression math constants
export const PROGRESSION_CONSTANTS = {
  base_xp: 50,
  growth_xp: 1.12,
  base_cost: 100,
  growth_cost: 1.15,
  base_bonus: 0.10,
  decay: 0.97,
  hp_base: 100,
  regen_base: 10,
} as const;

export interface PlayerStats {
  level: number;
  totalXP: number;
  xpRatePerMinute: number;
  streakDays: number;
  vcoins: number;
  shards: number;
  hp: number;
  staminaRegen: number;
  xpMult: number;
  vcoinMult: number;
  regenMult: number;
  lyfeTreeLevel: number;
  xpBoosterLevel: number;
  focusRegenLevel: number;
  studyCritLevel: number;
}

export interface StatsEvent {
  type: 'xp.gain' | 'coins.add' | 'level.up' | 'upgrade.buy' | 'prestige.complete' | 'streak.tick';
  payload: any;
}

interface StatsState extends PlayerStats {
  settings: {
    focusMode: boolean;
    constants: typeof PROGRESSION_CONSTANTS;
  };
}

type StatsAction = 
  | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
  | { type: 'XP_GAIN'; payload: { amount: number } }
  | { type: 'COINS_ADD'; payload: { amount: number } }
  | { type: 'LEVEL_UP'; payload: { newLevel: number } }
  | { type: 'UPGRADE_BUY'; payload: { track: string; levels: number; cost: number } }
  | { type: 'PRESTIGE_COMPLETE'; payload: { shardsGained: number } }
  | { type: 'STREAK_TICK' }
  | { type: 'SETTINGS_UPDATE'; payload: Partial<StatsState['settings']> }
  | { type: 'LOAD_STATS'; payload: StatsState };

// Progression math functions
export const levelToXpRequired = (level: number, constants = PROGRESSION_CONSTANTS): number => {
  return Math.round(constants.base_xp * Math.pow(constants.growth_xp, level - 1));
};

export const upgradeCost = (currentLevel: number, constants = PROGRESSION_CONSTANTS): number => {
  return Math.round(constants.base_cost * Math.pow(constants.growth_cost, currentLevel));
};

export const upgradeBonus = (level: number, constants = PROGRESSION_CONSTANTS): number => {
  return constants.base_bonus * (1 - Math.pow(constants.decay, level));
};

export const calculateHP = (totalXP: number, constants = PROGRESSION_CONSTANTS): number => {
  return Math.round(constants.hp_base * Math.log(totalXP + 10));
};

export const calculateStaminaRegen = (level: number, constants = PROGRESSION_CONSTANTS): number => {
  return Math.round(constants.regen_base * Math.sqrt(level));
};

export const calculateTimeToNext = (currentXP: number, level: number, xpRate: number, constants = PROGRESSION_CONSTANTS): number => {
  const xpNeeded = levelToXpRequired(level + 1, constants) - currentXP;
  return Math.ceil(xpNeeded / xpRate);
};

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
  if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(1) + 'Qa';
  return (num / 1000000000000000000).toFixed(1) + 'Qi';
};

const initialState: StatsState = {
  level: 1,
  totalXP: 0,
  xpRatePerMinute: 30,
  streakDays: 1,
  vcoins: 1000,
  shards: 0,
  hp: 100,
  staminaRegen: 10,
  xpMult: 1,
  vcoinMult: 1,
  regenMult: 1,
  lyfeTreeLevel: 0,
  xpBoosterLevel: 0,
  focusRegenLevel: 0,
  studyCritLevel: 0,
  settings: {
    focusMode: false,
    constants: PROGRESSION_CONSTANTS,
  },
};

function statsReducer(state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case 'LOAD_STATS':
      return action.payload;
      
    case 'UPDATE_STATS':
      return { ...state, ...action.payload };
      
    case 'XP_GAIN': {
      const newTotalXP = state.totalXP + action.payload.amount;
      const currentLevelXP = levelToXpRequired(state.level, state.settings.constants);
      const nextLevelXP = levelToXpRequired(state.level + 1, state.settings.constants);
      
      let newLevel = state.level;
      let leveledUp = false;
      
      // Check for level ups
      while (newTotalXP >= levelToXpRequired(newLevel + 1, state.settings.constants)) {
        newLevel++;
        leveledUp = true;
      }
      
      const newHP = calculateHP(newTotalXP, state.settings.constants);
      const newStaminaRegen = calculateStaminaRegen(newLevel, state.settings.constants);
      
      return {
        ...state,
        totalXP: newTotalXP,
        level: newLevel,
        hp: newHP,
        staminaRegen: newStaminaRegen,
      };
    }
    
    case 'COINS_ADD':
      return {
        ...state,
        vcoins: state.vcoins + action.payload.amount,
      };
      
    case 'LEVEL_UP':
      return {
        ...state,
        level: action.payload.newLevel,
        hp: calculateHP(state.totalXP, state.settings.constants),
        staminaRegen: calculateStaminaRegen(action.payload.newLevel, state.settings.constants),
      };
      
    case 'UPGRADE_BUY': {
      const { track, levels, cost } = action.payload;
      if (state.vcoins < cost) return state;
      
      const newState = { ...state, vcoins: state.vcoins - cost };
      
      switch (track) {
        case 'LyfeTree':
          newState.lyfeTreeLevel += levels;
          newState.xpMult = 1 + upgradeBonus(newState.lyfeTreeLevel, state.settings.constants);
          break;
        case 'XPBooster':
          newState.xpBoosterLevel += levels;
          newState.xpMult *= 1 + upgradeBonus(newState.xpBoosterLevel, state.settings.constants);
          break;
        case 'FocusRegen':
          newState.focusRegenLevel += levels;
          newState.regenMult = 1 + upgradeBonus(newState.focusRegenLevel, state.settings.constants);
          break;
        case 'StudyCrit':
          newState.studyCritLevel += levels;
          newState.vcoinMult = 1 + upgradeBonus(newState.studyCritLevel, state.settings.constants);
          break;
      }
      
      return newState;
    }
    
    case 'PRESTIGE_COMPLETE': {
      const { shardsGained } = action.payload;
      return {
        ...initialState,
        shards: state.shards + shardsGained,
        settings: state.settings,
      };
    }
    
    case 'STREAK_TICK':
      return {
        ...state,
        streakDays: state.streakDays + 1,
        xpMult: state.xpMult * 1.02, // +2% XP for streak
      };
      
    case 'SETTINGS_UPDATE':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      
    default:
      return state;
  }
}

interface StatsContextValue {
  stats: StatsState;
  dispatch: (event: StatsEvent) => void;
  gainXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  buyUpgrade: (track: string, mode: 'buy1' | 'buy10' | 'buyMax') => void;
  prestige: () => void;
  updateSettings: (settings: Partial<StatsState['settings']>) => void;
  formatNumber: (num: number) => string;
  calculateTimeToNext: () => number;
  canPrestige: () => boolean;
  calculatePrestigeShards: () => number;
}

const StatsContext = createContext<StatsContextValue | undefined>(undefined);

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
};

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, dispatch] = useReducer(statsReducer, initialState);
  const { user } = useAuth();

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('vyral-stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        dispatch({ type: 'LOAD_STATS', payload: parsed });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vyral-stats', JSON.stringify(stats));
  }, [stats]);

  // Sync with Supabase periodically (commented out until user_stats table exists)
  useEffect(() => {
    if (!user) return;
    
    const syncStats = async () => {
      try {
        // const { error } = await supabase
        //   .from('user_stats')
        //   .upsert({
        //     user_id: user.id,
        //     level: stats.level,
        //     total_xp: stats.totalXP,
        //     vcoins: stats.vcoins,
        //     shards: stats.shards,
        //     streak_days: stats.streakDays,
        //     updated_at: new Date().toISOString(),
        //   });
        
        // if (error) console.error('Error syncing stats:', error);
      } catch (error) {
        console.error('Error syncing stats:', error);
      }
    };

    const interval = setInterval(syncStats, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, [user, stats]);

  const eventDispatch = useCallback((event: StatsEvent) => {
    switch (event.type) {
      case 'xp.gain':
        dispatch({ type: 'XP_GAIN', payload: event.payload });
        break;
      case 'coins.add':
        dispatch({ type: 'COINS_ADD', payload: event.payload });
        break;
      case 'level.up':
        dispatch({ type: 'LEVEL_UP', payload: event.payload });
        break;
      case 'upgrade.buy':
        dispatch({ type: 'UPGRADE_BUY', payload: event.payload });
        break;
      case 'prestige.complete':
        dispatch({ type: 'PRESTIGE_COMPLETE', payload: event.payload });
        break;
      case 'streak.tick':
        dispatch({ type: 'STREAK_TICK' });
        break;
    }
  }, []);

  const gainXP = useCallback((amount: number) => {
    const bonusAmount = Math.round(amount * stats.xpMult);
    eventDispatch({ type: 'xp.gain', payload: { amount: bonusAmount } });
  }, [stats.xpMult, eventDispatch]);

  const addCoins = useCallback((amount: number) => {
    const bonusAmount = Math.round(amount * stats.vcoinMult);
    eventDispatch({ type: 'coins.add', payload: { amount: bonusAmount } });
  }, [stats.vcoinMult, eventDispatch]);

  const buyUpgrade = useCallback((track: string, mode: 'buy1' | 'buy10' | 'buyMax') => {
    let levels = 1;
    let cost = 0;
    
    const getCurrentLevel = () => {
      switch (track) {
        case 'LyfeTree': return stats.lyfeTreeLevel;
        case 'XPBooster': return stats.xpBoosterLevel;
        case 'FocusRegen': return stats.focusRegenLevel;
        case 'StudyCrit': return stats.studyCritLevel;
        default: return 0;
      }
    };

    const currentLevel = getCurrentLevel();

    if (mode === 'buy10') {
      levels = 10;
      // Calculate geometric series cost for 10 levels
      const baseCost = upgradeCost(currentLevel, stats.settings.constants);
      const ratio = stats.settings.constants.growth_cost;
      cost = Math.round(baseCost * (Math.pow(ratio, 10) - 1) / (ratio - 1));
    } else if (mode === 'buyMax') {
      // Calculate max levels we can afford
      let totalCost = 0;
      let levelsToBuy = 0;
      
      while (totalCost + upgradeCost(currentLevel + levelsToBuy, stats.settings.constants) <= stats.vcoins) {
        totalCost += upgradeCost(currentLevel + levelsToBuy, stats.settings.constants);
        levelsToBuy++;
        if (levelsToBuy > 1000) break; // Safety limit
      }
      
      levels = levelsToBuy;
      cost = totalCost;
    } else {
      cost = upgradeCost(currentLevel, stats.settings.constants);
    }

    if (cost > 0 && levels > 0) {
      eventDispatch({ type: 'upgrade.buy', payload: { track, levels, cost } });
    }
  }, [stats, eventDispatch]);

  const canPrestige = useCallback(() => {
    return stats.level >= 100;
  }, [stats.level]);

  const calculatePrestigeShards = useCallback(() => {
    return Math.floor(Math.pow(stats.level, 0.75));
  }, [stats.level]);

  const prestige = useCallback(() => {
    if (!canPrestige()) return;
    
    const shardsGained = calculatePrestigeShards();
    eventDispatch({ type: 'prestige.complete', payload: { shardsGained } });
  }, [canPrestige, calculatePrestigeShards, eventDispatch]);

  const updateSettings = useCallback((newSettings: Partial<StatsState['settings']>) => {
    dispatch({ type: 'SETTINGS_UPDATE', payload: newSettings });
  }, []);

  const calculateTimeToNextLevel = useCallback(() => {
    return calculateTimeToNext(stats.totalXP, stats.level, stats.xpRatePerMinute, stats.settings.constants);
  }, [stats.totalXP, stats.level, stats.xpRatePerMinute, stats.settings.constants]);

  const value: StatsContextValue = {
    stats,
    dispatch: eventDispatch,
    gainXP,
    addCoins,
    buyUpgrade,
    prestige,
    updateSettings,
    formatNumber,
    calculateTimeToNext: calculateTimeToNextLevel,
    canPrestige,
    calculatePrestigeShards,
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};