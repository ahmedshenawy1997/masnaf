import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, startDate, endDate } = body;

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "PENDING"
      }
    });

    return NextResponse.json(leave);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // Await even if not used to satisfy Next.js 15
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leaveId, status } = body;

    const leave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        adminId: session.user.id
      }
    });

    return NextResponse.json(leave);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leave status" }, { status: 500 });
  }
}
