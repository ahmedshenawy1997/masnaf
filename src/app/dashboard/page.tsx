import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import './dashboard.css';
import DashboardClient from './components/DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  // Get start of day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Dashboard Data
  let dashboardData: any = {};

  if (session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN') {
    // Fetch all employees
    const allEmployees = await prisma.employeeProfile.findMany({
      where: { user: { role: 'EMPLOYEE' } },
      select: { id: true, fullName: true, jobTitle: true, profilePhoto: true }
    });

    // Fetch today's attendances with employee info — one record per unique employee
    const todayAttendances = await prisma.attendance.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: {
        employee: {
          select: { id: true, fullName: true, jobTitle: true, profilePhoto: true }
        }
      }
    });

    // Deduplicate: keep only one record per employee
    const seenIds = new Set<string>();
    const uniqueAttendances = todayAttendances.filter(a => {
      if (seenIds.has(a.employeeId)) return false;
      seenIds.add(a.employeeId);
      return true;
    });

    const presentEmployeeIds = new Set(uniqueAttendances.map(a => a.employeeId));
    const presentEmployees = uniqueAttendances.map(a => a.employee);
    const absentEmployees = allEmployees.filter(e => !presentEmployeeIds.has(e.id));
    const currentlyCheckedIn = todayAttendances.filter(a => !a.checkOutTime);
    const seenCheckedIn = new Set<string>();
    const uniqueCheckedIn = currentlyCheckedIn.filter(a => {
      if (seenCheckedIn.has(a.employeeId)) return false;
      seenCheckedIn.add(a.employeeId);
      return true;
    });

    const currentlyCheckedInEmployees = uniqueCheckedIn.map(a => a.employee);

    // Fetch today's approved/pending leaves
    const todayLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      include: {
        employee: {
          select: { id: true, fullName: true, jobTitle: true, profilePhoto: true }
        }
      }
    });

    const onLeaveEmployees = todayLeaves.map(l => l.employee);

    dashboardData = {
      presentToday: presentEmployees.length,
      absentToday: absentEmployees.length,
      currentlyCheckedIn: uniqueCheckedIn.length,
      onLeaveToday: onLeaveEmployees.length,
      totalHoursToday: todayAttendances.reduce((acc: number, curr: any) => acc + (curr.totalHours || 0), 0),
      presentEmployees,
      absentEmployees,
      currentlyCheckedInEmployees,
      onLeaveEmployees,
    };
  } else {
    // Employee Stats
    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (profile) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthAttendances = await prisma.attendance.findMany({
        where: {
          employeeId: profile.id,
          date: { gte: startOfMonth }
        }
      });

      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          employeeId: profile.id,
          date: { gte: startOfDay, lte: endOfDay }
        }
      });

      dashboardData = {
        profileId: profile.id,
        totalHoursMonth: monthAttendances.reduce((acc: number, curr: any) => acc + (curr.totalHours || 0), 0),
        daysWorkedMonth: monthAttendances.length,
        todayStatus: todayAttendance ? (todayAttendance.checkOutTime ? 'COMPLETED' : 'WORKING') : 'NOT_STARTED',
        lastCheckIn: todayAttendance?.checkInTime
      };
    }
  }

  // Fetch active notice
  const activeNotice = await prisma.notice.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardClient
      data={dashboardData}
      session={session}
      activeNotice={activeNotice ? { id: activeNotice.id, message: activeNotice.message } : null}
    />
  );
}

