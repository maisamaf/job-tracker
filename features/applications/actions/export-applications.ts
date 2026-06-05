import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, applications } from "@/lib/db";
import { format } from "date-fns";

// Wraps a value in quotes and escapes inner quotes.
// Required for fields that may contain commas, newlines, or quote characters.
function cell(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function buildApplicationsCSV(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const rows = await db.query.applications.findMany({
    where: eq(applications.userId, session.user.id),
    orderBy: [desc(applications.createdAt)],
  });

  const headers = [
    "Company",
    "Role",
    "Location",
    "Status",
    "Salary Min",
    "Salary Max",
    "Applied Date",
    "Job URL",
    "Notes",
    "Created At",
    "Updated At",
  ];

  const dataRows = rows.map((app) =>
    [
      cell(app.company),
      cell(app.role),
      cell(app.location),
      cell(app.status),
      cell(app.salaryMin),
      cell(app.salaryMax),
      app.appliedAt ? format(new Date(app.appliedAt), "yyyy-MM-dd") : "",
      cell(app.jobUrl),
      cell(app.notes), // description excluded — too large for spreadsheet cells
      format(new Date(app.createdAt), "yyyy-MM-dd"),
      format(new Date(app.updatedAt), "yyyy-MM-dd"),
    ].join(","),
  );

  return [headers.join(","), ...dataRows].join("\n");
}
