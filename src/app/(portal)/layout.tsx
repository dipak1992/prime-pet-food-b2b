import { PortalShell } from "@/components/layout/PortalShell";
import { requireApprovedBuyer } from "@/lib/auth/guards";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedBuyer();
  return <PortalShell>{children}</PortalShell>;
}
