import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GlobalNav } from "@/components/global-nav";
import { ShortcutInit } from "@/components/shortcut-init";
import { ServiceWorkerReset } from "@/components/service-worker-reset";
import { FirebaseConfigBanner } from "@/components/firebase-config-banner";
import { OfflineBanner } from "@/components/offline-banner";
import { appTitle, appDescription, appName } from "@/lib/app-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: appTitle,
    template: `%s · ${appName}`,
  },
  applicationName: appName,
  description: appDescription,
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--card)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--foreground)]"
        >
          Skip to content
        </a>
        <ShortcutInit />
        <ServiceWorkerReset />
        <Providers>
          <GlobalNav />
          <div className="mx-auto max-w-7xl px-4 pt-4">
            <FirebaseConfigBanner />
            <div className="mt-3">
              <OfflineBanner />
            </div>
          </div>
          <main className="mx-auto max-w-7xl px-4 py-6" id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
