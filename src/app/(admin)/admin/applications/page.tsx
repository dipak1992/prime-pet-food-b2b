import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import { ApplicationReviewCard } from "@/components/admin/ApplicationReviewCard";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await prisma.wholesaleApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <SectionCard title="Wholesale applications" description="Review and approve pending applicants.">
      <div className="space-y-3 text-sm">
        {applications.map((application) => (
          <ApplicationReviewCard key={application.id} application={application} />
        ))}
      </div>
    </SectionCard>
  );
}
