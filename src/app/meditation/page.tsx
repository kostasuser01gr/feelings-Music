import type { Metadata } from "next";
import { MeditationRoom } from "@/components/meditation/meditation-room";
import { appName } from "@/lib/app-config";

export const metadata: Metadata = {
  title: `Meditation Room · ${appName}`,
  description: "A quiet space to breathe, focus, and connect meditation with your music.",
};

export default function MeditationPage() {
  return <MeditationRoom />;
}
