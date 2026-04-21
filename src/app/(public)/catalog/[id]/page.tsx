import { getPublicSessionInfo } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LockedPriceCard } from "@/components/gated/LockedPriceCard";
import { GatedCartButton } from "@/components/gated/GatedCartButton";
import { ApprovalPendingPriceCard, ApprovalPendingCartButton } from "@/components/gated/ApprovalPendingNotice";

export const dynamic = "force-dynamic";

export default async function CatalogProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getPublicSessionInfo();

  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
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

  if (!product) notFound();

  const isApproved = session.isApproved;
  const isPending = session.isLoggedIn && session.status === "PENDING";

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#9ca3af]">
          <Link href="/catalog" className="hover:text-[#1d4b43]">Catalog</Link>
          <span>/</span>
          <span className="text-[#111827]">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f3f4f6]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#9ca3af]">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
            {product.isBestSeller && (
              <span className="absolute left-3 top-3 rounded-full bg-[#1d4b43] px-3 py-1 text-xs font-semibold text-white">
                Best seller
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{product.sku}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">{product.title}</h1>
              {product.category && (
                <span className="mt-2 inline-block rounded-full bg-[#f0f7f5] px-3 py-0.5 text-xs font-medium text-[#1d4b43]">
                  {product.category}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-[#4b5563] leading-relaxed">{product.description}</p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  product.stockStatus === "IN_STOCK"
                    ? "bg-green-500"
                    : product.stockStatus === "LOW_STOCK"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-[#6b7280]">
                {product.stockStatus === "IN_STOCK"
                  ? "In stock"
                  : product.stockStatus === "LOW_STOCK"
                  ? "Low stock"
                  : "Out of stock"}
              </span>
            </div>

            {/* MSRP */}
            {product.msrp && (
              <p className="text-sm text-[#9ca3af]">
                Retail price (MSRP): <span className="font-medium">${Number(product.msrp).toFixed(2)}</span>
              </p>
            )}

            {/* Gate */}
            <div className="flex flex-col gap-3 pt-2">
              {isApproved ? (
                <Link
                  href={`/products/${product.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4b43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163d36]"
                >
                  View wholesale pricing & order
                </Link>
              ) : isPending ? (
                <>
                  <ApprovalPendingPriceCard />
                  <ApprovalPendingCartButton />
                </>
              ) : (
                <>
                  <LockedPriceCard />
                  <GatedCartButton />
                </>
              )}
            </div>

            {!isApproved && (
              <p className="text-xs text-[#9ca3af]">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-[#1d4b43]">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
