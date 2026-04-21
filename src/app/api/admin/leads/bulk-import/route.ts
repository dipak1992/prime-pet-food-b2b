import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

type CsvRow = {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  leadType?: string;
  sellsDogTreats?: string;
  sellsCompetitorProducts?: string;
};

function parseBoolean(v: string | undefined): boolean {
  return v?.toLowerCase() === "true" || v === "1";
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const text = await req.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must contain a header row and at least one data row" }, { status: 400 });
  }

  const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const rows: CsvRow[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    rawHeaders.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row as CsvRow;
  });

  const created: string[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.businessName || !row.email) {
      errors.push(`Skipped (missing businessName or email): ${JSON.stringify(row)}`);
      continue;
    }

    const sellsDogTreats = parseBoolean(row.sellsDogTreats);
    const sellsCompetitorProducts = parseBoolean(row.sellsCompetitorProducts);

    const { score, temperature } = calculateLeadScore({
      sellsDogTreats,
      sellsCompetitorProducts,
      leadType: row.leadType ?? undefined,
      hasWebsite: !!row.website,
      hasPhone: !!row.phone,
      hasEmail: !!row.email,
      hasInstagram: false,
    });

    try {
      const lead = await prisma.lead.create({
        data: {
          businessName: row.businessName,
          contactName: row.contactName || "Unknown",
          email: row.email,
          phone: row.phone || null,
          website: row.website || null,
          city: row.city || null,
          state: row.state || null,
          leadType: row.leadType || null,
          sellsDogTreats,
          sellsCompetitorProducts,
          leadScore: score,
          leadTemperature: temperature,
          source: "CSV_IMPORT",
        },
      });
      created.push(lead.id);
    } catch {
      errors.push(`Failed to import: ${row.email}`);
    }
  }

  return NextResponse.json({ created: created.length, errors }, { status: 201 });
}
