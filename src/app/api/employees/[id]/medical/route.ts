import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', id, 'medical');
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const path = join(uploadsDir, fileName);
    await writeFile(path, buffer);

    const fileUrl = `/uploads/${id}/medical/${fileName}`;

    const report = await prisma.medicalReport.create({
      data: {
        employeeId: id,
        title: title || file.name,
        fileUrl,
        uploaderId: session.user.id
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const report = await prisma.medicalReport.findUnique({ where: { id: reportId } });
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      const filePath = join(process.cwd(), 'public', report.fileUrl);
      if (existsSync(filePath)) await unlink(filePath);
    } catch (e) {}

    await prisma.medicalReport.delete({ where: { id: reportId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
