import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

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
          <div key={application.id} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
            <p className="font-semibold">{application.businessName}</p>
            <p className="text-[#6b7280]">{application.contactName} • {application.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#6b7280]">{application.status}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
