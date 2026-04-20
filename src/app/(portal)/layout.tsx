import { PortalShell } from "@/components/layout/PortalShell";
import { requireApprovedBuyer } from "@/lib/auth/guards";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireApprovedBuyer();
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
