import { Button } from "@/components/ui/button";
import shopLogo from "@/assets/shop-logo.png";
import boardLogo from "@/assets/board-logo.png";
import treeLogo from "@/assets/tree-logo.png";
import moneyMovesLogo from "@/assets/money-moves-logo.png";
import skrybeLogo from "@/assets/skrybe-logo.png";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: 'vshop', logo: shopLogo, label: 'Shop' },
    { id: 'lyfeboard', logo: boardLogo, label: 'Board' },
    { id: 'lyfetree', logo: treeLogo, label: 'Tree' },
    { id: 'moneymoves', logo: moneyMovesLogo, label: '$Moves' },
    { id: 'skrybe', logo: skrybeLogo, label: 'Skrybe' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-2 py-3 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "gaming" : "ghost"}
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={`flex-col gap-1 h-auto py-2 px-2 min-w-0 ${
              activeTab === item.id 
                ? 'glow-primary' 
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-6 h-6 rounded-md overflow-hidden">
              <img 
                src={item.logo} 
                alt={item.label}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};