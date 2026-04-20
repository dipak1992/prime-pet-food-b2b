import { NextRequest, NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

async function getCustomerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { authUserId: userId },
    select: { customer: { select: { id: true } } },
  });
  return user?.customer?.id ?? null;
}

export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customerId = await getCustomerId(profile.userId);
  if (!customerId) return NextResponse.json({ addresses: [] });

  const addresses = await prisma.address.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customerId = await getCustomerId(profile.userId);
  if (!customerId) return NextResponse.json({ error: "No customer profile" }, { status: 400 });

  const body = await req.json();
  const { type, label, line1, line2, city, state, zip, country, isDefault } = body as {
    type?: string;
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    isDefault?: boolean;
  };

  if (!line1 || !city || !state || !zip) {
    return NextResponse.json({ error: "line1, city, state, and zip are required" }, { status: 400 });
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      customerId,
      type: type ?? "SHIPPING",
      label: label ?? "",
      line1: line1.trim(),
      line2: line2?.trim() ?? "",
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country?.trim() ?? "US",
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
