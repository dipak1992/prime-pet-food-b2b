import { requireAdmin } from "@/lib/auth/guards";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#f7f7fb] text-[#111827]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
