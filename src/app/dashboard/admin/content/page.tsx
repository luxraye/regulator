"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Trash2,
  Plus,
  ExternalLink,
  Layers,
  HelpCircle,
  Pin,
  CheckCircle2,
  FileCheck,
  Download,
} from "lucide-react";

interface DocumentResource {
  id: string;
  title: string;
  category: "template" | "guide" | "statutory";
  fileType: string;
  fileSize: string;
  url: string;
  updatedAt: string;
}

const DEFAULT_DOCUMENTS: DocumentResource[] = [
  {
    id: "doc-1",
    title: "CEDA Flagship Innovation Pitch Deck Template (10-Slide Standard)",
    category: "template",
    fileType: "PDF / PPTX",
    fileSize: "2.4 MB",
    url: "/downloads/ceda-pitch-template-2026.pdf",
    updatedAt: "2026-11-08",
  },
  {
    id: "doc-2",
    title: "Venture Financial Model & 3-Year Projections Spreadsheet",
    category: "template",
    fileType: "XLSX",
    fileSize: "1.1 MB",
    url: "/downloads/ceda-financial-projections.xlsx",
    updatedAt: "2026-11-05",
  },
  {
    id: "doc-3",
    title: "Citizen Youth Shareholding & Omang Statutory Declaration Form",
    category: "statutory",
    fileType: "PDF",
    fileSize: "480 KB",
    url: "/downloads/youth-shareholding-declaration.pdf",
    updatedAt: "2026-11-02",
  },
  {
    id: "doc-4",
    title: "Innovator IP Protection & Non-Disclosure Guidelines",
    category: "guide",
    fileType: "PDF",
    fileSize: "850 KB",
    url: "/downloads/innovator-ip-guide.pdf",
    updatedAt: "2026-11-01",
  },
];

