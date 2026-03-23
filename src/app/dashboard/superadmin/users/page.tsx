import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationName: true,
      licenseNumber: true,
      createdAt: true,
    },
  });

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      SUPERADMIN: "bg-purple-100 text-purple-700",
      ADMIN: "bg-blue-100 text-blue-700",
      LICENSEE: "bg-green-100 text-green-700",
      PUBLIC: "bg-gray-100 text-gray-600",
    };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">User Management</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Email</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Role</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Organization</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">License #</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-bocra-light/50">
                <td className="px-6 py-3 font-medium">{user.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted-foreground">{user.organizationName || "—"}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono">{user.licenseNumber || "—"}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
