"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

/** Sign-out in the top bar, for phones where the sidebar is hidden. */
export function MobileSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg p-2 text-ceda-navy hover:bg-ceda-light md:hidden"
      aria-label="Sign out"
    >
      <LogOut size={20} />
    </button>
  );
}
