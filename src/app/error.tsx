"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          We hit an unexpected error. Please try again.
        </p>
      </div>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  );
}
