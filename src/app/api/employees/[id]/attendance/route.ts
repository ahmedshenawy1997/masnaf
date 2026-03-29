import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || '-1');
  const year = parseInt(searchParams.get('year') || '-1');

  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const active = await prisma.attendance.findFirst({
      where: {
        employeeId: id,
        checkOutTime: null
      }
    });

    let historyWhere: any = { employeeId: id };
    if (month !== -1 && year !== -1) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      historyWhere.date = {
        gte: startDate,
        lt: endDate
      };
    }

    const history = await prisma.attendance.findMany({
      where: historyWhere,
      orderBy: { checkInTime: 'desc' }
    });

    return NextResponse.json({ active, history });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: id,
        checkOutTime: null
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Already checked in" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: id,
        checkInTime: new Date(),
        date: new Date(),
        checkInLat: body.lat ? parseFloat(body.lat) : null,
        checkInLng: body.lng ? parseFloat(body.lng) : null,
      }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const active = await prisma.attendance.findFirst({
      where: {
        employeeId: id,
        checkOutTime: null
      }
    });

    if (!active) {
      return NextResponse.json({ error: "No active check-in" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - active.checkInTime.getTime();
    const totalHours = durationMs / (1000 * 60 * 60);

    const attendance = await prisma.attendance.update({
      where: { id: active.id },
      data: {
        checkOutTime,
        totalHours,
        checkOutLat: body.lat ? parseFloat(body.lat) : null,
        checkOutLng: body.lng ? parseFloat(body.lng) : null,
      }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Check-out failed" }, { status: 500 });
  }
}
