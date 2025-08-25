import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { LyfeBoard } from "@/components/LyfeBoard";
import { LyfeTree } from "@/components/LyfeTree";
import { VybeZone } from "@/components/VybeZone";
import { VybeStryke } from "@/components/VybeStryke";
import { VShop } from "@/components/VShop";
import { MoneyHub } from "@/components/MoneyHub";
import { VybeLink } from "@/components/VybeLink";
import { Navigation } from "@/components/Navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CustomizationWidget } from "@/components/CustomizationWidget";

const Index = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('lyfeboard');

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary p-1">
            <img 
              src="/lovable-uploads/049bd227-a8a2-4760-8bd6-2cb2bdf8d48d.png" 
              alt="Vyral Logo" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not signed in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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

      {/* Customization Widget - Persistent across all tabs */}
      <CustomizationWidget />

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
