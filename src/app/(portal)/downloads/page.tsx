import { SectionCard } from "@/components/ui/SectionCard";
import { prisma } from "@/lib/prisma";

const staticAssets = [
  {
    title: "Yak cheese wholesale sell sheet",
    type: "SELL_SHEET",
    fileUrl: "/downloads/prime-pet-yak-cheese-sell-sheet.txt",
  },
  {
    title: "Shelf talker copy pack",
    type: "MERCHANDISING",
    fileUrl: "/downloads/prime-pet-shelf-talker-copy.txt",
  },
  {
    title: "Brand asset usage guide",
    type: "BRAND_GUIDE",
    fileUrl: "/downloads/prime-pet-brand-assets-readme.txt",
  },
];

export default async function DownloadsPage() {
  const uploadedAssets = await prisma.asset.findMany({
    where: { visibility: { in: ["APPROVED_BUYERS", "ALL"] } },
    orderBy: { createdAt: "desc" },
  });
  const assets = [
    ...staticAssets,
    ...uploadedAssets.map((asset) => ({
      title: asset.title,
      type: asset.type,
      fileUrl: asset.fileUrl,
    })),
  ];

  return (
    <SectionCard title="Download center" description="Approved buyers can access sell sheets and assets.">
      <ul className="space-y-3 text-sm text-[#374151]">
        {assets.map((asset) => (
          <li
            key={`${asset.title}-${asset.fileUrl}`}
            className="flex flex-col gap-3 rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-[#111827]">{asset.title}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-[#6b7280]">{asset.type}</p>
            </div>
            <a
              href={asset.fileUrl}
              download
              className="w-fit rounded border border-[#ea580c] px-3 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#f0f7f5]"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
