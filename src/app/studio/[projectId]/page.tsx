import { StudioProject } from "./studio-project";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function StudioProjectPage({ params }: Props) {
  const { projectId } = await params;
  if (projectId === "new") {
    return <StudioProject projectId={null} />;
  }
  return <StudioProject projectId={projectId} />;
}
