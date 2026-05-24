import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const username = 'admin';
    const password = 'adminpassword';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        passwordHash,
        role: 'SUPERADMIN',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
