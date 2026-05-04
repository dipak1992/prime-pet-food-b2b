import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

function settingKey(leadId: string) {
  return `lead-owner:${leadId}`;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const setting = await prisma.setting.findUnique({ where: { key: settingKey(id) } });
  return NextResponse.json({
    ownership: setting
      ? JSON.parse(setting.value)
      : { ownerName: "", ownerEmail: "", nextFollowUpAt: "", notes: "" },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const ownership = {
    ownerName: String(body.ownerName || "").trim(),
    ownerEmail: String(body.ownerEmail || "").trim(),
    nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt).toISOString() : "",
    notes: String(body.notes || "").trim(),
  };

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, businessName: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: settingKey(id) },
      create: { key: settingKey(id), value: JSON.stringify(ownership) },
      update: { value: JSON.stringify(ownership) },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "OWNER_UPDATED",
        title: ownership.ownerName
          ? `Assigned to ${ownership.ownerName}`
          : "Sales ownership cleared",
        detail: ownership.nextFollowUpAt
          ? `Next follow-up: ${new Date(ownership.nextFollowUpAt).toLocaleString()}`
          : ownership.notes || null,
      },
    }),
  ]);

  return NextResponse.json({ ownership });
}
