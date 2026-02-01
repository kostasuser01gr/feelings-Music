import { BandRoom } from "./band-room";

interface Props {
  params: Promise<{ bandId: string }>;
}

export default async function BandRoomPage({ params }: Props) {
  const { bandId } = await params;
  return <BandRoom bandId={bandId} />;
}
