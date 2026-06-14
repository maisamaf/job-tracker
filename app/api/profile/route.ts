import { getProfile } from "@/features/profile/actions/get-profile";

export async function GET() {
  try {
    const profile = await getProfile();
    return Response.json(profile);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
