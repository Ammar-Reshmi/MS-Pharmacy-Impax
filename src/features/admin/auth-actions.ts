"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticateStaff(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const email = formData.get("email");
  const password = formData.get("password");
  const otp = formData.get("otp");

  if (typeof email !== "string" || !email.trim()) {
    return { error: "Please enter your work email." };
  }
  if (typeof password !== "string" || !password) {
    return { error: "Please enter your password." };
  }

  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      otp: typeof otp === "string" && otp.trim() ? otp.trim() : undefined,
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email, password, or authenticator code." };
        default:
          return { error: "Failed to authenticate. Please check your credentials." };
      }
    }
    throw error;
  }
}

export async function signOutStaff() {
  await signOut({ redirectTo: "/admin/login" });
}
