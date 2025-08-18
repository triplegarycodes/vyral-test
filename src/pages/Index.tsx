import { useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { LyfeBoard } from "@/components/LyfeBoard";
import { LyfeTree } from "@/components/LyfeTree";
import { VybeZone } from "@/components/VybeZone";
import { VybeStryke } from "@/components/VybeStryke";
import { VShop } from "@/components/VShop";
import { MoneyHub } from "@/components/MoneyHub";
import { VybeLink } from "@/components/VybeLink";
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
        return <VybeZone />;
      case 'vybestryke':
        return <VybeStryke />;
      case 'vshop':
        return <VShop />;
      case 'money':
        return <MoneyHub />;
      case 'vybelink':
        return <VybeLink />;
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
