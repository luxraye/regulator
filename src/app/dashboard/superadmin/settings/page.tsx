export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">System Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Platform Name</label>
              <input
                defaultValue="BOCRA Digital Regulatory Platform"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contact Email</label>
              <input
                defaultValue="info@bocra.org.bw"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">Security</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2">
              <span>File Integrity Hashing</span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">SHA-256 Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Submission Signing</span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">JWT Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Compliance Vault</span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Immutable</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Audit Logging</span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">Environment</h3>
          <div className="space-y-2 text-sm text-muted-foreground font-mono">
            <p>Node: {"{process.versions.node}"}</p>
            <p>Framework: Next.js 14</p>
            <p>Database: PostgreSQL + Prisma v5</p>
            <p>Auth: NextAuth v5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
