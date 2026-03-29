import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LeavesHeader from './components/LeavesHeader';
import LeavesClient from './components/LeavesClient';

export default async function LeavesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard');
  }

  const allLeaves = await prisma.leaveRequest.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="leaves-management">
      <LeavesHeader />
      <LeavesClient allLeaves={allLeaves} />
    </div>
  );
}
