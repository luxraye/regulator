"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

/** Sign-out in the top bar, for phones where the sidebar is hidden. */
export function MobileSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg p-2 text-ceda-ink hover:bg-ceda-sand md:hidden transition-colors"
      aria-label="Sign out"
    >
      <LogOut size={20} />
    </button>
  );
}
