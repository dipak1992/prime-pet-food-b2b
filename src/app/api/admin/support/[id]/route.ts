import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { normalizeQuoteStage } from "@/lib/quote-pipeline";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { status, assignedToId, quoteStage, estimatedValue, nextFollowUpAt, lossReason } = body;

  const updated = await prisma.$transaction(async (tx) => {
    const supportRequest = await tx.supportRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
    });

    const stage = normalizeQuoteStage(quoteStage);
    if (stage || estimatedValue !== undefined || nextFollowUpAt !== undefined || lossReason !== undefined) {
      await tx.quoteRequest.updateMany({
        where: { supportRequestId: id },
        data: {
          ...(stage && { stage }),
          ...(estimatedValue !== undefined && {
            estimatedValue: estimatedValue === "" || estimatedValue === null ? null : Number(estimatedValue),
          }),
          ...(nextFollowUpAt !== undefined && {
            nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
          }),
          ...(lossReason !== undefined && { lossReason: lossReason || null }),
        },
      });
    }

    return supportRequest;
  });

  return NextResponse.json({ supportRequest: updated });
}
