import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.jobCategory.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });

  try {
    const category = await prisma.jobCategory.create({ data: { name: name.trim() } });
    return NextResponse.json(category);
  } catch (err: any) {
    console.error("Category create error:", err);
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: "التصنيف موجود بالفعل" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "فشل إضافة التصنيف" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.jobCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
