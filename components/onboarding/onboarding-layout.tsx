"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ProgressBar } from "./progress-bar";

type OnboardingLayoutProps = {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  preview?: React.ReactNode;
};

export function OnboardingLayout({
  step,
  totalSteps,
  onBack,
  showBack = true,
  children,
  footer,
  preview,
}: OnboardingLayoutProps) {
  return (
    <MobileShell
      desktopWidth="compact"
      contentClassName="px-5 pt-4"
      header={
        <div className="sticky top-0 z-20 border-b border-border bg-background/100 px-5 pb-3 pt-4 backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-md items-center gap-3 lg:max-w-xl">
            {showBack && step > 1 && step < 15 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onBack}
                aria-label="Volver al paso anterior"
              >
                <ChevronLeft className="size-5" />
              </Button>
            ) : (
              <div className="size-9 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <ProgressBar step={step} totalSteps={totalSteps} />
            </div>
          </div>
        </div>
      }
    >
      {preview ? (
        <div className="mb-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          {preview}
        </div>
      ) : null}

      <div
        key={step}
        className={cn(
          "flex flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-300 motion-reduce:animate-none",
        )}
      >
        {children}
      </div>

      {footer ? (
        <div className="sticky bottom-0 -mx-5 mt-auto border-t border-border bg-background px-5 py-4">
          {footer}
        </div>
      ) : null}
    </MobileShell>
  );
}
