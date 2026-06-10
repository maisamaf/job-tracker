"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";

const REDIRECT_TO = "/dashboard";

const signInSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }).trim(),
  password: z.string().min(1, "Enter your password"),
});

export type SignInState = {
  errors?: {
    email?: string[];
    password?: string[];
    root?: string[];
  };
  values?: {
    email?: string;
  };
};

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: REDIRECT_TO });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: REDIRECT_TO });
}

export async function signInWithCredentials(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const rawValues = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signInSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { email: rawValues.email },
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: REDIRECT_TO,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        errors: { root: ["Invalid email or password"] },
        values: { email: parsed.data.email },
      };
    }

    throw error;
  }

  return {};
}
