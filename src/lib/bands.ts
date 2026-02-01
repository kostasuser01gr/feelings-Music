export type BandRole = "owner" | "admin" | "producer" | "writer" | "listener";

export interface BandMember {
  uid: string;
  role: BandRole;
  displayName?: string;
}

export interface Band {
  id: string;
  name: string;
  members: BandMember[];
  createdAt: number;
  updatedAt: number;
}
