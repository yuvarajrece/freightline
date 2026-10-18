import { NextResponse } from "next/server";
import { AppError } from "@/core/domain/errors";
import { toCsv } from "@/lib/utils";
import { assertAdmin } from "@/services/admin-context";

const EXPORTS = {
  quotes: {
    columns: ["created_at", "status", "full_name", "company", "email", "phone", "service_label", "origin", "destination", "cargo_type", "weight_kg", "pickup_date", "message"],
  },
  messages: {
    columns: ["created_at", "status", "full_name", "email", "phone", "subject", "message"],
  },
  subscribers: {
    columns: ["created_at", "email", "is_active"],
  },
} as const;

type ExportKind = keyof typeof EXPORTS;

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  try {
    const { container } = await assertAdmin();
    const { kind } = await params;

    if (!Object.prototype.hasOwnProperty.call(EXPORTS, kind)) {
      return NextResponse.json({ ok: false, error: "Unknown export." }, { status: 404 });
    }

    const exportKind = kind as ExportKind;
    const rows = (await container.exportSources[exportKind]()) as unknown as Record<string, unknown>[];
    const csv = toCsv(rows, [...EXPORTS[exportKind].columns]);
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(`﻿${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="freightline-${exportKind}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AppError && error.status < 500) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("[export]", error);
    return NextResponse.json({ ok: false, error: "Export failed." }, { status: 500 });
  }
}
