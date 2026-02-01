"use client";

import Link from "next/link";
import type { Confession } from "@/lib/confession";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface ConfessionCardProps {
  confession: Confession;
}

export function ConfessionCard({ confession }: ConfessionCardProps) {
  const allTags = [
    ...confession.mood,
    ...confession.genre,
    ...confession.theme,
    ...confession.tags,
  ];

  return (
    <article
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
      aria-labelledby={`confession-${confession.id}-title`}
    >
      <p
        id={`confession-${confession.id}-title`}
        className="whitespace-pre-wrap text-[var(--foreground)]"
      >
        {confession.content}
      </p>
      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {allTags.slice(0, 10).map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs text-[var(--muted-foreground)]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">
          {confession.privacy} · {new Date(confession.createdAt).toLocaleDateString()}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/studio?fromConfession=${confession.id}`}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Create song
          </Link>
        </Button>
      </div>
    </article>
  );
}
