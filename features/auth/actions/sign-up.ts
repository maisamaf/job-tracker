"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/features/auth/lib/password";

const REDIRECT_TO = "/dashboard";

const signUpSchema = z
  .object({
    name: z.string().min(1, "Enter your name"),
    email: z.email({ error: "Enter a valid email address" }).trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    root?: string[];
  };
  values?: {
    name?: string;
    email?: string;
  };
};

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const rawValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = signUpSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { name: rawValues.name, email: rawValues.email },
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const values = { name: parsed.data.name, email: normalizedEmail };

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      errors: { email: ["An account with this email already exists"] },
      values,
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    name: parsed.data.name,
    email: normalizedEmail,
    passwordHash,
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password: parsed.data.password,
      redirectTo: REDIRECT_TO,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        errors: { root: ["Account created. Please sign in."] },
        values,
      };
    }

    throw error;
  }

  return {};
}
