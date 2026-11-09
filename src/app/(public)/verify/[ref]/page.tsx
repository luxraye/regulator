import { redirect } from "next/navigation";

// A link with only the reference goes to the lookup form with it filled in.
export default function VerifyRefOnly({ params }: { params: { ref: string } }) {
  redirect(`/verify?ref=${encodeURIComponent(params.ref)}`);
}
