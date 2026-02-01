"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Privacy } from "@/lib/confession";
import {
  DEFAULT_MOODS,
  DEFAULT_GENRES,
  DEFAULT_THEMES,
} from "@/lib/confession";
import { cn } from "@/lib/utils";
import { Lock, Users, Globe } from "lucide-react";

interface ConfessionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    content: string;
    tags: string[];
    mood: string[];
    genre: string[];
    theme: string[];
    privacy: Privacy;
  }) => void | Promise<void>;
}

const PRIVACY_OPTIONS: { value: Privacy; label: string; icon: typeof Lock }[] = [
  { value: "private", label: "Private", icon: Lock },
  { value: "friends", label: "Friends", icon: Users },
  { value: "public", label: "Public", icon: Globe },
];

export function ConfessionEditor({
  open,
  onOpenChange,
  onSubmit,
}: ConfessionEditorProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [genre, setGenre] = useState<string[]>([]);
  const [theme, setTheme] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<Privacy>("friends");
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const toggle = useCallback(
    (arr: string[], val: string, set: (a: string[]) => void) => {
      if (arr.includes(val)) set(arr.filter((x) => x !== val));
      else set([...arr, val]);
    },
    []
  );

  const checkDistress = useCallback((text: string) => {
    const lower = text.toLowerCase();
    const distress = [
      "want to die",
      "kill myself",
      "end my life",
      "better off dead",
      "no reason to live",
    ];
    return distress.some((p) => lower.includes(p));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (checkDistress(content)) {
      setShowSafetyCheck(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        content,
        tags,
        mood,
        genre,
        theme,
        privacy,
      });
      setContent("");
      setTags([]);
      setMood([]);
      setGenre([]);
      setTheme([]);
      setPrivacy("friends");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setLoading(false);
    }
  }, [
    content,
    tags,
    mood,
    genre,
    theme,
    privacy,
    checkDistress,
    onSubmit,
    onOpenChange,
  ]);

  const addCustomTag = () => {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setCustomTag("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showClose className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New confession</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <label htmlFor="confession-content" className="text-sm font-medium">
                What’s on your mind?
              </label>
              <textarea
                id="confession-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely. This can become a song."
                rows={5}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2"
                aria-describedby="confession-content-desc"
              />
              <p id="confession-content-desc" className="mt-1 text-xs text-[var(--muted-foreground)]">
                Optional: record a voice note (coming soon).
              </p>
            </div>

            <div>
              <span className="text-sm font-medium">Mood</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEFAULT_MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggle(mood, m, setMood)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2",
                      mood.includes(m)
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Genre</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEFAULT_GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggle(genre, g, setGenre)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2",
                      genre.includes(g)
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Theme</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEFAULT_THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggle(theme, t, setTheme)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2",
                      theme.includes(t)
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Tags</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1 text-sm"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="rounded-full p-0.5 hover:bg-[var(--muted-foreground)]/20 focus:outline-none focus:ring-2 focus:ring-amber-500/80"
                      aria-label={`Remove tag ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex gap-1">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    placeholder="Add tag"
                    className="h-8 w-28"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={addCustomTag}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Privacy</span>
              <div className="mt-2 flex gap-2">
                {PRIVACY_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPrivacy(value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2",
                      privacy === value
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/meditation?session=5">Start meditation</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={!content.trim() || loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSafetyCheck} onOpenChange={setShowSafetyCheck}>
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>We’re here for you</DialogTitle>
          </DialogHeader>
          <p className="text-[var(--muted-foreground)]">
            If you’re going through a difficult time, please reach out to someone
            you trust—a friend, family member, or a counselor. You don’t have to
            face it alone. If you’re in crisis, consider contacting a helpline in
            your country.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSafetyCheck(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowSafetyCheck(false);
                setContent("");
              }}
            >
              I’ll reach out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
