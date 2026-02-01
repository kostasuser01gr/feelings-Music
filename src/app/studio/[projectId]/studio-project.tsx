"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LyricsEditor } from "@/components/studio/lyrics-editor";
import { ArrangementDaw } from "@/components/studio/arrangement-daw";
import { CodeMode } from "@/components/studio/code-mode";
const MeditationSoundscape = dynamic(
  () =>
    import("@/components/meditation/meditation-soundscape").then(
      (m) => m.MeditationSoundscape
    ),
  { ssr: false }
);

interface StudioProjectProps {
  projectId: string | null;
}

export function StudioProject({ projectId }: StudioProjectProps) {
  const isNew = projectId === null;
  const [lyrics, setLyrics] = useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/studio" aria-label="Back to Studio">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            {isNew ? "New project" : "Project"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isNew ? "Solo Song · Lyrics, Arrangement, Code, Mix, Publish" : projectId ?? ""}
          </p>
        </div>
      </div>
      <Tabs defaultValue="lyrics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
          <TabsTrigger value="arrangement">Arrangement</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
          <TabsTrigger value="mix">Mix</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>
        <TabsContent value="lyrics" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <LyricsEditor value={lyrics} onChange={setLyrics} />
          </div>
        </TabsContent>
        <TabsContent value="arrangement" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <ArrangementDaw />
          </div>
        </TabsContent>
        <TabsContent value="code" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <CodeMode />
          </div>
        </TabsContent>
        <TabsContent value="meditation" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
            <p className="text-[var(--muted-foreground)]">
              Build a slow ambient bed inspired by your meditation session.
            </p>
            <MeditationSoundscape />
            <Button variant="outline" asChild>
              <Link href="/meditation">Open Meditation Room</Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="mix" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-[var(--muted-foreground)]">
              Effects rack: reverb, delay, EQ-lite — Phase 3 polish.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="publish" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-[var(--muted-foreground)]">
              Export audio + cover + credits, then publish to Cosmos.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
