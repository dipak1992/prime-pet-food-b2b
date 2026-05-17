/**
 * GET   /api/admin/ai/reorders  – List reorder predictions
 * PATCH /api/admin/ai/reorders  – Notify customer or dismiss prediction
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  try {
    const rawPredictions = await prisma.reorderPrediction.findMany({
      where: { status: { in: ["pending", "notified"] } },
      orderBy: [{ predictedDate: "asc" }],
      take: 50,
    });

    // Enrich with customer data
    const predictions = await Promise.all(
      rawPredictions.map(async (p) => {
        const customer = await prisma.customer.findUnique({
          where: { id: p.customerId },
          include: {
            user: { select: { email: true } },
            orders: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { grandTotal: true, createdAt: true },
            },
          },
        });

        const now = new Date();
        const predictedDate = new Date(p.predictedDate);
        let urgency: "overdue" | "high" | "medium" | "low" = "low";
        const daysUntil = Math.floor(
          (predictedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil < 0) urgency = "overdue";
        else if (daysUntil <= 3) urgency = "high";
        else if (daysUntil <= 7) urgency = "medium";

        const lastOrder = customer?.orders[0];

        return {
          id: p.id,
          customerId: p.customerId,
          businessName: customer?.businessName ?? "Unknown",
          email: customer?.user?.email ?? "",
          tier: customer?.tier ?? "BRONZE",
          predictedDate: p.predictedDate,
          confidence: p.confidence,
          urgency,
          reasoning: p.reasoning ?? "",
          suggestedProducts: (p.suggestedProducts as string[]) ?? [],
          estimatedValue: p.estimatedOrderValue ?? 0,
          lastOrderDate: lastOrder?.createdAt
            ? new Date(lastOrder.createdAt).toISOString()
            : new Date().toISOString(),
          lastOrderAmount: lastOrder ? Number(lastOrder.grandTotal) : 0,
          status: p.status,
        };
      })
    );

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Reorders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reorder predictions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await requireAdmin();

  try {
    const body = await request.json();
    const { predictionId, action } = body as {
      predictionId: string;
      action: "notify" | "dismiss";
    };

    if (!predictionId || !action) {
      return NextResponse.json(
        { error: "predictionId and action are required" },
        { status: 400 }
      );
    }

    const prediction = await prisma.reorderPrediction.findUnique({
      where: { id: predictionId },
    });

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    if (action === "notify") {
      const customer = await prisma.customer.findUnique({
        where: { id: prediction.customerId },
        include: { user: { select: { email: true } } },
      });

      if (!customer?.user?.email) {
        return NextResponse.json({ error: "Customer email not found" }, { status: 400 });
      }

      const suggestedProducts = Array.isArray(prediction.suggestedProducts)
        ? prediction.suggestedProducts.filter((item): item is string => typeof item === "string")
        : [];
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

      await sendEmail({
        to: customer.user.email,
        template: "reorder-reminder",
        variables: {
          businessName: customer.businessName,
          products: suggestedProducts.join(", ") || "your previous best sellers",
          productLines: suggestedProducts.join("\n") || "Your previous best sellers",
          reorderUrl: appUrl ? `${appUrl}/quick-order` : "/quick-order",
          subject: "Recommended reorder for your yak chew assortment",
          bodyText:
            prediction.reasoning ||
            "Based on your previous order cadence, your yak chew assortment may be ready for replenishment.",
        },
      });

      await prisma.reorderPrediction.update({
        where: { id: predictionId },
        data: {
          status: "notified",
          notifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Customer notified about reorder opportunity",
      });
    } else {
      await prisma.reorderPrediction.update({
        where: { id: predictionId },
        data: { status: "dismissed" },
      });

      return NextResponse.json({
        success: true,
        message: "Prediction dismissed",
      });
    }
  } catch (error) {
    console.error("Reorder action error:", error);
    return NextResponse.json(
      { error: "Failed to process reorder action" },
      { status: 500 }
    );
  }
}
