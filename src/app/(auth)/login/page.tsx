"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!auth) {
      setError("Auth not configured.");
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/sanctuary");
    } catch (err: unknown) {
      const m = err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Sign in failed.";
      setError(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center gap-6">
      <h1 className="font-serif text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium">
          Email
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1"
            autoComplete="email"
            required
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1"
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        No account?{" "}
        <Link
          href="/signup"
          className="text-amber-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2 rounded"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
