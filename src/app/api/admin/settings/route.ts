import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const { key, value } = body;

  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ setting });
}
