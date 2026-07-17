"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ANALYTICS_EVENTS,
  captureClientEvent,
} from "@/lib/analytics/client";
import {
  PAYWALL_BENEFITS,
  PAYWALL_COPY,
  PLAN_TYPES,
  PLANS,
} from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

import { PricingCard } from "./pricing-card";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  location?: string;
  className?: string;
}

export function PaywallModal({
  open,
  onOpenChange,
  examId,
  location = "paywall_modal",
  className,
}: PaywallModalProps) {
  useEffect(() => {
    if (!open) return;

    captureClientEvent(ANALYTICS_EVENTS.PAYWALL_SEEN, {
      exam_id: examId,
      location,
      is_premium: false,
    });
  }, [open, examId, location]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-3xl", className)}
        showCloseButton
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl leading-snug">
            {PAYWALL_COPY.title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {PAYWALL_COPY.subtitle}
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-2 sm:grid-cols-2">
          {PAYWALL_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_TYPES.map((planType) => (
            <PricingCard
              key={planType}
              plan={PLANS[planType]}
              examId={examId}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          StudyTrack te ayuda a organizar y practicar tu estudio, pero no
          garantiza una nota específica.
        </p>
      </DialogContent>
    </Dialog>
  );
}
