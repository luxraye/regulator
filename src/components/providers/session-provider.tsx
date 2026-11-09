"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/** Takes the session read on the server, so menus that depend on it render straight away instead of after a fetch. */
export function SessionProvider({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
