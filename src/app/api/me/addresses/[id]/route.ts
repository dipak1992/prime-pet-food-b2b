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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customerId = await getCustomerId(profile.userId);
  if (!customerId) return NextResponse.json({ error: "No customer profile" }, { status: 400 });

  const existing = await prisma.address.findFirst({ where: { id, customerId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { type, label, line1, line2, city, state, zip, country, isDefault } = body as {
    type?: string;
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    isDefault?: boolean;
  };

  if (isDefault) {
    await prisma.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(type !== undefined && { type }),
      ...(label !== undefined && { label }),
      ...(line1 !== undefined && { line1: line1.trim() }),
      ...(line2 !== undefined && { line2: line2.trim() }),
      ...(city !== undefined && { city: city.trim() }),
      ...(state !== undefined && { state: state.trim() }),
      ...(zip !== undefined && { zip: zip.trim() }),
      ...(country !== undefined && { country: country.trim() }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return NextResponse.json({ address });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customerId = await getCustomerId(profile.userId);
  if (!customerId) return NextResponse.json({ error: "No customer profile" }, { status: 400 });

  const existing = await prisma.address.findFirst({ where: { id, customerId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.address.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
