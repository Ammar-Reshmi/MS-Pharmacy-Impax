import "server-only";

import { verify as verifyPassword } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify as verifyTotp } from "otplib";
import { z } from "zod";
import { getDb } from "@/db";
import { staffUsers } from "@/db/schema";
import { decryptMfaSecret } from "@/lib/secrets";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(256),
  otp: z.string().trim().regex(/^\d{6}$/).optional()
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Staff credentials",
      credentials: {
        email: { label: "Work email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "Authenticator code", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const db = getDb();
        const staff = await db.query.staffUsers.findFirst({
          where: eq(staffUsers.email, parsed.data.email.toLowerCase())
        });
        if (!staff?.active || !(await verifyPassword(staff.passwordHash, parsed.data.password))) return null;

        if (staff.mfaEnabled) {
          if (!staff.mfaSecretEncrypted || !parsed.data.otp) return null;
          const verification = await verifyTotp({ secret: decryptMfaSecret(staff.mfaSecretEncrypted), token: parsed.data.otp });
          if (!verification.valid) return null;
        }

        await db.update(staffUsers).set({ lastSignedInAt: new Date(), updatedAt: new Date() }).where(eq(staffUsers.id, staff.id));
        return { id: staff.id, name: staff.name, email: staff.email, role: staff.role, mfaEnabled: staff.mfaEnabled };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mfaEnabled = user.mfaEnabled;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role ?? "sales";
        session.user.mfaEnabled = token.mfaEnabled ?? false;
      }
      return session;
    }
  }
});

