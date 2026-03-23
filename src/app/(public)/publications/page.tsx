import { FileText, Calendar } from "lucide-react";

const publications = [
  { title: "Annual Report 2025", date: "2026-01-15", category: "Annual Report" },
  { title: "Telecommunications Sector Performance Q4 2025", date: "2026-02-01", category: "Quarterly Report" },
  { title: "National Broadband Strategy Update", date: "2025-12-10", category: "Policy Document" },
  { title: "Consumer Complaints Summary 2025", date: "2026-01-20", category: "Consumer Protection" },
  { title: "Radio Frequency Band Plan Revision", date: "2025-11-15", category: "Technical Document" },
  { title: "Digital Transformation Roadmap", date: "2026-03-01", category: "Strategy" },
];

export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-bocra-navy mb-4">Publications</h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Access regulatory publications, reports, and industry statistics from BOCRA.
      </p>

      <div className="space-y-3">
        {publications.map((pub) => (
          <div
            key={pub.title}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:shadow-sm transition-shadow"
          >
            <div className="text-bocra-blue">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm text-bocra-navy">{pub.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(pub.date).toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-bocra-light text-xs text-muted-foreground">
                  {pub.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
