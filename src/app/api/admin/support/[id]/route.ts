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
  const { status, assignedToId } = body;

  const updated = await prisma.supportRequest.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(assignedToId !== undefined && { assignedToId }),
    },
  });

  return NextResponse.json({ supportRequest: updated });
}
