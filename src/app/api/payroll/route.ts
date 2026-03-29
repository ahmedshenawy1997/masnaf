import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      employeeId, 
      month, 
      year, 
      totalHours, 
      hourlyRate, 
      bonus = 0, 
      deductions = 0, 
      advance = 0,
      notes = ""
    } = await req.json();

    const netAmount = (totalHours * hourlyRate) + bonus - deductions - advance;

    // Check existing
    const existing = await prisma.payroll.findFirst({
      where: { employeeId, month, year }
    });

    if (existing) {
      const updated = await prisma.payroll.update({
        where: { id: existing.id },
        data: {
          totalHours,
          hourlyRate,
          bonus,
          deductions,
          advance,
          netAmount,
          notes,
          adminId: session.user.id,
          updatedAt: new Date()
        }
      });
      return NextResponse.json(updated);
    }

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        year,
        totalHours,
        hourlyRate,
        bonus,
        deductions,
        advance,
        netAmount,
        notes,
        adminId: session.user.id,
        status: "PAID"
      }
    });

    return NextResponse.json(payroll);
  } catch (error: any) {
    console.error("Payroll creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    const payrolls = await prisma.payroll.findMany({
      where: employeeId ? { employeeId } : {},
      orderBy: { createdAt: 'desc' },
      include: { employee: true }
    });

    return NextResponse.json(payrolls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
