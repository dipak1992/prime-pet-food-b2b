import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = [
  "/dashboard",
  "/products",
  "/orders",
  "/invoices",
  "/account",
  "/support",
  "/downloads",
  "/cart",
  "/checkout",
  "/favorites",
  "/bundles",
  "/admin",
  "/api/admin",
  "/api/account",
  "/api/cart",
  "/api/checkout",
  "/api/favorites",
  "/api/invoices",
  "/api/orders",
  "/api/support",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Pass viewAs query param as header for server components
  const viewAs = request.nextUrl.searchParams.get("viewAs");
  if (viewAs) {
    requestHeaders.set("x-view-as", viewAs);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = isProtectedPath(request.nextUrl.pathname);

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
