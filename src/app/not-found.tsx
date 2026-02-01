import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="font-serif text-4xl font-semibold">Page not found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          The page you’re looking for doesn’t exist. Try one of the main spaces
          below.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/sanctuary">Sanctuary</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cosmos">Cosmos</Link>
        </Button>
      </div>
    </div>
  );
}
