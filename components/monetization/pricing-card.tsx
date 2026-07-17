import { Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatPriceArs,
  type PlanDefinition,
} from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

import { CheckoutButton } from "./checkout-button";

interface PricingCardProps {
  plan: PlanDefinition;
  examId: string;
  className?: string;
  ctaLabel?: string;
}

export function PricingCard({
  plan,
  examId,
  className,
  ctaLabel,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative h-full",
        plan.highlight && "ring-2 ring-primary shadow-md",
        className,
      )}
    >
      {plan.badge ? (
        <Badge className="absolute top-3 right-3">{plan.badge}</Badge>
      ) : null}

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="font-heading text-3xl font-semibold tracking-tight">
          {formatPriceArs(plan.priceArs)}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {plan.accessSummary}
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            Pago único en Mercado Pago
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <CheckoutButton
          planType={plan.id}
          examId={examId}
          label={ctaLabel ?? plan.checkoutLabel}
          size="default"
        />
      </CardFooter>
    </Card>
  );
}
