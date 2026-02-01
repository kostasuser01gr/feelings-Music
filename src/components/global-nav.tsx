"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Globe, Users, Settings, Menu, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appName } from "@/lib/app-config";

const nav = [
  { href: "/sanctuary", label: "Sanctuary", icon: Home },
  { href: "/meditation", label: "Meditation", icon: Moon },
  { href: "/studio", label: "Studio", icon: Music },
  { href: "/cosmos", label: "Cosmos", icon: Globe },
  { href: "/bands", label: "Bands", icon: Users },
];

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-[var(--foreground)] no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2 rounded"
          aria-label={`${appName} home`}
        >
          <span className="text-amber-400">{appName}</span>
        </Link>
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const isStudio = href === "/studio" && pathname.startsWith("/studio");
            const active =
              href === pathname ||
              (href !== "/studio" && pathname.startsWith(href + "/")) ||
              isStudio;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--muted)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
