import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const hmac = searchParams.get("hmac");
  const shop = searchParams.get("shop") ?? process.env.SHOPIFY_STORE_DOMAIN ?? "";

  // Verify CSRF state
  const cookieState = request.cookies.get("shopify_oauth_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: "Invalid OAuth state — possible CSRF attack." }, { status: 400 });
  }

  // Verify HMAC signature from Shopify
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientSecret) {
    return NextResponse.json({ error: "SHOPIFY_CLIENT_SECRET is not configured." }, { status: 500 });
  }

  const verifyParams = new URLSearchParams(searchParams);
  verifyParams.delete("hmac");
  verifyParams.delete("signature");
  const message = Array.from(verifyParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const expectedHmac = crypto.createHmac("sha256", clientSecret).update(message).digest("hex");

  if (
    !hmac ||
    expectedHmac.length !== hmac.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedHmac, "utf8"), Buffer.from(hmac, "utf8"))
  ) {
    return NextResponse.json({ error: "HMAC verification failed." }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code." }, { status: 400 });
  }

  if (!shop) {
    return NextResponse.json({ error: "Missing shop domain." }, { status: 400 });
  }

  // Exchange authorization code for a permanent access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Shopify token exchange failed:", await tokenRes.text());
    const redirectUrl = new URL("/admin/products", request.url);
    redirectUrl.searchParams.set("shopify", "error");
    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.delete("shopify_oauth_state");
    return response;
  }

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Store access token and shop domain in the Setting table
  await prisma.setting.upsert({
    where: { key: "shopify_access_token" },
    create: { key: "shopify_access_token", value: access_token },
    update: { value: access_token },
  });

  await prisma.setting.upsert({
    where: { key: "shopify_store_domain" },
    create: { key: "shopify_store_domain", value: shop },
    update: { value: shop },
  });

  const redirectUrl = new URL("/admin/products", request.url);
  redirectUrl.searchParams.set("shopify", "connected");
  const response = NextResponse.redirect(redirectUrl.toString());
  response.cookies.delete("shopify_oauth_state");
  return response;
}
