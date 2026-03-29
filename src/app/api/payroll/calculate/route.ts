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
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    // Start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: { select: { username: true } },
        attendances: {
          where: {
            checkInTime: {
              gte: startDate,
              lte: endDate
            },
            checkOutTime: { not: null }
          }
        },
        payrollRecords: {
          where: { month, year }
        }
      }
    });

    const report = employees.map(emp => {
      const totalHours = emp.attendances.reduce((sum, att) => sum + (att.totalHours || 0), 0);
      const baseSalary = totalHours * emp.hourlyRate;
      const existingPayroll = emp.payrollRecords[0] || null;

      return {
        id: emp.id,
        fullName: emp.fullName,
        jobTitle: emp.jobTitle,
        username: emp.user.username,
        hourlyRate: emp.hourlyRate,
        totalHours,
        baseSalary,
        existingPayroll
      };
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Payroll calculation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
