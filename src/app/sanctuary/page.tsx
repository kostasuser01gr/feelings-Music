"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Music } from "lucide-react";
import { ConfessionEditor } from "@/components/sanctuary/confession-editor";
import { ConfessionCard } from "@/components/sanctuary/confession-card";
import { useConfessions, useCreateConfession } from "@/hooks/use-confessions";
import { useAuthStore } from "@/stores/auth-store";

export default function SanctuaryPage() {
  const [editorOpen, setEditorOpen] = useState(false);
  const { data: confessions = [], isLoading } = useConfessions();
  const create = useCreateConfession();
  const user = useAuthStore((s) => s.user);

  const handleCreateConfession = async (data: Parameters<typeof create.mutateAsync>[0]) => {
    await create.mutateAsync(data);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Sanctuary</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Create confessional album pages. Share feelings. Connect through
          resonance.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {user ? (
          <Button onClick={() => setEditorOpen(true)} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            New confession
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sign in to create confession
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/studio/new" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Create song
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/meditation" className="flex items-center gap-2">
            Center with meditation
          </Link>
        </Button>
      </div>

      {user && (
        <ConfessionEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSubmit={handleCreateConfession}
        />
      )}

      <section aria-label="Resonance" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
          Resonance
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          People and songs that match your mood — coming soon.
        </p>
      </section>

      <section aria-label="Feed">
        <h2 className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
          Recent
        </h2>
        {isLoading ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-[var(--muted-foreground)]">
            Loading…
          </div>
        ) : confessions.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-[var(--muted-foreground)]">
            No confessions yet. Create one to get started.
          </div>
        ) : (
          <ul className="space-y-4">
            {confessions.map((c) => (
              <li key={c.id}>
                <ConfessionCard confession={c} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
