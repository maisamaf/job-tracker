import { buildApplicationsCSV } from "@/features/applications/actions/export-applications";
import { format } from "date-fns";

export async function GET() {
  const csv = await buildApplicationsCSV();

  if (!csv) {
    return new Response("Unauthorised", { status: 401 });
  }

  const filename = `applications-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
