import { NextResponse } from "next/server";
import { trackAttributionEvent } from "@/lib/attribution";
import { sendEmail } from "@/lib/email";
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

    const matchedLead = await tx.lead.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { businessName: { equals: parsed.data.businessName, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (matchedLead) {
      await tx.lead.update({
        where: { id: matchedLead.id },
        data: {
          status: matchedLead.status === "CONVERTED" ? "CONVERTED" : "QUALIFIED",
          contactedAt: matchedLead.contactedAt ?? new Date(),
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: matchedLead.id,
          type: "APPLICATION",
          title: "Wholesale application submitted",
          detail: `${parsed.data.businessName} applied for wholesale access using ${email}.`,
        },
      });
    }

    return created;
  });

  await trackAttributionEvent({
    email,
    businessName: application.businessName,
    source: typeof body.source === "string" ? body.source : "wholesale_application",
    medium: typeof body.medium === "string" ? body.medium : "public_site",
    campaign: typeof body.campaign === "string" ? body.campaign : null,
    content: typeof body.content === "string" ? body.content : null,
    term: typeof body.term === "string" ? body.term : null,
    page: typeof body.page === "string" ? body.page : "/apply",
    eventType: "wholesale_application",
    metadata: {
      applicationId: application.id,
      businessType: application.businessType,
      monthlyOrderEstimate: application.monthlyOrderEstimate
        ? Number(application.monthlyOrderEstimate)
        : null,
    },
  }).catch((error) => {
    console.error("Failed to track application attribution:", error);
  });

  await sendEmail({
    to: email,
    template: "application-received",
    variables: {
      businessName: application.businessName,
    },
  }).catch((error) => {
    console.error("Failed to send application confirmation email", error);
  });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
