"use client";

import { CalendarDays, ClipboardList, Ellipsis, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CORE_ITEMS = [
  { href: "/", label: "首页", Icon: Home },
  { href: "/schedule", label: "课表", Icon: CalendarDays },
  { href: "/assignments", label: "作业", Icon: ClipboardList },
  { href: "/ai", label: "AI", Icon: MessageCircle },
  { href: "/more", label: "更多", Icon: Ellipsis },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tabClass = (active: boolean) =>
    `relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
      active ? "text-primary" : "text-muted-foreground/75 active:text-muted-foreground"
    }`;

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-border/50 bg-background/80 backdrop-blur-2xl pb-safe dark:dark-panel dark:rounded-t-[24px] dark:mx-2 dark:mb-2"
      aria-label="底部导航"
    >
      <div className="grid h-16 grid-cols-5">
        {CORE_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={tabClass(active)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <>
                  <span className="absolute top-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-primary/25 dark:bg-accent/35" aria-hidden="true" />
                  <span className="absolute inset-x-3 inset-y-2 rounded-2xl bg-primary/[0.06] dark:bg-primary/[0.06]" aria-hidden="true" />
                </>
              )}
              <item.Icon
                className={`relative z-[1] h-5 w-5 transition-all duration-300 ${
                  active ? "scale-[1.15] drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.28)]" : ""
                }`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span className={`relative z-[1] text-[11px] leading-none tracking-wide ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
