import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
      order: { customerId: profile.customerId },
    },
    include: {
      order: {
        include: {
          customer: true,
          items: true,
        },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // If PDF URL exists, redirect to it
  if (invoice.pdfUrl) {
    return NextResponse.json({
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: invoice.pdfUrl,
      status: invoice.status,
      dueDate: invoice.dueDate,
      amount: Number(invoice.amount),
    });
  }

  // Otherwise return invoice data for client-side rendering
  return NextResponse.json({
    invoiceNumber: invoice.invoiceNumber,
    amount: Number(invoice.amount),
    status: invoice.status,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    order: {
      orderNumber: invoice.order.orderNumber,
      createdAt: invoice.order.createdAt,
      items: invoice.order.items.map((item) => ({
        title: item.productTitleSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.totalPrice),
      })),
      subtotal: Number(invoice.order.subtotal),
      shipping: Number(invoice.order.shippingTotal),
      tax: Number(invoice.order.taxTotal),
      total: Number(invoice.order.grandTotal),
    },
    customer: {
      businessName: invoice.order.customer.businessName,
      email: invoice.order.customer.user?.email,
    },
  });
}
