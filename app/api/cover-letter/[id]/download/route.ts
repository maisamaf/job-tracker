import { NextRequest } from "next/server";
import { getCoverLetterFile } from "@/features/cover-letter/actions/get-cover-letter-file";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let file;
  try {
    file = await getCoverLetterFile(id);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const asciiName = file.fileName
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
  const encodedName = encodeURIComponent(file.fileName);

  return new Response(new Uint8Array(file.data), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(file.data.length),
    },
  });
}
