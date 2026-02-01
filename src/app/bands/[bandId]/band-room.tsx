"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BandRoomProps {
  bandId: string;
}

export function BandRoom({ bandId }: BandRoomProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bands" aria-label="Back to Bands">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-serif text-2xl font-semibold">Band room</h1>
        <span className="text-sm text-[var(--muted-foreground)]" aria-hidden>{bandId}</span>
      </div>
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-[var(--muted-foreground)]">
              Shared projects · Rehearsal links — connect Studio projects here.
            </p>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Group meditation before sessions helps sync creative energy.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" asChild>
                <Link href="/meditation?session=10">Start group meditation</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-[var(--muted-foreground)]">
              Band chat — coming soon.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-[var(--muted-foreground)]">
              Members & roles (Owner, Admin, Producer, Writer, Listener).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
