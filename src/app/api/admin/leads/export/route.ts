import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const temperature = searchParams.get("temperature");

  const leads = await prisma.lead.findMany({
    where: {
      ...(status && { status: status as never }),
      ...(temperature && { leadTemperature: temperature }),
    },
    select: {
      businessName: true,
      contactName: true,
      email: true,
      phone: true,
      website: true,
      city: true,
      state: true,
      leadType: true,
      leadScore: true,
      leadTemperature: true,
      sellsDogTreats: true,
      sellsCompetitorProducts: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const headers = [
    "businessName",
    "contactName",
    "email",
    "phone",
    "website",
    "city",
    "state",
    "leadType",
    "leadScore",
    "leadTemperature",
    "sellsDogTreats",
    "sellsCompetitorProducts",
    "status",
    "createdAt",
  ] as const;

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [
    headers.join(","),
    ...leads.map((l) =>
      headers
        .map((h) => escape(l[h as keyof typeof l]))
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
    },
  });
}
