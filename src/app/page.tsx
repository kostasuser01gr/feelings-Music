import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
        <span className="text-amber-400">Aurelia</span>
        <br />
        Feelings &amp; Music
      </h1>
      <p className="max-w-md text-[var(--muted-foreground)]">
        Create confessional albums, make music with AI and code, and watch songs
        launch into the cosmos as golden auras.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild>
          <Link href="/sanctuary">Enter Sanctuary</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cosmos">Explore Cosmos</Link>
        </Button>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>{" "}
        Command palette ·{" "}
        <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono">
          ⌘1
        </kbd>{" "}
        Sanctuary ·{" "}
        <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono">
          ⌘2
        </kbd>{" "}
        Studio ·{" "}
        <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono">
          ⌘3
        </kbd>{" "}
        Cosmos
      </p>
    </div>
  );
}
