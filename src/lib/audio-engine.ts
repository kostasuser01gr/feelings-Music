/**
 * Minimal music DSL over Tone.js.
 * schedule(), synth(), pattern(), tempo(). Live play + offline WAV export.
 */

import * as Tone from "tone";
import type { OfflineContext } from "tone";

let _initialized = false;

export async function initAudio(): Promise<void> {
  if (_initialized) return;
  await Tone.start();
  _initialized = true;
}

export function getTransport() {
  return Tone.getTransport();
}

export function setTempo(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}

export function getTempo(): number {
  return Tone.getTransport().bpm.value;
}

export interface SynthOptions {
  type?: "sine" | "square" | "sawtooth" | "triangle";
  volume?: number;
}

export function createSynth(options: SynthOptions = {}) {
  const { type = "sine", volume = -6 } = options;
  return new Tone.Synth({
    oscillator: { type },
    volume,
  }).toDestination();
}

export interface ScheduleNote {
  time: number;
  note: string;
  duration: string | number;
  velocity?: number;
}

export function schedule(
  synth: Tone.Synth,
  notes: ScheduleNote[],
  startTime?: number
): void {
  const t = startTime ?? Tone.now();
  notes.forEach(({ time, note, duration, velocity = 0.8 }) => {
    synth.triggerAttackRelease(note, duration, t + time, velocity);
  });
}

export function pattern(
  synth: Tone.Synth,
  notes: string[],
  interval: string,
  startTime?: number
): Tone.Loop {
  let i = 0;
  const loop = new Tone.Loop((time) => {
    const note = notes[i % notes.length];
    synth.triggerAttackRelease(note, "8n", time, 0.7);
    i += 1;
  }, interval).start(startTime ?? 0);
  return loop;
}

export function stopAll(): void {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

export type RenderCallback = (context: OfflineContext) => Promise<void> | void;

export async function exportOffline(
  render: RenderCallback,
  durationSeconds: number
): Promise<Blob> {
  const toneBuffer = await Tone.Offline(render, durationSeconds, 2);
  const buffer = toneBuffer.get();
  if (!buffer) throw new Error("Offline render produced no buffer");
  const wav = bufferToWav(buffer);
  return new Blob([wav], { type: "audio/wav" });
}

function bufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, l < 0 ? l * 0x8000 : l * 0x7fff, true);
    offset += 2;
    view.setInt16(offset, r < 0 ? r * 0x8000 : r * 0x7fff, true);
    offset += 2;
  }
  return arrayBuffer;
}
