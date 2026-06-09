"use server";

import { auth } from "@/auth";
import { getApplications } from "./get-applications";
import { Application } from "@/lib/db";

export interface SearchApplicationResult {
  id: string;
  company: string;
  role: string;
  status: Application["status"];
  location: string | null;
}

export async function searchApplications(
  query: string,
): Promise<SearchApplicationResult[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const result = await getApplications(session.user.id, {
    search: query.trim(),
    page: 1,
  });

  return result.data.slice(0, 8).map((app) => ({
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    location: app.location,
  }));
}
