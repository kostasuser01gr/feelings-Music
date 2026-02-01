"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import * as Y from "yjs";

/**
 * Local Yjs doc for lyrics. When a WebSocket provider is configured,
 * attach it here for realtime sync. For now, local-only.
 */
export function useYjsLyrics(projectId: string | null, initial = "") {
  const [doc] = useState(() => new Y.Doc());
  const [ytxt] = useState(() => doc.getText("lyrics"));
  const [value, setValue] = useState("");
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (initial && ytxt.length === 0) ytxt.insert(0, initial);
  }, [initial, ytxt]);

  useEffect(() => {
    const handler = () => setValue(ytxt.toString());
    ytxt.observe(handler);
    queueMicrotask(() => setValue(ytxt.toString()));
    return () => ytxt.unobserve(handler);
  }, [ytxt]);

  const update = useCallback(
    (v: string) => {
      ytxt.delete(0, ytxt.length);
      ytxt.insert(0, v);
      setValue(v);
    },
    [ytxt]
  );

  return [value, update] as const;
}
