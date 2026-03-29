import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportGenerator from './components/ReportGenerator';
import './reports.css';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  const employees = await prisma.employeeProfile.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div className="reports-page pt-4">

      <ReportGenerator employees={employees} />
    </div>
  );
}
