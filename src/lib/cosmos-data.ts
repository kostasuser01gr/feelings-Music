export interface SongPin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  mood?: string;
  genre?: string;
}

export interface Connection {
  fromId: string;
  toId: string;
  strength: number;
}

export const MOCK_PINS: SongPin[] = [
  { id: "1", title: "First Light", lat: 35.6, lng: 139.7, mood: "hopeful", genre: "ambient" },
  { id: "2", title: "Midnight", lat: 40.7, lng: -74.0, mood: "melancholic", genre: "indie" },
  { id: "3", title: "Dawn", lat: 51.5, lng: -0.1, mood: "calm", genre: "folk" },
  { id: "4", title: "Echo", lat: -33.9, lng: 18.4, mood: "nostalgic", genre: "electronic" },
  { id: "5", title: "Pulse", lat: 34.0, lng: -118.2, mood: "joyful", genre: "pop" },
];

export const MOCK_CONNECTIONS: Connection[] = [
  { fromId: "1", toId: "2", strength: 0.8 },
  { fromId: "2", toId: "3", strength: 0.6 },
  { fromId: "1", toId: "3", strength: 0.5 },
  { fromId: "4", toId: "5", strength: 0.7 },
];

export function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}
