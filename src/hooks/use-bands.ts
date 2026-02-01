"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import type { Band, BandMember } from "@/lib/bands";

async function fetchBands(uid: string | null): Promise<Band[]> {
  if (!db || !uid) return [];
  const q = query(
    collection(db, "bands"),
    where("memberIds", "array-contains", uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: (data.name as string) ?? "",
      members: (data.members as BandMember[]) ?? [],
      createdAt: (data.createdAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
      updatedAt: (data.updatedAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
    };
  });
}

export function useBands() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  return useQuery({
    queryKey: ["bands", uid],
    queryFn: () => fetchBands(uid),
  });
}

export function useCreateBand() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!db || !uid) throw new Error("Sign in to create bands");
      const ref = await addDoc(collection(db, "bands"), {
        name,
        members: [{ uid, role: "owner" }],
        memberIds: [uid],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bands"] }),
  });
}
