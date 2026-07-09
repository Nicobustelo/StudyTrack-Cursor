"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { StickyHeader } from "@/components/layout/sticky-header";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface LessonHeaderProps {
  backUrl: string;
  progressPercent: number;
  title?: string;
}

export function LessonHeader({ backUrl, progressPercent, title }: LessonHeaderProps) {
  return (
    <StickyHeader>
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href={backUrl}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Salir"
        >
          <X className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="truncate text-sm font-semibold text-ink">{title}</p>
          ) : null}
          <Progress value={progressPercent} className="mt-1 w-full gap-0">
            <ProgressTrack className="h-2">
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
        </div>
      </div>
    </StickyHeader>
  );
}
