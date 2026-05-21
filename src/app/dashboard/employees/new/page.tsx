import EmployeeForm from '@/components/EmployeeForm';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function NewEmployeePage() {
  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/employees" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#64748b', fontWeight: 700, fontSize: '0.85rem',
          textDecoration: 'none', marginBottom: '16px'
        }}>
          <ChevronRight size={18} />
          <span>العودة إلى الموظفين</span>
        </Link>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>
          إضافة موظف جديد
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
          أنشئ حساباً وملفاً شخصياً لموظف جديد
        </p>
      </div>

      <div style={{ maxWidth: '760px' }}>
        <EmployeeForm />
      </div>
    </div>
  );
}
