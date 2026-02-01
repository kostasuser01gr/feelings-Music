"use client";

interface LyricsEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function LyricsEditor({
  value,
  onChange,
  placeholder = "Verse 1\n...\n\nChorus\n...",
}: LyricsEditorProps) {
  return (
    <div>
      <label htmlFor="lyrics-editor" className="text-sm font-medium">
        Lyrics
      </label>
      <textarea
        id="lyrics-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={14}
        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2"
        aria-describedby="lyrics-editor-desc"
      />
      <p id="lyrics-editor-desc" className="mt-1 text-xs text-[var(--muted-foreground)]">
        Edit lyrics here. Structure with Verse / Chorus / Bridge as you like.
      </p>
    </div>
  );
}
