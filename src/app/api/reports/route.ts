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
    const type = searchParams.get('type');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const empId = searchParams.get('empId');

    const dateFilter: any = {};
    if (start) dateFilter.gte = new Date(start);
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    if (type === 'attendance') {
      const where: any = { checkInTime: dateFilter };
      if (empId !== 'all') where.employeeId = empId;
      
      const data = await prisma.attendance.findMany({
        where,
        include: { employee: true },
        orderBy: { checkInTime: 'desc' }
      });
      return NextResponse.json(data);
    }

    if (type === 'salary') {
      const employees = await prisma.employeeProfile.findMany({
        where: empId && empId !== 'all' ? { id: empId } : {},
        include: {
          attendances: {
            where: { checkInTime: dateFilter, checkOutTime: { not: null } }
          }
        }
      });

      const data = employees.map(emp => {
        const totalHours = emp.attendances.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
        return {
          id: emp.id,
          fullName: emp.fullName,
          hourlyRate: emp.hourlyRate,
          totalHours
        };
      });
      return NextResponse.json(data);
    }

    if (type === 'leave') {
      const where: any = { startDate: dateFilter };
      if (empId !== 'all') where.employeeId = empId;

      const data = await prisma.leaveRequest.findMany({
        where,
        include: { employee: true },
        orderBy: { startDate: 'desc' }
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
