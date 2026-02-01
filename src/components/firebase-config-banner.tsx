"use client";

import { firebaseDiagnostics } from "@/lib/firebase";

export function FirebaseConfigBanner() {
  if (firebaseDiagnostics.isConfigured) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    >
      <p className="font-medium">Firebase is not fully configured.</p>
      <p className="mt-1 text-amber-100/80">
        Missing environment keys: {firebaseDiagnostics.issues.join(", ")}
      </p>
      <p className="mt-1 text-amber-100/80">
        Add them in <span className="font-mono">.env.local</span> and restart
        the dev server.
      </p>
    </div>
  );
}
