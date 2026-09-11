import "next-auth";

declare module "next-auth" {
  interface User {
    role: "super_admin" | "sales" | "catalogue_manager";
    mfaEnabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "super_admin" | "sales" | "catalogue_manager";
      mfaEnabled: boolean;
    } & NonNullable<Session["user"]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "super_admin" | "sales" | "catalogue_manager";
    mfaEnabled?: boolean;
  }
}

