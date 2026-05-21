import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type  = searchParams.get('type');
    const start = searchParams.get('start');
    const end   = searchParams.get('end');
    const empId = searchParams.get('empId');
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const year  = searchParams.get('year')  ? parseInt(searchParams.get('year')!)  : undefined;

    const dateFilter: any = {};
    if (start) dateFilter.gte = new Date(start);
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    // ── Attendance ────────────────────────────────────────────────────────────
    if (type === 'attendance') {
      const where: any = {};
      if (start || end) where.checkInTime = dateFilter;
      if (empId && empId !== 'all') where.employeeId = empId;

      const data = await prisma.attendance.findMany({
        where,
        include: { employee: { select: { fullName: true, jobTitle: true } } },
        orderBy: { checkInTime: 'desc' },
      });
      return NextResponse.json(data);
    }

    // ── Estimated salary (by attendance hours) ────────────────────────────────
    if (type === 'salary') {
      const attFilter: any = { checkOutTime: { not: null } };
      if (start || end) attFilter.checkInTime = dateFilter;

      const employees = await prisma.employeeProfile.findMany({
        where: empId && empId !== 'all' ? { id: empId } : {},
        include: { attendances: { where: attFilter } },
        orderBy: { fullName: 'asc' },
      });

      const data = employees.map(emp => ({
        id:         emp.id,
        fullName:   emp.fullName,
        jobTitle:   emp.jobTitle,
        hourlyRate: emp.hourlyRate,
        totalHours: emp.attendances.reduce((s, a) => s + (a.totalHours || 0), 0),
      }));
      return NextResponse.json(data);
    }

    // ── Confirmed payroll (from Payroll records) ──────────────────────────────
    if (type === 'payroll') {
      const where: any = {};
      if (empId && empId !== 'all') where.employeeId = empId;
      if (month) where.month = month;
      if (year)  where.year  = year;

      const data = await prisma.payroll.findMany({
        where,
        include: { employee: { select: { fullName: true, jobTitle: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
      });
      return NextResponse.json(data);
    }

    // ── Leave requests ────────────────────────────────────────────────────────
    if (type === 'leave') {
      const where: any = {};
      if (start || end) where.startDate = dateFilter;
      if (empId && empId !== 'all') where.employeeId = empId;

      const data = await prisma.leaveRequest.findMany({
        where,
        include: { employee: { select: { fullName: true, jobTitle: true } } },
        orderBy: { startDate: 'desc' },
      });
      return NextResponse.json(data);
    }

    // ── Penalties ─────────────────────────────────────────────────────────────
    if (type === 'penalties') {
      const where: any = {};
      if (start || end) where.date = dateFilter;
      if (empId && empId !== 'all') where.employeeId = empId;

      const data = await prisma.penaltyNote.findMany({
        where,
        include: { employee: { select: { fullName: true, jobTitle: true } } },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
