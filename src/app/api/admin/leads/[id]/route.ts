import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      emails: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      deals: { orderBy: { createdAt: "desc" } },
      samples: { orderBy: { createdAt: "desc" } },
      sequences: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();

  const {
    status, notes, contactName, email, phone,
    leadType, website, address, city, state, zip,
    sellsDogTreats, sellsCompetitorProducts, instagram,
    rating, reviewCount,
  } = body;

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Re-score if scoring fields changed
  const needsRescore =
    "sellsDogTreats" in body || "sellsCompetitorProducts" in body ||
    "email" in body || "phone" in body || "website" in body ||
    "instagram" in body || "leadType" in body || "rating" in body;

  let scoreFields: { leadScore?: number; leadTemperature?: string } = {};
  if (needsRescore) {
    const scoring = calculateLeadScore({
      hasEmail: !!(email ?? existing.email),
      hasPhone: !!(phone ?? existing.phone),
      hasWebsite: !!(website ?? existing.website),
      hasInstagram: !!(instagram ?? existing.instagram),
      sellsDogTreats: !!(sellsDogTreats ?? existing.sellsDogTreats),
      sellsCompetitorProducts: !!(sellsCompetitorProducts ?? existing.sellsCompetitorProducts),
      rating: rating ? parseFloat(rating) : undefined,
      reviewCount: reviewCount ? parseInt(reviewCount) : undefined,
      leadType: (leadType ?? existing.leadType ?? "pet_store") as string,
    });
    scoreFields = { leadScore: scoring.score, leadTemperature: scoring.temperature };
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(contactName !== undefined && { contactName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(leadType !== undefined && { leadType }),
      ...(website !== undefined && { website }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zip !== undefined && { zip }),
      ...(sellsDogTreats !== undefined && { sellsDogTreats }),
      ...(sellsCompetitorProducts !== undefined && { sellsCompetitorProducts }),
      ...(instagram !== undefined && { instagram }),
      ...scoreFields,
    },
  });

  return NextResponse.json({ lead });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
