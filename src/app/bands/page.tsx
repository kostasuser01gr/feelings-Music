"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useBands, useCreateBand } from "@/hooks/use-bands";
import { useAuthStore } from "@/stores/auth-store";
import { CreateBandDialog } from "@/components/bands/create-band-dialog";

export default function BandsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: bands = [], isLoading } = useBands();
  const create = useCreateBand();
  const user = useAuthStore((s) => s.user);

  const handleCreate = async (name: string) => {
    await create.mutateAsync(name);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Bands</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Create bands, invite members, collaborate on songs.
          </p>
        </div>
        {user && (
          <Button
            className="flex items-center gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New band
          </Button>
        )}
      </div>

      {user && (
        <CreateBandDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreate}
        />
      )}

      {isLoading ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)]">
          Loading…
        </div>
      ) : bands.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="mt-4 text-[var(--muted-foreground)]">
            No bands yet. Create one to start collaborating.
          </p>
          {user && (
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              Create band
            </Button>
          )}
          {!user && (
            <Button className="mt-4" asChild>
              <Link href="/login">Sign in to create a band</Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {bands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/bands/${b.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--muted)]/30 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2"
              >
                <span className="font-medium">{b.name}</span>
                <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                  · {b.members.length} member{b.members.length !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
