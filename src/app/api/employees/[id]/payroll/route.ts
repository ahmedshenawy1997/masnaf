import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Resolve profile ID
    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      select: { id: true, userId: true }
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Both admin and the employee themselves can see it
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN' && session.user.id !== profile.userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const whereClause: any = { employeeId: profile.id };
    if (monthParam && yearParam) {
      whereClause.month = parseInt(monthParam);
      whereClause.year = parseInt(yearParam);
    }

    const payroll = await prisma.payroll.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payroll);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { month, year, totalHours, hourlyRate, bonus, deductions, advance, notes } = body;
    const netAmount = (Number(totalHours) * Number(hourlyRate)) + Number(bonus || 0) - Number(deductions || 0) - Number(advance || 0);

    // Resolve profile ID (params.id might be userId or profileId)
    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
    }

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: profile.id,
        month: Number(month),
        year: Number(year),
        totalHours: Number(totalHours),
        hourlyRate: Number(hourlyRate),
        bonus: Number(bonus || 0),
        deductions: Number(deductions || 0),
        advance: Number(advance || 0),
        netAmount: Number(netAmount),
        adminId: session.user.id,
        notes,
        status: "PAID"
      }
    });

    return NextResponse.json(payroll);
  } catch (error: any) {
    console.error("Payroll creation error detail:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 });
  }
}
