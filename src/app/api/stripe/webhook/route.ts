import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function createInvoiceNumber(orderNumber: string): string {
  return `INV-${orderNumber.replace(/^W-/, "")}`;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return;
  }

  const paidAt = new Date();

  await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: { select: { email: true, name: true } } } },
      },
    });

    if (!existingOrder) {
      return;
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: existingOrder.status === "PENDING" ? "CONFIRMED" : existingOrder.status,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: existingOrder.status === "PENDING" ? "CONFIRMED" : existingOrder.status,
        note: "Payment confirmed via Stripe checkout.",
      },
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await tx.invoice.upsert({
      where: { orderId },
      create: {
        orderId,
        invoiceNumber: createInvoiceNumber(existingOrder.orderNumber),
        amount: existingOrder.grandTotal,
        status: "PAID",
        dueDate,
        paidAt,
      },
      update: {
        status: "PAID",
        paidAt,
      },
    });

    await tx.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        provider: "stripe",
        providerRef: session.payment_intent?.toString() || session.id,
        amount: existingOrder.grandTotal,
        status: "SUCCEEDED",
        paidAt,
      },
    });

    if (existingOrder.customer.user.email) {
      await sendEmail({
        to: existingOrder.customer.user.email,
        template: "order-confirmed",
        variables: {
          customerName: existingOrder.customer.user.name || existingOrder.customer.businessName,
          orderNumber: existingOrder.orderNumber,
          amount: Number(existingOrder.grandTotal).toFixed(2),
        },
      });
    }
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return;
  }

  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "UNPAID" },
    data: { status: "CANCELLED" },
  });
}

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === "checkout.session.expired") {
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
