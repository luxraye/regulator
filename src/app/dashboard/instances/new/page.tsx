import { StudioBuilder } from "@/components/instance-studio/studio-builder";

export const metadata = {
  title: "New Competition Instance | CEDA Studio",
};

export default function NewInstancePage() {
  return <StudioBuilder isExisting={false} status="DRAFT" />;
}
