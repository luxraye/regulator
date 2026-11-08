import { ComplaintsDesk } from "./complaints-desk";

export const metadata = { title: "Complaints · BOCRA" };

export default function AdminComplaintsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Consumer complaints</h1>
        <p className="mt-1 text-muted-foreground">
          Triage complaints from the public. Notes you save are shown to the complainant on the tracking page.
        </p>
      </div>
      <ComplaintsDesk />
    </div>
  );
}
