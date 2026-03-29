import EmployeeForm from '@/components/EmployeeForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewEmployeePage() {
  return (
    <div className="new-employee-page">
      <div className="mb-6">
        <Link href="/dashboard/employees" className="flex items-center gap-1 text-muted hover:text-foreground mb-4 transition-colors">
          <ChevronLeft size={18} />
          <span>Back to Employees</span>
        </Link>
        <h1 className="title">Add New Employee</h1>
        <p className="subtitle">Create a new account and profile for staff member</p>
      </div>

      <div className="max-w-3xl">
        <EmployeeForm />
      </div>


    </div>
  );
}
