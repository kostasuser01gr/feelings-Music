export type Privacy = "private" | "friends" | "public";

export interface Confession {
  id: string;
  uid: string;
  content: string;
  tags: string[];
  mood: string[];
  genre: string[];
  theme: string[];
  privacy: Privacy;
  voiceNoteUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_MOODS = [
  "calm",
  "hopeful",
  "melancholic",
  "joyful",
  "angry",
  "anxious",
  "nostalgic",
  "peaceful",
  "yearning",
  "grateful",
] as const;

export const DEFAULT_GENRES = [
  "ambient",
  "folk",
  "indie",
  "electronic",
  "r&b",
  "hip-hop",
  "rock",
  "classical",
  "jazz",
  "pop",
] as const;

export const DEFAULT_THEMES = [
  "love",
  "loss",
  "identity",
  "nature",
  "growth",
  "family",
  "faith",
  "uncertainty",
  "belonging",
  "memory",
] as const;
