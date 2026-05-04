import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          customer: {
            include: {
              user: { select: { name: true, email: true } },
              addresses: {
                orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
      transactions: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "quickbooks.companyId",
          "quickbooks.invoicePrefix",
          "ach.bankName",
          "ach.routingLast4",
          "ach.instructions",
          "ach.remittanceEmail",
        ],
      },
    },
  });
  const settingsMap = new Map(settings.map((setting) => [setting.key, setting.value]));
  const address = invoice.order.customer.addresses[0];

  const payload = {
    integration: "quickbooks-online",
    companyId: settingsMap.get("quickbooks.companyId") || "",
    invoiceNumber: `${settingsMap.get("quickbooks.invoicePrefix") || ""}${invoice.invoiceNumber}`,
    customer: {
      displayName: invoice.order.customer.businessName,
      primaryEmail: invoice.order.customer.user.email,
      contactName: invoice.order.customer.user.name,
      billingAddress: address
        ? {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.zip,
            country: address.country,
          }
        : null,
    },
    dates: {
      invoiceDate: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || null,
    },
    lineItems: invoice.order.items.map((item) => ({
      sku: item.skuSnapshot,
      description: item.productTitleSnapshot,
      quantity: item.quantity,
      unitAmount: Number(item.unitPrice),
      amount: Number(item.totalPrice),
    })),
    totals: {
      subtotal: Number(invoice.order.subtotal),
      shipping: Number(invoice.order.shippingTotal),
      tax: Number(invoice.order.taxTotal),
      discount: Number(invoice.order.discountTotal),
      total: Number(invoice.amount),
    },
    paymentInstructions: {
      method: "ACH preferred",
      bankName: settingsMap.get("ach.bankName") || "",
      routingLast4: settingsMap.get("ach.routingLast4") || "",
      remittanceEmail: settingsMap.get("ach.remittanceEmail") || "",
      instructions: settingsMap.get("ach.instructions") || "ACH details will be provided on the invoice.",
    },
  };

  const existingExport = invoice.transactions.find(
    (transaction) =>
      transaction.provider === "quickbooks_export" &&
      transaction.providerRef === payload.invoiceNumber
  );

  if (existingExport) {
    await prisma.paymentTransaction.update({
      where: { id: existingExport.id },
      data: { status: "EXPORTED", amount: invoice.amount },
    });
  } else {
    await prisma.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        provider: "quickbooks_export",
        providerRef: payload.invoiceNumber,
        amount: invoice.amount,
        status: "EXPORTED",
      },
    });
  }

  return NextResponse.json({ payload });
}
