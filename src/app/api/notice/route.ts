import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const notice = await prisma.notice.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ notice });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notice" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    // Deactivate previous
    await prisma.notice.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    if (message && message.trim() !== "") {
      const newNotice = await prisma.notice.create({
        data: {
          message,
          adminId: session.user.id,
          isActive: true
        }
      });
      return NextResponse.json({ success: true, notice: newNotice });
    }

    return NextResponse.json({ success: true, notice: null });
  } catch (error) {
    console.error("Notice creation error:", error);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
