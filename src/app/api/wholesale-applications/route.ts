import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wholesaleApplicationSchema } from "@/lib/validations/wholesaleApplication";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = wholesaleApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.wholesaleApplication.create({
      data: {
        businessName: parsed.data.businessName,
        contactName: parsed.data.contactName,
        email,
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

    await tx.user.upsert({
      where: { email },
      create: {
        email,
        name: parsed.data.contactName,
        role: "BUYER",
        status: "PENDING",
      },
      update: {
        name: parsed.data.contactName,
      },
    });

    return created;
  });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
