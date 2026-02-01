import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Studio</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Create songs with AI, loops, or code. Export and publish to the
          Cosmos.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/studio/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </div>
      <section aria-label="Projects">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
          Your projects
        </h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-[var(--muted-foreground)]">
          No projects yet. Start a new one.
        </div>
      </section>
    </div>
  );
}
