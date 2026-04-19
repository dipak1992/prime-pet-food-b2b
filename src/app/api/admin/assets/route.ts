import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const { title, type, fileUrl, visibility } = body;

  if (!title || !type || !fileUrl) {
    return NextResponse.json({ error: "title, type, and fileUrl are required" }, { status: 400 });
  }

  const asset = await prisma.asset.create({
    data: {
      title,
      type,
      fileUrl,
      visibility: visibility || "APPROVED_BUYERS",
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
