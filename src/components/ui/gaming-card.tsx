import * as React from "react";
import { cn } from "@/lib/utils";

interface GamingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "neon" | "cyber" | "holographic";
  glow?: boolean;
  animated?: boolean;
}

export const GamingCard = React.forwardRef<HTMLDivElement, GamingCardProps>(
  ({ className, variant = "default", glow = false, animated = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "gaming-card",
          {
            "glow-primary": glow && variant === "default",
            "glow-cyber": glow && variant === "cyber", 
            "glow-holographic": glow && variant === "holographic",
            "border-holographic": variant === "holographic",
            "hover-glow": animated && variant === "default",
            "hover-cyber": animated && variant === "cyber",
            "hover-holographic": animated && variant === "holographic",
            "gradient-cyber bg-gradient-cyber": variant === "cyber",
            "gradient-holographic bg-gradient-holographic": variant === "holographic",
          },
          className
        )}
        {...props}
      />
    );
  }
);

GamingCard.displayName = "GamingCard";