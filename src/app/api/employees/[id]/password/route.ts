import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN';

    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true }
    });

    if (!profile) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const isOwner = session.user.id === profile.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    const letters = (newPassword.match(/[a-zA-Z]/g) || []).length;
    if (letters < 2) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تحتوي على حرفين إنجليزيين على الأقل" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: profile.userId },
      data: { passwordHash: hashed }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Password change error:", err);
    return NextResponse.json({ error: "فشل تغيير كلمة المرور" }, { status: 500 });
  }
}
