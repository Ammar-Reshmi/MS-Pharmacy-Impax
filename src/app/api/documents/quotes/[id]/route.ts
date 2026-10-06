import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadQuotationPdfRecord, renderQuotationPdf } from "@/features/quotations/pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only authenticated staff can download quotation PDFs
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const record = await loadQuotationPdfRecord(id);

  if (!record) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const buffer = await renderQuotationPdf(record);

  const safeNumber = record.quoteNumber.replace(/[^a-zA-Z0-9_-]/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotation-${safeNumber}.pdf"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store"
    }
  });
}
