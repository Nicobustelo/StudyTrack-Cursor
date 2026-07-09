import { Check, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  label?: string;
  variant?: "default" | "locked";
}

export function PremiumBadge({
  className,
  label = "Premium",
  variant = "default",
}: PremiumBadgeProps) {
  return (
    <Badge
      variant={variant === "locked" ? "outline" : "secondary"}
      className={cn(
        "gap-1 font-medium",
        variant === "default" &&
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      {variant === "locked" ? (
        <Crown className="size-3 opacity-70" />
      ) : (
        <Check className="size-3" />
      )}
      {label}
    </Badge>
  );
}
