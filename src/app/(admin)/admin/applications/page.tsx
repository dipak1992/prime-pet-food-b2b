import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import { ApplicationReviewCard } from "@/components/admin/ApplicationReviewCard";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await prisma.wholesaleApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const emails = applications.map((application) => application.email.toLowerCase());
  const businessNames = applications.map((application) => application.businessName.toLowerCase());
  const matchedLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { email: { in: emails, mode: "insensitive" } },
        { businessName: { in: businessNames, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      businessName: true,
      email: true,
      source: true,
      status: true,
      leadScore: true,
      leadTemperature: true,
      createdAt: true,
    },
  });

  const leadsByEmail = new Map(matchedLeads.map((lead) => [lead.email.toLowerCase(), lead]));
  const leadsByBusiness = new Map(matchedLeads.map((lead) => [lead.businessName.toLowerCase(), lead]));

  return (
    <SectionCard title="Wholesale applications" description="Review and approve pending applicants.">
      <div className="space-y-3 text-sm">
        {applications.map((application) => {
          const matchedLead =
            leadsByEmail.get(application.email.toLowerCase()) ||
            leadsByBusiness.get(application.businessName.toLowerCase()) ||
            null;

          return (
            <ApplicationReviewCard
              key={application.id}
              application={{
                ...application,
                monthlyOrderEstimate: application.monthlyOrderEstimate
                  ? Number(application.monthlyOrderEstimate)
                  : null,
              }}
              attribution={matchedLead}
            />
          );
        })}
      </div>
    </SectionCard>
  );
}
