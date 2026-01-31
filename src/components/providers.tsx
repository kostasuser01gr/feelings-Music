"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { useShortcuts } from "@/hooks/use-shortcuts";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  useShortcuts({
    onCommandPalette: () => setCommandOpen(true),
    onHelp: () => setCommandOpen(true),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
