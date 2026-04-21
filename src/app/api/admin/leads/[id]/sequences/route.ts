import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const STEP_DELAYS = [0, 3, 4, 3, 7]; // days offset per step index

function computeNextSendAt(step: number): Date {
  const days = STEP_DELAYS.slice(0, step).reduce((a, b) => a + b, 0);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { step } = (await req.json().catch(() => ({}))) as { step?: number };

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const startStep = step ?? 1;

  // Cancel any existing active sequence
  await prisma.leadFollowUpSequence.updateMany({
    where: { leadId: id, status: "ACTIVE" },
    data: { status: "CANCELLED", completedAt: new Date() },
  });

  const sequence = await prisma.leadFollowUpSequence.create({
    data: {
      leadId: id,
      currentStep: startStep,
      status: "ACTIVE",
      nextSendAt: computeNextSendAt(startStep - 1),
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: id,
      type: "SEQUENCE_STARTED",
      title: `Follow-up sequence started at step ${startStep}`,
    },
  });

  return NextResponse.json({ sequence }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  await prisma.leadFollowUpSequence.updateMany({
    where: { leadId: id, status: "ACTIVE" },
    data: { status: "CANCELLED", completedAt: new Date() },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: id,
      type: "SEQUENCE_CANCELLED",
      title: "Follow-up sequence cancelled",
    },
  });

  return NextResponse.json({ success: true });
}
