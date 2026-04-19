import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json({ lead });
}
