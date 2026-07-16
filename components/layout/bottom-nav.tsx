"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Route,
  RotateCcw,
  User,
  type LucideIcon,
} from "lucide-react";

import type {
  BottomNavIconKey,
  BottomNavItem,
} from "@/components/layout/exam-bottom-nav-items";
import { cn } from "@/lib/utils";

export type { BottomNavItem } from "@/components/layout/exam-bottom-nav-items";

const NAV_ICONS: Record<BottomNavIconKey, LucideIcon> = {
  track: Route,
  review: RotateCcw,
  mock_exams: FileText,
  progress: BarChart3,
  profile: User,
};

type BottomNavProps = {
  items: BottomNavItem[];
  className?: string;
};

/**
 * Navegación inferior fija y opaca en móvil; en escritorio se convierte en
 * una barra lateral sticky. MobileShell reserva el espacio necesario.
 */
export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      data-slot="bottom-nav"
      aria-label="Navegación principal"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:sticky lg:inset-auto lg:top-6 lg:z-30 lg:mt-6 lg:h-fit lg:self-start lg:rounded-2xl lg:border lg:p-2 lg:pb-2 lg:shadow-card",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-md items-stretch px-1 lg:h-auto lg:max-w-none lg:flex-col lg:gap-1 lg:px-0">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = NAV_ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition-colors lg:min-h-12 lg:w-full lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm",
                active ? "text-brand-dark" : "text-ink-muted hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors lg:size-9 lg:shrink-0",
                  active && "bg-brand-light",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
