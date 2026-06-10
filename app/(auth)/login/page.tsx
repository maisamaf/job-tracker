import LoginForm from "@/features/auth/components/login-form";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Please use your email and password, or the social login you originally used.",
  OAuthCallbackError:
    "There was a problem signing in with that provider. Please try again.",
  OAuthSignin: "Could not connect to the sign-in provider. Please try again.",
  AccessDenied: "Access was denied. Please try again or contact support.",
};

const FALLBACK_ERROR = "Something went wrong. Please try again.";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const serverError = error
    ? (AUTH_ERROR_MESSAGES[error] ?? FALLBACK_ERROR)
    : undefined;

  return <LoginForm serverError={serverError} />;
}
