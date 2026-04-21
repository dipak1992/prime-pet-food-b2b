import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, lastLoginAt: true } },
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: true, invoice: true },
      },
      supportRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    customer: {
      ...customer,
      freeShippingThreshold: Number(customer.freeShippingThreshold),
      orders: customer.orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        grandTotal: Number(o.grandTotal),
        invoice: o.invoice ? { ...o.invoice, amount: Number(o.invoice.amount) } : null,
        items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice) })),
      })),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { tier, accountStatus, defaultTerms, freeShippingThreshold, adminNotes, suspendedReason } = body;

  const existingCustomer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, userId: true, accountStatus: true },
  });

  if (!existingCustomer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextStatus = accountStatus ?? existingCustomer.accountStatus;
  const isSuspending = nextStatus === "SUSPENDED" && existingCustomer.accountStatus !== "SUSPENDED";
  const isReactivating = nextStatus === "APPROVED" && existingCustomer.accountStatus === "SUSPENDED";

  const updated = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.update({
      where: { id },
      data: {
        ...(tier && { tier }),
        ...(accountStatus && { accountStatus: nextStatus }),
        ...(defaultTerms !== undefined && { defaultTerms }),
        ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(suspendedReason !== undefined && { suspendedReason: suspendedReason || null }),
        ...(isSuspending ? { suspendedAt: new Date(), reactivatedAt: null } : {}),
        ...(isReactivating ? { reactivatedAt: new Date() } : {}),
      },
    });

    if (accountStatus && nextStatus !== existingCustomer.accountStatus) {
      await tx.user.update({
        where: { id: existingCustomer.userId },
        data: { status: nextStatus },
      });
    }

    return customer;
  });

  return NextResponse.json({ customer: { ...updated, freeShippingThreshold: Number(updated.freeShippingThreshold) } });
}