export default function AdminContentManagerPage() {
  const [activeTab, setActiveTab] = useState<"forms" | "documents" | "notices" | "faq">("documents");
  const [documents, setDocuments] = useState<DocumentResource[]>(DEFAULT_DOCUMENTS);

  // New Document modal/form state
  const [docTitle, setDocTitle] = useState("");
  const [docCat, setDocCat] = useState<"template" | "guide" | "statutory">("template");
  const [docType, setDocType] = useState("PDF");
  const [docSize, setDocSize] = useState("1.5 MB");
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docMessage, setDocMessage] = useState<string | null>(null);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc: DocumentResource = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCat,
      fileType: docType,
      fileSize: docSize,
      url: `/downloads/${docTitle.toLowerCase().replace(/\s+/g, "-")}.${docType.toLowerCase()}`,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setDocTitle("");
    setShowAddDoc(false);
    setDocMessage("Document resource added successfully!");
    setTimeout(() => setDocMessage(null), 3000);
  };

  const handleDeleteDocument = (id: string) => {
    if (!confirm("Are you sure you want to remove this required document template?")) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ceda-copper">Portal Administration</span>
          <h1 className="text-2xl font-black text-ceda-ink">Content & Forms Manager</h1>
          <p className="text-xs text-ceda-slate mt-0.5">
            Manage application schemas, downloadable document templates, safe practices notices, and portal FAQs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/instances"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold text-ceda-ink hover:bg-neutral-50 shadow-sm"
          >
            <Layers size={14} /> Instance Studio
          </Link>
          <Link
            href="/faq"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold text-ceda-ink hover:bg-neutral-50 shadow-sm"
          >
            <HelpCircle size={14} /> Public FAQ <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-sm">
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "documents"
              ? "border-ceda-orange text-ceda-orange"
              : "border-transparent text-ceda-slate hover:text-ceda-ink"
          }`}
        >
          <FileText size={16} /> Required Documents & Templates ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "forms"
              ? "border-ceda-orange text-ceda-orange"
              : "border-transparent text-ceda-slate hover:text-ceda-ink"
          }`}
        >
          <FileCheck size={16} /> Application Form Builder
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "notices"
              ? "border-ceda-orange text-ceda-orange"
              : "border-transparent text-ceda-slate hover:text-ceda-ink"
          }`}
        >
          <Pin size={16} /> Safe Practices & Notices
        </button>
      </div>

      {docMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={14} /> {docMessage}
        </div>
      )}

      {/* Tab: Required Documents & Templates */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ceda-ink">Downloadable Applicant Documents</h2>
              <p className="text-xs text-ceda-slate">
                Official templates, spreadsheets, and statutory guidelines made available to innovators during submissions.
              </p>
            </div>
            <button
              onClick={() => setShowAddDoc(!showAddDoc)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ceda-orange hover:bg-ceda-copper text-white text-xs font-bold shadow transition"
            >
              <Plus size={14} /> Add Template
            </button>
          </div>

          {showAddDoc && (
            <form onSubmit={handleAddDocument} className="p-5 rounded-xl border border-border bg-white shadow-sm space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-ceda-ink">Add New Required Document / Guide</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-ceda-slate mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Environmental Impact Assessment Self-Declaration"
                    className="w-full px-3 py-2 rounded-lg border border-border text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-ceda-slate mb-1">Category</label>
                    <select
                      value={docCat}
                      onChange={(e) => setDocCat(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-lg border border-border text-ceda-ink bg-white focus:outline-none"
                    >
                      <option value="template">Template</option>
                      <option value="guide">Guide</option>
                      <option value="statutory">Statutory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-ceda-slate mb-1">Format</label>
                    <input
                      type="text"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      placeholder="PDF, XLSX"
                      className="w-full px-2.5 py-2 rounded-lg border border-border text-ceda-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-ceda-slate mb-1">Size</label>
                    <input
                      type="text"
                      value={docSize}
                      onChange={(e) => setDocSize(e.target.value)}
                      placeholder="1.2 MB"
                      className="w-full px-2.5 py-2 rounded-lg border border-border text-ceda-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDoc(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-ceda-slate hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-ceda-orange hover:bg-ceda-copper text-white text-xs font-bold"
                  >
                    Save Resource
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50 text-ceda-slate font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Format / Size</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50/60">
                    <td className="py-3 px-4 font-bold text-ceda-ink flex items-center gap-2">
                      <FileText size={16} className="text-ceda-copper shrink-0" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ceda-slate">
                      {doc.fileType} · {doc.fileSize}
                    </td>
                    <td className="py-3 px-4 text-ceda-slate">{doc.updatedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={doc.url}
                          download
                          className="p-1.5 rounded text-ceda-slate hover:text-ceda-ink hover:bg-neutral-100"
                          title="Download preview"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          title="Delete template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Form Builder */}
      {activeTab === "forms" && (
        <div className="p-6 rounded-2xl border border-border bg-white space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-ceda-ink">Per-Instance Application Form Builder</h2>
              <p className="text-xs text-ceda-slate mt-0.5">
                Each challenge instance defines a programmable JSON submission schema: questions, field types, validations, and file upload requirements.
              </p>
            </div>
            <Link
              href="/dashboard/instances"
              className="px-3 py-1.5 rounded-lg bg-ceda-blue text-white text-xs font-bold hover:bg-ceda-blue-dark shadow transition"
            >
              Open Studio Instances →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-ceda-sand border border-border/80 text-xs space-y-2">
            <p className="font-bold text-ceda-ink">Supported Field Schema Types:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-ceda-ink">
              <span className="p-2 bg-white rounded border">SHORT_TEXT</span>
              <span className="p-2 bg-white rounded border">LONG_TEXT</span>
              <span className="p-2 bg-white rounded border">NUMBER / CURRENCY</span>
              <span className="p-2 bg-white rounded border">FILE_UPLOAD (PDF/ZIP)</span>
              <span className="p-2 bg-white rounded border">SINGLE_SELECT</span>
              <span className="p-2 bg-white rounded border">MULTI_SELECT</span>
              <span className="p-2 bg-white rounded border">DATE</span>
              <span className="p-2 bg-white rounded border">BOOLEAN_CHECK</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notices */}
      {activeTab === "notices" && (
        <div className="p-6 rounded-2xl border border-border bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ceda-ink">Safe Practices & Notices Board</h2>
              <p className="text-xs text-ceda-slate mt-0.5">
                Publish advice for innovators on IP protection, pitching, statutory filings, and scam prevention.
              </p>
            </div>
            <Link
              href="/dashboard/admin/notices"
              className="px-3 py-1.5 rounded-lg bg-ceda-orange text-white text-xs font-bold hover:bg-ceda-copper shadow transition"
            >
              Manage Board Notices →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
