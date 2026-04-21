import { getPublicSessionInfo } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { GatedBanner } from "@/components/gated/GatedBanner";
import { ApprovalPendingBanner } from "@/components/gated/ApprovalPendingNotice";
import { RejectedAccessBanner } from "@/components/gated/RejectedAccessNotice";
import { SuspendedAccessBanner } from "@/components/gated/SuspendedAccessNotice";
import { LockedPriceCard } from "@/components/gated/LockedPriceCard";
import { ApprovalPendingPriceCard } from "@/components/gated/ApprovalPendingNotice";

export const metadata = {
  title: "Catalog | Prime Pet Food Wholesale",
  description: "Browse our range of premium Himalayan Yak Cheese treats.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const session = await getPublicSessionInfo();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isBestSeller: "desc" }, { title: "asc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      sku: true,
      category: true,
      stockStatus: true,
      isBestSeller: true,
      msrp: true,
    },
  });

  const isApproved = session.isApproved;
  const isPending = session.isLoggedIn && session.status === "PENDING";
  const isRejected = session.isLoggedIn && session.status === "REJECTED";
  const isSuspended = session.isLoggedIn && session.status === "SUSPENDED";
  const isGuest = !session.isLoggedIn;

  return (
    <>
      {isGuest && <GatedBanner />}
      {isPending && <ApprovalPendingBanner />}
      {isRejected && <RejectedAccessBanner />}
      {isSuspended && <SuspendedAccessBanner />}

      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Product catalog</h1>
              <p className="mt-1 text-sm text-[#6b7280]">{products.length} products</p>
            </div>
            <div className="flex items-center gap-3">
              {isApproved ? (
                <Link
                  href="/products"
                  className="rounded-xl bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163d36]"
                >
                  Go to wholesale portal →
                </Link>
              ) : (
                <Link
                  href="/apply"
                  className="rounded-xl border border-[#1d4b43] px-4 py-2 text-sm font-semibold text-[#1d4b43] hover:bg-[#f0f7f5]"
                >
                  Apply for wholesale
                </Link>
              )}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/catalog/${product.id}`}
                className="group flex flex-col rounded-2xl border border-[#e7e4dc] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-[#f3f4f6]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9ca3af]">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                  {product.isBestSeller && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#1d4b43] px-2 py-0.5 text-xs font-semibold text-white">
                      Best seller
                    </span>
                  )}
                  {product.stockStatus === "OUT_OF_STOCK" && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-semibold text-white">
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-xs text-[#9ca3af]">{product.sku}</p>
                  <p className="text-sm font-semibold text-[#111827] leading-snug">{product.title}</p>
                  {product.description && (
                    <p className="line-clamp-2 text-xs text-[#6b7280]">{product.description}</p>
                  )}

                  {/* MSRP */}
                  {product.msrp && (
                    <p className="mt-1 text-xs text-[#9ca3af]">
                      MSRP: ${Number(product.msrp).toFixed(2)}
                    </p>
                  )}

                  {/* Price gate */}
                  <div className="mt-auto pt-3">
                    {isApproved ? (
                      <span className="text-sm text-[#1d4b43] font-semibold">View wholesale pricing →</span>
                    ) : isPending ? (
                      <ApprovalPendingPriceCard />
                    ) : (
                      <LockedPriceCard />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-24 text-center text-[#9ca3af]">No products available yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
