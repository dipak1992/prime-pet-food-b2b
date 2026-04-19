import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/guards";

export async function GET() {
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, profile });
}
