import { prisma } from '@/lib/prisma';
import './employees.css';
import EmployeeListClient from './components/EmployeeListClient';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const employees = await prisma.employeeProfile.findMany({
    where: {
      OR: [
        { fullName: { contains: query } },
        { jobTitle: { contains: query } },
        { nationalId: { contains: query } },
      ],
      user: {
        role: 'EMPLOYEE'
      }
    },
    include: {
      user: true
    },
    orderBy: {
      fullName: 'asc'
    }
  });

  return <EmployeeListClient employees={employees} query={query} />;
}
