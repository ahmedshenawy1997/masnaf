import EmployeeForm from '@/components/EmployeeForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewEmployeePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role !== 'SUPERADMIN' && role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="new-employee-page">
      <div className="mb-6">
        <Link
          href="/dashboard/employees"
          className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
      </div>
      <div className="max-w-3xl">
        <EmployeeForm />
      </div>
    </div>
  );
}
