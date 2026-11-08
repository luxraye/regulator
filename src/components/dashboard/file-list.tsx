import { Download, FileText } from "lucide-react";
import { formatBytes } from "@/lib/instance-schema";

export interface StoredFile {
  id: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  serverHash: string;
  clientHash?: string;
}

/** Uploaded files with download links and their stored SHA-256. */
export function FileList({
  instanceId,
  files,
  labels,
}: {
  instanceId: string;
  files: StoredFile[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="mb-3 font-semibold text-bocra-navy">Files</h3>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files were uploaded.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="rounded-lg bg-bocra-light p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText size={15} className="shrink-0 text-bocra-blue" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.fileName}</p>
                    {labels?.[f.fileKey] && <p className="text-xs text-muted-foreground">{labels[f.fileKey]}</p>}
                  </div>
                </div>
                <a
                  href={`/api/instances/${instanceId}/files/${f.id}`}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-bocra-blue hover:underline"
                >
                  <Download size={13} /> {formatBytes(f.fileSize)}
                </a>
              </div>
              <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">SHA-256 {f.serverHash}</p>
              {f.clientHash && f.clientHash !== f.serverHash && (
                <p className="mt-1 text-xs font-medium text-red-600">Browser and server hashes differ</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
