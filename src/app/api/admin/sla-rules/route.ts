import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const DEFAULT_RULES = [
  { workflow: "APPLICATION_REVIEW", requestType: null, hours: 24 },
  { workflow: "QUOTE_REQUEST", requestType: "CUSTOM_PRICING", hours: 24 },
  { workflow: "QUOTE_REQUEST", requestType: "SAMPLE_REQUEST", hours: 48 },
  { workflow: "QUOTE_REQUEST", requestType: "SALES_REP", hours: 24 },
  { workflow: "ORDER_INVOICE", requestType: null, hours: 4 },
  { workflow: "TRACKING_UPDATE", requestType: null, hours: 24 },
  { workflow: "OVERDUE_INVOICE_FOLLOWUP", requestType: null, hours: 72 },
];

export async function GET() {
  await requireAdmin();

  if ((await prisma.slaRule.count()) === 0) {
    await prisma.slaRule.createMany({ data: DEFAULT_RULES });
  }

  const rules = await prisma.slaRule.findMany({
    orderBy: [{ workflow: "asc" }, { requestType: "asc" }],
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = await req.json();
  const workflow = typeof body.workflow === "string" ? body.workflow.trim().toUpperCase() : "";
  const requestType = typeof body.requestType === "string" && body.requestType.trim()
    ? body.requestType.trim().toUpperCase()
    : null;
  const priority = typeof body.priority === "string" && body.priority.trim()
    ? body.priority.trim().toLowerCase()
    : null;
  const hours = Number(body.hours);

  if (!workflow || !Number.isInteger(hours) || hours <= 0) {
    return NextResponse.json({ error: "workflow and positive integer hours are required" }, { status: 400 });
  }

  const rule = await prisma.slaRule.create({
    data: {
      workflow,
      requestType,
      priority,
      hours,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const rule = await prisma.slaRule.update({
    where: { id },
    data: {
      ...(body.hours !== undefined && { hours: Number(body.hours) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    },
  });

  return NextResponse.json({ rule });
}
