import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { status, paidAt, dueDate } = body;

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      order: {
        include: {
          customer: { include: { user: { select: { email: true } } } },
        },
      },
    },
  });

  if ((status === "SENT" || status === "PAID") && updated.order.customer.user.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    await sendEmail({
      to: updated.order.customer.user.email,
      template: "invoice-ready",
      variables: {
        invoiceNumber: updated.invoiceNumber,
        invoiceUrl: `${appUrl}/invoices/${updated.id}`,
      },
    }).catch((error) => {
      console.error("Failed to send invoice email", error);
    });
  }

  return NextResponse.json({ invoice: { ...updated, amount: Number(updated.amount) } });
}
