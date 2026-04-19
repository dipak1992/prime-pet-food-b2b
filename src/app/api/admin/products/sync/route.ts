import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { syncProductsFromShopify } from "@/lib/integrations/shopify/syncProducts";

export async function POST(request: Request) {
  await requireAdmin();

  const payload = (await request.json().catch(() => ({}))) as { limit?: number };
  const limit = typeof payload.limit === "number" ? Math.max(1, Math.min(payload.limit, 500)) : 100;

  const result = await syncProductsFromShopify(limit);

  if (result.status === "FAILED") {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
