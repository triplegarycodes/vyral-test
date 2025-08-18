import { useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { LyfeBoard } from "@/components/LyfeBoard";
import { LyfeTree } from "@/components/LyfeTree";
import { FeaturePlaceholder } from "@/components/FeaturePlaceholder";
import { Navigation } from "@/components/Navigation";
import { 
  Users, 
  Zap, 
  ShoppingBag, 
  DollarSign, 
  Heart 
} from "lucide-react";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('lyfeboard');

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'lyfeboard':
        return <LyfeBoard />;
      case 'lyfetree':
        return <LyfeTree />;
      case 'vybezone':
        return (
          <FeaturePlaceholder
            title="VybeZone"
            description="Safe, moderated community groups for positive vibes"
            icon={Users}
            features={[
              "Join study groups and hobby communities",
              "Anonymous vent mode with AI support",
              "Positive content filtering & moderation",
              "Share achievements and celebrate wins",
              "Weekly community challenges"
            ]}
            comingSoon={true}
          />
        );
      case 'vybestryke':
        return (
          <FeaturePlaceholder
            title="VybeStryke"
            description="Daily and weekly challenges to level up your life"
            icon={Zap}
            features={[
              "Daily fitness & wellness quests",
              "Academic achievement challenges", 
              "Creative skill-building tasks",
              "Earn XP and unlock badges",
              "Boost your LyfeTree growth"
            ]}
            color="accent"
          />
        );
      case 'vshop':
        return (
          <FeaturePlaceholder
            title="V-Shop"
            description="Spend your hard-earned XP on cool customizations"
            icon={ShoppingBag}
            features={[
              "Unlock rare LyfeTree styles & animations",
              "Exclusive badges and achievements",
              "Custom dashboard themes",
              "Seasonal cosmetic upgrades",
              "Premium trait unlocks"
            ]}
            comingSoon={true}
          />
        );
      case 'money':
        return (
          <FeaturePlaceholder
            title="Money Moves Hub"
            description="Master your finances and discover opportunities"
            icon={DollarSign}
            features={[
              "Budget tracking for teens",
              "Scholarship finder & alerts",
              "Savings goal gamification",
              "Financial literacy mini-courses",
              "Part-time job opportunities"
            ]}
            comingSoon={true}
          />
        );
      case 'vybelink':
        return (
          <FeaturePlaceholder
            title="VybeLink"
            description="Make meaningful connections safely"
            icon={Heart}
            features={[
              "AI-powered personality matching",
              "Safe networking for teens",
              "Study buddy finder",
              "Interest-based friend suggestions",
              "Built-in safety & moderation"
            ]}
            comingSoon={true}
          />
        );
      default:
        return <LyfeBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {renderContent()}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
