import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import './profile.css';
import AttendanceSection from './components/AttendanceSection';
import ProfileClient from './components/ProfileClient';

export default async function EmployeeProfilePage({
  params: paramsPromise
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await paramsPromise;
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  if (session.user.role === 'EMPLOYEE' && session.user.id !== id) {
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        OR: [
          { id: id },
          { userId: id }
        ]
      },
      select: { userId: true }
    });
    
    if (!profile || profile.userId !== session.user.id) {
      return notFound();
    }
  }

  const profile = await prisma.employeeProfile.findFirst({
    where: {
      OR: [
        { id: id },
        { userId: id }
      ]
    },
    include: {
      user: true,
      attendances: {
        orderBy: { checkInTime: 'desc' },
        take: 10
      },
      leaveRequests: {
        orderBy: { createdAt: 'desc' }
      },
      documents: true,
      penalties: {
        orderBy: { date: 'desc' }
      },
      medicalReports: true
    }
  });

  if (!profile) return notFound();

  const isAdmin = session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN';

  // Serialize dates for client component
  const serializedProfile = JSON.parse(JSON.stringify(profile));

  return (
    <div className="profile-page">
      <div className="profile-header card mb-6">
        <div className="profile-cover"></div>
        <div className="profile-info-bar">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.fullName} />
              ) : (
                profile.fullName.charAt(0)
              )}
            </div>
            <div className="profile-avatar-ring" />
          </div>
          <div className="profile-meta">
            <h1 className="profile-name">{profile.fullName}</h1>
            <p className="profile-role-text">{profile.jobTitle}</p>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="profile-stats-bar">
          <div className="profile-stat">
            <span className="pstat-label">👔 المسمى الوظيفي</span>
            <span className="pstat-value">{profile.jobTitle || '—'}</span>
          </div>
          <div className="pstat-divider" />
          <div className="profile-stat">
            <span className="pstat-label">📅 تاريخ التعيين</span>
            <span className="pstat-value">
              {profile.dateOfHiring ? new Date(profile.dateOfHiring).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="pstat-divider" />
          <div className="profile-stat">
            <span className="pstat-label">💳 سعر الساعة</span>
            <span className="pstat-value">{profile.hourlyRate?.toFixed(0)} ج.م / ساعة</span>
          </div>
          <div className="pstat-divider" />
          <div className="profile-stat">
            <span className="pstat-label">📱 رقم الهاتف</span>
            <span className="pstat-value">{profile.phoneNumber || '—'}</span>
          </div>
        </div>
      </div>

      <ProfileClient
        profile={serializedProfile}
        isAdmin={isAdmin}
        sessionUserId={session.user.id}
      />
    </div>
  );
}

