import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let updateData: any = {};

    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] }
    });

    if (!profile) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN';
    const isOwner = session.user.id === profile.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const nationalId = formData.get('nationalId') as string;
      const phoneNumber = formData.get('phoneNumber') as string;
      const address = formData.get('address') as string;
      const healthFile = formData.get('healthCertificate') as File | null;

      if (nationalId) updateData.nationalId = nationalId;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (address) updateData.address = address;

      // ID Photo
      const file = formData.get('idPhoto') as File | null;
      if (file && file.size > 0) {
        try {
          const uploadsDir = join(process.cwd(), 'public', 'uploads', profile.userId, 'id');
          if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
          const fileName = `${Date.now()}-id-${file.name.replace(/\s+/g, '-')}`;
          const path = join(uploadsDir, fileName);
          const buffer = Buffer.from(await file.arrayBuffer());
          await writeFile(path, buffer);
          updateData.idPhoto = `/uploads/${profile.userId}/id/${fileName}`;
        } catch (fileErr: any) {
          console.error("ID photo upload error:", fileErr);
          throw new Error(`ID Photo upload failed: ${fileErr.message}`);
        }
      }

      // Health Certificate
      if (healthFile && healthFile.size > 0) {
        try {
          const hDir = join(process.cwd(), 'public', 'uploads', profile.userId, 'health');
          if (!existsSync(hDir)) await mkdir(hDir, { recursive: true });
          const fileName = `${Date.now()}-health-${healthFile.name.replace(/\s+/g, '-')}`;
          const path = join(hDir, fileName);
          const buffer = Buffer.from(await healthFile.arrayBuffer());
          await writeFile(path, buffer);
          updateData.healthCertificate = `/uploads/${profile.userId}/health/${fileName}`;
        } catch (healthErr: any) {
          console.error("Health certificate upload error:", healthErr);
          throw new Error(`Health certificate upload failed: ${healthErr.message}`);
        }
      }
    } else {
      const body = await req.json();
      if (isAdmin && body.hourlyRate !== undefined) updateData.hourlyRate = parseFloat(body.hourlyRate);
      if (body.nationalId !== undefined) updateData.nationalId = body.nationalId;
      if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.healthCertificate !== undefined) updateData.healthCertificate = body.healthCertificate;
    }

    // Only update if there is data
    if (Object.keys(updateData).length === 0) {
       return NextResponse.json(profile);
    }

    const updated = await prisma.employeeProfile.update({
      where: { id: profile.id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update employee error:", err);
    return NextResponse.json({ error: err.message || "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("API: Deleting employee with ID:", id);

  try {
    const session = await getServerSession(authOptions);
    console.log("API: Session check:", session?.user?.role);
    
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the profile to get the userId
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      }
    });

    if (!profile) {
      console.log("API: Profile NOT found for ID:", id);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    console.log("API: Found profile. Deleting User:", profile.userId);

    // Deleting the user should cascade-delete EVERYTHING including the profile
    await prisma.user.delete({
      where: { id: profile.userId }
    });

    console.log("API: Delete SUCCESSFUL");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API: DELETE ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to delete employee", 
      details: error.message 
    }, { status: 500 });
  }
}
