import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wholesaleApplicationSchema } from "@/lib/validations/wholesaleApplication";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = wholesaleApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.wholesaleApplication.create({
    data: {
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      website: parsed.data.website || null,
      businessType: parsed.data.businessType,
      taxId: parsed.data.taxId || null,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      monthlyOrderEstimate:
        typeof parsed.data.monthlyOrderEstimate === "number"
          ? parsed.data.monthlyOrderEstimate
          : null,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
