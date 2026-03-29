import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    console.log("Received form data keys:", Array.from(formData.keys()));

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const jobTitle = (formData.get('jobTitle') as string) || "";
    const phoneNumber = (formData.get('phoneNumber') as string) || "";
    const nationalId = formData.get('nationalId') as string;
    const address = (formData.get('address') as string) || "";
    const dateOfHiringStr = (formData.get('dateOfHiring') as string);
    const hourlyRateStr = (formData.get('hourlyRate') as string) || "0";
    const idPhotoFile = formData.get('idPhoto') as File | null;

    // Advanced Validation (Server-side)
    const letterCount = (str: string) => (str ? (str.match(/[a-zA-Z]/g) || []).length : 0);

    if (!username || username.length < 8 || letterCount(username) < 2) {
      return NextResponse.json({ error: "Username must be at least 8 characters with 2 letters" }, { status: 400 });
    }
    if (!password || password.length < 8 || letterCount(password) < 2) {
      return NextResponse.json({ error: "Password must be at least 8 characters with 2 letters" }, { status: 400 });
    }
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!nationalId) {
      return NextResponse.json({ error: "National ID is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }
    if (!idPhotoFile || (idPhotoFile instanceof File && idPhotoFile.size === 0)) {
      return NextResponse.json({ error: "ID Photo is required" }, { status: 400 });
    }

    const hRate = parseFloat(hourlyRateStr);
    if (isNaN(hRate)) {
      return NextResponse.json({ error: "Invalid hourly rate" }, { status: 400 });
    }

    const hiringDate = dateOfHiringStr ? new Date(dateOfHiringStr) : new Date();
    if (isNaN(hiringDate.getTime())) {
      return NextResponse.json({ error: "Invalid hiring date" }, { status: 400 });
    }

    // Process file uploads
    let idPhotoUrl = "";
    let healthCertUrl = "";
    
    // Directory mapping
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'ids');
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    // ID Photo (Mandatory)
    try {
      const bytes = await idPhotoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-id-${username}-${idPhotoFile.name.replace(/\s+/g, '-')}`;
      const path = join(uploadsDir, fileName);
      await writeFile(path, buffer);
      idPhotoUrl = `/uploads/ids/${fileName}`;
    } catch (err) {
      return NextResponse.json({ error: "ID Photo upload failed" }, { status: 400 });
    }

    // Health Certificate (Optional)
    const healthFile = formData.get('healthCertificate') as File | null;
    if (healthFile && healthFile.size > 0) {
      try {
        const bytes = await healthFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-health-${username}-${healthFile.name.replace(/\s+/g, '-')}`;
        const path = join(uploadsDir, fileName);
        await writeFile(path, buffer);
        healthCertUrl = `/uploads/ids/${fileName}`;
      } catch (err) {
        console.error("Health cert upload error:", err);
      }
    }

    // Check if user or nationalId already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const existingProfile = await prisma.employeeProfile.findUnique({ where: { nationalId } });
    if (existingProfile) {
      return NextResponse.json({ error: "National ID already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role: "EMPLOYEE",
        profile: {
          create: {
            fullName,
            jobTitle,
            phoneNumber,
            nationalId,
            address,
            dateOfHiring: hiringDate,
            hourlyRate: hRate,
            idPhoto: idPhotoUrl,
            healthCertificate: healthCertUrl || null,
          }
        }
      }
    });

    console.log("Successfully created employee:", result.username);
    return NextResponse.json({ success: true, userId: result.id });
  } catch (error: any) {
    console.error("Employee creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create employee" }, { status: 500 });
  }
}
