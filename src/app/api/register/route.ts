import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    console.log("Public Register: Received keys:", Array.from(formData.keys()));
    
    // Auth info
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    // Profile info
    const fullName = formData.get('fullName') as string;
    const jobTitle = (formData.get('jobTitle') as string) || "";
    const phoneNumber = (formData.get('phoneNumber') as string) || "";
    const nationalId = formData.get('nationalId') as string;
    const address = (formData.get('address') as string) || "";
    const hourlyRateStr = (formData.get('hourlyRate') as string) || '0';
    const idFile = formData.get('idPhoto') as File | null;

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
    if (!idFile || (idFile instanceof File && idFile.size === 0)) {
      return NextResponse.json({ error: "National ID photo is required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Check if national ID exists
    const existingProfile = await prisma.employeeProfile.findUnique({ where: { nationalId } });
    if (existingProfile) {
      return NextResponse.json({ error: "National ID already registered" }, { status: 400 });
    }

    // Handle ID photo upload
    let idPhotoUrl = "";
    try {
      const bytes = await idFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'ids');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${username}-${idFile.name.replace(/\s+/g, '-')}`;
      const path = join(uploadDir, fileName);
      await writeFile(path, buffer);
      idPhotoUrl = `/uploads/ids/${fileName}`;
      console.log("Public Register: Photo uploaded:", idPhotoUrl);
    } catch (err) {
      console.error("Public Register: Upload error:", err);
      return NextResponse.json({ error: "Photo upload process failed" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Profile in a transaction
    const newUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
          role: 'EMPLOYEE',
        }
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          fullName,
          jobTitle,
          phoneNumber,
          nationalId,
          address,
          dateOfHiring: new Date(),
          hourlyRate: parseFloat(hourlyRateStr) || 0,
          idPhoto: idPhotoUrl,
        }
      });

      return user;
    });

    console.log("Public Register: Success for", newUser.username);
    return NextResponse.json({ message: "Registration successful", userId: newUser.id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
  }
}
