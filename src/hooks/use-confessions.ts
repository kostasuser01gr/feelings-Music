"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import type { Confession, Privacy } from "@/lib/confession";

interface CreateConfessionInput {
  content: string;
  tags: string[];
  mood: string[];
  genre: string[];
  theme: string[];
  privacy: Privacy;
}

async function createConfession(
  uid: string,
  input: CreateConfessionInput
): Promise<string> {
  if (!db) throw new Error("Firestore not configured");
  const ref = await addDoc(collection(db, "confessions"), {
    uid,
    content: input.content,
    tags: input.tags,
    mood: input.mood,
    genre: input.genre,
    theme: input.theme,
    privacy: input.privacy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

async function fetchConfessions(): Promise<Confession[]> {
  if (!db) return [];
  const q = query(
    collection(db, "confessions"),
    where("privacy", "==", "public"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    const updated = data.updatedAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      uid: (data.uid as string) ?? "",
      content: (data.content as string) ?? "",
      tags: (data.tags as string[]) ?? [],
      mood: (data.mood as string[]) ?? [],
      genre: (data.genre as string[]) ?? [],
      theme: (data.theme as string[]) ?? [],
      privacy: ((data.privacy as Privacy) ?? "public") as Privacy,
      voiceNoteUrl: data.voiceNoteUrl as string | undefined,
      createdAt: ts?.toMillis?.() ?? Date.now(),
      updatedAt: updated?.toMillis?.() ?? Date.now(),
    };
  });
}

export function useConfessions() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const q = useQuery({
    queryKey: ["confessions", uid],
    queryFn: fetchConfessions,
  });
  return q;
}

export function useCreateConfession() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateConfessionInput) => {
      if (!uid) throw new Error("Sign in to create confessions");
      return createConfession(uid, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions"] });
    },
  });
}
