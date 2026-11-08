export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { RoleSelect } from "./role-select";

export default async function UsersPage() {
  const me = await getSessionUser();
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
                  <RoleSelect userId={user.id} role={user.role} disabled={user.id === me?.id} />
                </td>
                <td className="px-6 py-3 text-muted-foreground">{user.organizationName || "—"}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono">{user.licenseNumber || "—"}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
