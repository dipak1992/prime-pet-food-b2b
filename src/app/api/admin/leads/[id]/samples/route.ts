import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const samples = await prisma.leadSample.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ samples });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  await req.json();

  const sample = await prisma.leadSample.create({
    data: { leadId: id, status: "REQUESTED" },
  });

  await prisma.leadActivity.create({
    data: { leadId: id, type: "SAMPLE_REQUESTED", title: "Sample pack requested" },
  });

  return NextResponse.json({ sample }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { sampleId, status, trackingNumber, shippedAt, deliveredAt, feedback } = await req.json() as {
    sampleId?: string;
    status?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
    feedback?: string;
  };

  if (!sampleId) return NextResponse.json({ error: "sampleId is required" }, { status: 400 });

  const sample = await prisma.leadSample.update({
    where: { id: sampleId, leadId: id },
    data: {
      ...(status !== undefined && { status }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(shippedAt !== undefined && { shippedAt: new Date(shippedAt) }),
      ...(deliveredAt !== undefined && { deliveredAt: new Date(deliveredAt) }),
      ...(feedback !== undefined && { feedback }),
    },
  });

  if (status === "SHIPPED") {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "SAMPLE_SHIPPED",
        title: trackingNumber ? `Sample shipped: ${trackingNumber}` : "Sample shipped",
      },
    });
  }

  return NextResponse.json({ sample });
}
