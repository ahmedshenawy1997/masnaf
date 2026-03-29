import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Resolve profile ID (params.id might be userId or profileId)
    // DEBUG:
    // console.log("Prisma keys:", Object.keys(prisma));
    
    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
    }

    const employeeId = profile.id;

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const start = startOfMonth(new Date(targetYear, targetMonth));
    const end = endOfMonth(new Date(targetYear, targetMonth));

    // Current month hours
    const attendancesMonth = await prisma.attendance.findMany({
      where: {
        employeeId,
        checkInTime: { gte: start, lte: end },
        checkOutTime: { not: null }
      }
    });

    // All time hours
    const attendancesAll = await prisma.attendance.findMany({
      where: {
        employeeId,
        checkOutTime: { not: null }
      }
    });

    // All time settled payrolls
    const payrolls = await prisma.payroll.findMany({
      where: { employeeId }
    });

    // Payrolls for selected month only
    const payrollsMonth = await prisma.payroll.findMany({
      where: {
        employeeId,
        month: targetMonth + 1, // targetMonth is 0-indexed
        year: targetYear
      }
    });

    const totalHoursMonth = attendancesMonth.reduce((acc: number, curr: { totalHours: number | null }) => acc + (curr.totalHours || 0), 0);
    const totalHoursAllTime = attendancesAll.reduce((acc: number, curr: { totalHours: number | null }) => acc + (curr.totalHours || 0), 0);
    const totalHoursSettled = payrolls.reduce((acc: number, curr: { totalHours: number }) => acc + (curr.totalHours || 0), 0);
    const totalPaidAllTime = payrolls.reduce((acc: number, curr: { netAmount: number }) => acc + (curr.netAmount || 0), 0);
    const totalPaidMonth = payrollsMonth.reduce((acc: number, curr: { netAmount: number }) => acc + (curr.netAmount || 0), 0);

    return NextResponse.json({ 
      totalHoursMonth, 
      totalHoursAllTime, 
      totalHoursSettled,
      totalPaidAllTime,
      totalPaidMonth,
      remainingHours: Math.max(0, totalHoursAllTime - totalHoursSettled)
    });
  } catch (error: any) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
