import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ALL_PLAN_DOCUMENTS } from "@/app/components/ComparePlans/planDocuments";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;

    const document = ALL_PLAN_DOCUMENTS.find((doc) => doc.id === documentId);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    let pdfData: ArrayBuffer;

    if (document.file.startsWith("http://") || document.file.startsWith("https://")) {
      const response = await fetch(document.file, {
        cache: "no-store",
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Unable to fetch coverage document" },
          { status: 502 },
        );
      }

      pdfData = await response.arrayBuffer();
    } else {
      const normalizedRelativePath = document.file.replace(/^\/+/, "");
      const absolutePath = path.resolve(process.cwd(), "public", normalizedRelativePath);
      const publicRoot = path.resolve(process.cwd(), "public");

      if (!absolutePath.startsWith(publicRoot)) {
        return NextResponse.json(
          { error: "Invalid document path" },
          { status: 400 },
        );
      }

      const fileBuffer = await fs.readFile(absolutePath);
      const normalized = new Uint8Array(fileBuffer.byteLength);
      normalized.set(fileBuffer);
      pdfData = normalized.buffer;
    }

    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Coverage document download error:", error);
    return NextResponse.json(
      { error: "Failed to download coverage document" },
      { status: 500 },
    );
  }
}
