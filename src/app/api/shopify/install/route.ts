import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import crypto from "crypto";

export async function GET() {
  await requireAdmin();

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !shop || !appUrl) {
    return NextResponse.json(
      { error: "Missing Shopify configuration. Ensure SHOPIFY_CLIENT_ID, SHOPIFY_STORE_DOMAIN, and NEXT_PUBLIC_APP_URL are set." },
      { status: 500 }
    );
  }

  const scopes = "read_products,read_inventory";
  const redirectUri = `${appUrl}/api/shopify/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const installUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  installUrl.searchParams.set("client_id", clientId);
  installUrl.searchParams.set("scope", scopes);
  installUrl.searchParams.set("redirect_uri", redirectUri);
  installUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(installUrl.toString());
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return response;
}
