"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_PINS } from "@/lib/cosmos-data";
import { Search } from "lucide-react";

export function CosmosListView() {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<string>("");
  const [meditationOnly, setMeditationOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = MOCK_PINS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.genre ?? "").toLowerCase().includes(q) ||
          (p.mood ?? "").toLowerCase().includes(q)
      );
    }
    if (moodFilter) {
      list = list.filter((p) => (p.mood ?? "") === moodFilter);
    }
    if (meditationOnly) {
      list = list.filter(
        (p) =>
          (p.mood ?? "") === "calm" ||
          (p.mood ?? "") === "peaceful" ||
          (p.genre ?? "") === "ambient"
      );
    }
    return list;
  }, [search, moodFilter, meditationOnly]);

  const moods = useMemo(() => {
    const set = new Set<string>();
    MOCK_PINS.forEach((p) => {
      if (p.mood) set.add(p.mood);
    });
    return Array.from(set).sort();
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="font-medium">Songs</h2>
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
          aria-label="Search songs"
        />
      </div>
      <div className="grid gap-3">
        <div>
          <label htmlFor="cosmos-mood-filter" className="text-xs text-[var(--muted-foreground)]">
            Mood
          </label>
          <select
            id="cosmos-mood-filter"
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/80"
          >
            <option value="">All</option>
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant={meditationOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setMeditationOnly((v) => !v)}
        >
          {meditationOnly ? "Meditation picks on" : "Meditation picks"}
        </Button>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto" role="list">
        {filtered.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-left text-sm hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/80"
            >
              <span className="font-medium">{p.title}</span>
              <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                {[p.mood, p.genre].filter(Boolean).join(" · ")}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-4 text-center text-sm text-[var(--muted-foreground)]">
            No songs match.
          </li>
        )}
      </ul>
    </div>
  );
}
