import { 
  Home, 
  TreePine, 
  Users, 
  Zap, 
  ShoppingBag, 
  DollarSign, 
  Palette,
  Feather
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: 'lyfeboard', icon: Home, label: 'Board' },
    { id: 'lyfetree', icon: TreePine, label: 'Tree' },
    { id: 'vybezone', icon: Users, label: 'Zone' },
    { id: 'vybestryke', icon: Zap, label: 'Stryke' },
    { id: 'bvyral', icon: Palette, label: 'B-Vyral' },
    { id: 'skrybe', icon: Feather, label: 'Skrybe' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-2 py-3 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.slice(0, 6).map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "gaming" : "ghost"}
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={`flex-col gap-1 h-auto py-2 px-3 min-w-0 ${
              activeTab === item.id 
                ? 'glow-primary' 
                : 'hover:bg-muted/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};