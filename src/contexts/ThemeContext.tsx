import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gamingCyan: string;
  gamingPurple: string;
  gamingGreen: string;
  gamingOrange: string;
}

interface ThemeSettings {
  colors: ThemeColors;
  primaryFont: string;
  gamingFont: string;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateFonts: (primaryFont: string, gamingFont: string) => void;
  resetToDefault: () => void;
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: '212 100% 50%',
    secondary: '224 25% 16%',
    accent: '195 100% 60%',
    gamingCyan: '180 100% 50%',
    gamingPurple: '270 100% 70%',
    gamingGreen: '120 100% 50%',
    gamingOrange: '30 100% 60%'
  },
  primaryFont: 'Inter',
  gamingFont: 'Orbitron'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme);

  useEffect(() => {
    // Load saved theme from localStorage
    const saved = localStorage.getItem('vyral-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThemeSettings({ ...defaultTheme, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary', themeSettings.colors.primary);
    root.style.setProperty('--secondary', themeSettings.colors.secondary);
    root.style.setProperty('--accent', themeSettings.colors.accent);
    root.style.setProperty('--gaming-cyan', themeSettings.colors.gamingCyan);
    root.style.setProperty('--gaming-purple', themeSettings.colors.gamingPurple);
    root.style.setProperty('--gaming-green', themeSettings.colors.gamingGreen);
    root.style.setProperty('--gaming-orange', themeSettings.colors.gamingOrange);
    
    // Update gradients with new primary colors
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${themeSettings.colors.accent}), hsl(${themeSettings.colors.primary}))`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, hsl(${themeSettings.colors.gamingCyan}), hsl(${themeSettings.colors.accent}))`);
    
    // Update glow effects
    root.style.setProperty('--glow-primary', `0 0 20px hsl(${themeSettings.colors.primary} / 0.5)`);
    root.style.setProperty('--glow-accent', `0 0 20px hsl(${themeSettings.colors.accent} / 0.5)`);

    // Save to localStorage
    localStorage.setItem('vyral-theme', JSON.stringify(themeSettings));
  }, [themeSettings]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setThemeSettings(prev => ({
      ...prev,
      colors: { ...prev.colors, ...newColors }
    }));
  };

  const updateFonts = (primaryFont: string, gamingFont: string) => {
    setThemeSettings(prev => ({
      ...prev,
      primaryFont,
      gamingFont
    }));
    
    // Update font CSS variables dynamically
    const root = document.documentElement;
    root.style.setProperty('--font-sans', `'${primaryFont}', system-ui, sans-serif`);
    root.style.setProperty('--font-gaming', `'${gamingFont}', monospace`);
  };

  const resetToDefault = () => {
    setThemeSettings(defaultTheme);
    localStorage.removeItem('vyral-theme');
  };

  return (
    <ThemeContext.Provider
      value={{
        themeSettings,
        updateColors,
        updateFonts,
        resetToDefault
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};