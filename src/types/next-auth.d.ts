import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role;
    organizationName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      organizationName?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    organizationName?: string | null;
  }
}
