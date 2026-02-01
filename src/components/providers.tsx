"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { HelpOverlay } from "@/components/help-overlay";
import { useShortcuts } from "@/hooks/use-shortcuts";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const isTyping = () => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      el.isContentEditable ||
      el.getAttribute("role") === "textbox"
    );
  };

  useShortcuts({
    onCommandPalette: () => setCommandOpen(true),
    onHelp: () => setHelpOpen(true),
    onSearch: () => setCommandOpen(true),
    isTyping,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <HelpOverlay open={helpOpen} onOpenChange={setHelpOpen} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
