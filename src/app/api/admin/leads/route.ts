import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

export async function GET(req: NextRequest) {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? undefined;
  const temperature = sp.get("temperature") ?? undefined;
  const leadType = sp.get("leadType") ?? undefined;
  const search = sp.get("search") ?? undefined;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(sp.get("limit") ?? "50"));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (temperature) where.leadTemperature = temperature;
  if (leadType) where.leadType = leadType;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        _count: { select: { emails: true, activities: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const {
    businessName, contactName, email, phone, source, notes,
    leadType, website, address, city, state, zip,
    sellsDogTreats, sellsCompetitorProducts, instagram,
    rating, reviewCount,
  } = body;

  if (!businessName) {
    return NextResponse.json({ error: "businessName is required" }, { status: 400 });
  }

  const scoring = calculateLeadScore({
    hasEmail: !!email,
    hasPhone: !!phone,
    hasWebsite: !!website,
    hasInstagram: !!instagram,
    sellsDogTreats: !!sellsDogTreats,
    sellsCompetitorProducts: !!sellsCompetitorProducts,
    rating: rating ? parseFloat(rating) : undefined,
    reviewCount: reviewCount ? parseInt(reviewCount) : undefined,
    leadType: leadType ?? "pet_store",
  });

  const lead = await prisma.lead.create({
    data: {
      businessName,
      contactName: contactName || "",
      email: email || "",
      phone,
      source: source || "MANUAL",
      notes,
      leadType: leadType || null,
      website: website || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      sellsDogTreats: !!sellsDogTreats,
      sellsCompetitorProducts: !!sellsCompetitorProducts,
      instagram: instagram || null,
      leadScore: scoring.score,
      leadTemperature: scoring.temperature,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
