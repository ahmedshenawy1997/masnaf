import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("POST /api/employees/[id]/penalties - ID:", id);
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, description } = await req.json();
    console.log("Payload:", { type, description });

    if (!type || !description) {
      return NextResponse.json({ error: "Missing type or description" }, { status: 400 });
    }

    const penalty = await prisma.penaltyNote.create({
      data: {
        employeeId: id,
        type,
        description,
        adminId: (session.user as any).id
      }
    });

    console.log("Penalty created successfully:", penalty.id);
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath(`/dashboard/employees/[id]`, "page");
    
    return NextResponse.json(penalty);
  } catch (error: any) {
    console.error("Penalty creation error details:", error);
    return NextResponse.json({ error: "Creation failed: " + (error.message || "Unknown error") }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const penaltyId = searchParams.get('penaltyId');

    if (!penaltyId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.penaltyNote.delete({ where: { id: penaltyId } });
    revalidatePath(`/dashboard/employees/${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Penalty deletion error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
