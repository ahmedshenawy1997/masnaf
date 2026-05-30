import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Create all tables using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmployeeProfile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "jobTitle" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "nationalId" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "dateOfHiring" TIMESTAMP(3) NOT NULL,
        "hourlyRate" DOUBLE PRECISION NOT NULL,
        "profilePhoto" TEXT,
        "idPhoto" TEXT,
        "healthCertificate" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeProfile_nationalId_key" ON "EmployeeProfile"("nationalId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "uploaderId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "checkInTime" TIMESTAMP(3) NOT NULL,
        "checkOutTime" TIMESTAMP(3),
        "totalHours" DOUBLE PRECISION,
        "checkInLat" DOUBLE PRECISION,
        "checkInLng" DOUBLE PRECISION,
        "checkOutLat" DOUBLE PRECISION,
        "checkOutLng" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LeaveRequest" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "adminId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MedicalReport" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "leaveId" TEXT,
        "title" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "uploaderId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "MedicalReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PenaltyNote" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "adminId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PenaltyNote_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "PenaltyNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DailyFinancial" (
        "id" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DailyFinancial_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "DailyFinancial_date_key" ON "DailyFinancial"("date");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" TEXT NOT NULL,
        "dailyFinancialId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'other',
        "invoiceNumber" TEXT,
        "receiptUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Expense_dailyFinancialId_fkey" FOREIGN KEY ("dailyFinancialId") REFERENCES "DailyFinancial"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PurchaseInvoice" (
        "id" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "invoiceNumber" TEXT,
        "category" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "uploaderId" TEXT NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Payroll" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "month" INTEGER NOT NULL,
        "year" INTEGER NOT NULL,
        "totalHours" DOUBLE PRECISION NOT NULL,
        "hourlyRate" DOUBLE PRECISION NOT NULL,
        "netAmount" DOUBLE PRECISION NOT NULL,
        "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "advance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "adminId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PAID',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notice" (
        "id" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "adminId" TEXT,
        CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "JobCategory" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "JobCategory_name_key" ON "JobCategory"("name");
    `);

    // Create admin user
    const username = 'admin';
    const password = 'adminpassword';
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM "User" WHERE username = $1 LIMIT 1`,
      username
    ) as Array<{ id: string }>;

    let userId: string;
    if (existing.length === 0) {
      const { randomBytes } = await import('crypto');
      userId = randomBytes(12).toString('base64url');
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, username, "passwordHash", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'SUPERADMIN', NOW(), NOW())`,
        userId,
        username,
        passwordHash
      );
    } else {
      userId = existing[0].id;
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup complete!',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
