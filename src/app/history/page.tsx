/**
 * Historical Universe Demo Page
 * Showcase of complete historical timeline, magic, and learning system
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Historical Universe component to avoid SSR issues
const HistoricalUniverse = dynamic(
  () => import('@/components/cosmos/historical-universe'),
  { ssr: false }
);

export default function HistoryPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <HistoricalUniverse initialYear={0} />
    </main>
  );
}
