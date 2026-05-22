"use client";

import Link from 'next/link';
import { Plus, Search, User, Trash2, Phone, Calendar, Briefcase, CreditCard, Eye, ChevronDown, Users } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';

/* ── Confirm Delete Modal ── */
function ConfirmDeleteModal({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '36px', width: '100%', maxWidth: '390px', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.22)', border: '1px solid #FEE2E2' }}>
        <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)', color: '#DC2626', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: '0 0 10px' }}>تأكيد الحذف</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, lineHeight: 1.7, margin: '0 0 28px' }}>
          هل أنت متأكد من حذف <strong style={{ color: '#1e293b' }}>{name}</strong>؟<br />
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا يمكن التراجع عن هذا الإجراء.</span>
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: '16px', border: '1.5px solid #E2E8F0', background: 'white', fontWeight: 800, color: '#64748b', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem' }}>إلغاء</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', opacity: loading ? 0.6 : 1 }}>
            {loading ? <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <><Trash2 size={14} /> حذف</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>,
    document.body
  );
}

/* ── Category colors ── */
const CATEGORY_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', accent: '#2563eb' },
  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', accent: '#16a34a' },
  { bg: '#fdf4ff', border: '#e9d5ff', text: '#7c3aed', accent: '#8b5cf6' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', accent: '#ea580c' },
  { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', accent: '#dc2626' },
  { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e', accent: '#14b8a6' },
];

export default function EmployeeListClient({ employees, query }: { employees: any[]; query: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('all');

  async function handleDelete(profileId: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/${profileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { setConfirmTarget(null); router.refresh(); }
      else alert(data.error || 'فشل الحذف');
    } catch { alert('خطأ في الاتصال'); }
    finally { setDeleting(false); }
  }

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  // Group employees by jobTitle
  const grouped: Record<string, any[]> = {};
  employees.forEach(emp => {
    const key = emp.jobTitle?.trim() || 'بدون تصنيف';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(emp);
  });

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === 'بدون تصنيف') return 1;
    if (b === 'بدون تصنيف') return -1;
    return grouped[b].length - grouped[a].length;
  });

  const displayedEmployees = activeTab === 'all' ? employees : (grouped[activeTab] || []);
  const displayedGrouped = activeTab === 'all' ? grouped : { [activeTab]: grouped[activeTab] || [] };
  const displayedCategories = activeTab === 'all' ? categories : (grouped[activeTab] ? [activeTab] : []);

  return (
    <div className="emp-list-page">

      {/* ── Header ── */}
      <div className="elp-header">
        <div className="elp-title-block">
          <div className="elp-title-icon"><User size={22} /></div>
          <div>
            <h1 className="elp-title">الموظفون</h1>
            <p className="elp-sub">{employees.length} موظف · {categories.filter(c => c !== 'بدون تصنيف').length} تصنيف</p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/dashboard/employees/new" className="elp-add-btn">
            <Plus size={18} />إضافة موظف
          </Link>
        )}
      </div>

      {/* ── Search ── */}
      <form className="elp-search-bar">
        <Search size={16} className="elp-search-icon" />
        <input type="text" name="q" placeholder="ابحث بالاسم أو المنصب أو الرقم القومي..." defaultValue={query} className="elp-search-input" autoComplete="off" />
        <button type="submit" className="elp-search-btn">بحث</button>
      </form>

      {/* ── Category Tabs ── */}
      {employees.length > 0 && (
        <div className="cat-tabs-wrap">
          <button className={`cat-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <Users size={14} />
            <span>الكل</span>
            <span className="cat-tab-count">{employees.length}</span>
          </button>
          {categories.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <button
                key={cat}
                className={`cat-tab ${activeTab === cat ? 'active' : ''}`}
                style={activeTab === cat ? { background: color.bg, borderColor: color.border, color: color.text } : {}}
                onClick={() => setActiveTab(cat)}
              >
                <Briefcase size={14} />
                <span>{cat}</span>
                <span className="cat-tab-count" style={activeTab === cat ? { background: color.accent, color: 'white' } : {}}>
                  {grouped[cat].length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      {employees.length === 0 ? (
        <div className="elp-empty">
          <User size={52} strokeWidth={1} />
          <p>لا يوجد موظفون{query ? ` مطابقون لـ "${query}"` : ''}</p>
        </div>
      ) : (
        <div className="groups-wrap">
          {displayedCategories.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const isCollapsed = collapsedGroups.has(cat);
            const group = displayedGrouped[cat] || [];

            return (
              <div key={cat} className="group-section">
                {/* Group header */}
                <button
                  className="group-header"
                  style={{ borderColor: color.border, background: color.bg }}
                  onClick={() => toggleGroup(cat)}
                >
                  <div className="group-header-right">
                    <div className="group-dot" style={{ background: color.accent }} />
                    <span className="group-title" style={{ color: color.text }}>{cat}</span>
                    <span className="group-badge" style={{ background: color.accent }}>{group.length} موظف</span>
                  </div>
                  <ChevronDown size={18} style={{ color: color.text, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: '0.25s', flexShrink: 0 }} />
                </button>

                {/* Cards grid */}
                {!isCollapsed && (
                  <div className="elp-grid">
                    {group.map(emp => (
                      <div key={emp.id} className="emp-card">
                        <div className="emp-card-band" style={{ background: `linear-gradient(90deg, ${color.accent}, ${color.border})` }} />
                        <div className="emp-card-top">
                          <div className="emp-card-avatar" style={{ background: `linear-gradient(135deg, ${color.accent}, ${color.border})` }}>
                            {emp.profilePhoto
                              ? <img src={emp.profilePhoto} alt={emp.fullName} />
                              : <span>{emp.fullName.charAt(0)}</span>}
                          </div>
                          <div className="emp-card-name-block">
                            <p className="emp-card-name">{emp.fullName}</p>
                            <p className="emp-card-username">@{emp.user.username}</p>
                            <span className="emp-active-badge">
                              <span className="emp-active-dot" />نشط
                            </span>
                          </div>
                        </div>
                        <div className="emp-card-info">
                          <div className="emp-info-divider" />
                          <div className="emp-info-row">
                            <span className="emp-info-icon-wrap" style={{ background: color.bg, borderColor: color.border, color: color.accent }}><Briefcase size={13} /></span>
                            <span>{emp.jobTitle || '—'}</span>
                          </div>
                          <div className="emp-info-row">
                            <span className="emp-info-icon-wrap" style={{ background: color.bg, borderColor: color.border, color: color.accent }}><Phone size={13} /></span>
                            <span dir="ltr">{emp.phoneNumber || '—'}</span>
                          </div>
                          <div className="emp-info-row">
                            <span className="emp-info-icon-wrap" style={{ background: color.bg, borderColor: color.border, color: color.accent }}><CreditCard size={13} /></span>
                            <span>{emp.nationalId || '—'}</span>
                          </div>
                          <div className="emp-info-row">
                            <span className="emp-info-icon-wrap" style={{ background: color.bg, borderColor: color.border, color: color.accent }}><Calendar size={13} /></span>
                            <span>{emp.dateOfHiring ? new Date(emp.dateOfHiring).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                          </div>
                        </div>
                        <div className="emp-card-actions">
                          <Link href={`/dashboard/employees/${emp.id}`} className="emp-view-btn">
                            <Eye size={14} />عرض الملف
                          </Link>
                          {isAdmin && (
                            <button className="emp-delete-btn" onClick={() => setConfirmTarget({ id: emp.id, name: emp.fullName })} title="حذف الموظف">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmTarget && (
        <ConfirmDeleteModal
          name={confirmTarget.name}
          loading={deleting}
          onConfirm={() => handleDelete(confirmTarget.id)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}


      <style jsx>{`
        .emp-list-page { animation: fadeUp 0.4s ease-out; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        /* Header */
        .elp-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:28px; }
        .elp-title-block { display:flex; align-items:center; gap:16px; }
        .elp-title-icon { width:54px; height:54px; border-radius:18px; flex-shrink:0; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(37,99,235,.3); }
        .elp-title { font-size:1.65rem; font-weight:900; color:#1E293B; margin:0; }
        .elp-sub { font-size:0.8rem; color:#94A3B8; font-weight:600; margin:2px 0 0; }
        .elp-add-btn { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:white; padding:12px 22px; border-radius:16px; font-size:0.9rem; font-weight:800; text-decoration:none; box-shadow:0 4px 16px rgba(37,99,235,.3); transition:0.2s; }
        .elp-add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(37,99,235,.4); }

        /* Search */
        .elp-search-bar { display:flex; align-items:center; gap:10px; background:white; border:1.5px solid #E8EFFF; border-radius:50px; padding:10px 18px; margin-bottom:20px; box-shadow:0 4px 20px rgba(37,99,235,.06); transition:.2s; }
        .elp-search-bar:focus-within { border-color:#2563EB; box-shadow:0 4px 20px rgba(37,99,235,.14),0 0 0 3px rgba(37,99,235,.08); }
        .elp-search-icon { color:#94A3B8; flex-shrink:0; }
        .elp-search-input { flex:1; border:none; background:transparent; outline:none; font-size:0.92rem; font-weight:600; color:#1E293B; font-family:'Cairo',sans-serif; }
        .elp-search-input::placeholder { color:#CBD5E1; }
        .elp-search-btn { background:linear-gradient(135deg,#2563EB,#1D4ED8); color:white; border:none; border-radius:50px; padding:8px 20px; font-size:0.84rem; font-weight:800; cursor:pointer; transition:0.2s; font-family:'Cairo',sans-serif; }
        .elp-search-btn:hover { transform:scale(1.03); }

        /* Category Tabs */
        .cat-tabs-wrap { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:24px; padding:12px 16px; background:white; border-radius:18px; border:1.5px solid #e8efff; box-shadow:0 2px 12px rgba(37,99,235,.06); }
        .cat-tab { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; color:#64748b; font-size:0.8rem; font-weight:800; cursor:pointer; transition:.2s; font-family:'Cairo',sans-serif; }
        .cat-tab:hover { border-color:#bfdbfe; background:#eff6ff; color:#2563eb; }
        .cat-tab.active { border-color:#bfdbfe; background:#eff6ff; color:#1d4ed8; }
        .cat-tab-count { background:#e2e8f0; color:#64748b; padding:2px 7px; border-radius:8px; font-size:0.68rem; font-weight:900; }

        /* Groups */
        .groups-wrap { display:flex; flex-direction:column; gap:24px; }
        .group-section { display:flex; flex-direction:column; gap:16px; }
        .group-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-radius:16px; border:1.5px solid; cursor:pointer; width:100%; transition:.2s; }
        .group-header:hover { filter:brightness(0.97); }
        .group-header-right { display:flex; align-items:center; gap:12px; }
        .group-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .group-title { font-size:1rem; font-weight:900; font-family:'Cairo',sans-serif; }
        .group-badge { padding:4px 12px; border-radius:8px; color:white; font-size:0.72rem; font-weight:900; font-family:'Cairo',sans-serif; }

        /* Grid */
        .elp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(288px,1fr)); gap:18px; }

        /* Card */
        .emp-card { background:white; border-radius:24px; border:1px solid #E8EFFF; overflow:hidden; transition:.2s; box-shadow:0 4px 24px rgba(37,99,235,.07); display:flex; flex-direction:column; }
        .emp-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(37,99,235,.14); border-color:#BFDBFE; }
        .emp-card-band { height:5px; }
        .emp-card-top { display:flex; align-items:center; gap:16px; padding:20px 20px 12px; }
        .emp-card-avatar { width:56px; height:56px; border-radius:50%; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:900; color:white; box-shadow:0 0 0 3px rgba(255,255,255,.9),0 0 0 5px rgba(37,99,235,.2),0 6px 20px rgba(37,99,235,.25); }
        .emp-card-avatar img { width:100%; height:100%; object-fit:cover; }
        .emp-card-name-block { flex:1; min-width:0; }
        .emp-card-name { font-size:0.98rem; font-weight:900; color:#1E293B; margin:0 0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .emp-card-username { font-size:0.7rem; color:#94A3B8; font-weight:700; font-family:monospace; margin:0 0 5px; }
        .emp-active-badge { display:inline-flex; align-items:center; gap:5px; font-size:0.68rem; font-weight:800; color:#065F46; background:linear-gradient(135deg,#D1FAE5,#6EE7B7); padding:3px 10px; border-radius:50px; border:1px solid rgba(16,185,129,.3); }
        .emp-active-dot { width:6px; height:6px; border-radius:50%; background:#10B981; flex-shrink:0; }
        .emp-card-info { padding:6px 20px 16px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .emp-info-divider { height:1px; background:linear-gradient(90deg,transparent,#E8EFFF 30%,#E8EFFF 70%,transparent); margin-bottom:2px; }
        .emp-info-row { display:flex; align-items:center; gap:10px; font-size:0.8rem; font-weight:600; color:#475569; font-family:'Cairo',sans-serif; }
        .emp-info-row span:last-child { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .emp-info-icon-wrap { width:28px; height:28px; border-radius:9px; flex-shrink:0; border:1px solid; display:flex; align-items:center; justify-content:center; }
        .emp-card-actions { display:flex; align-items:center; gap:10px; padding:12px 16px; border-top:1px solid #EEF4FF; background:linear-gradient(135deg,#FAFBFF,#F0F5FF); }
        .emp-view-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:white; text-decoration:none; border-radius:14px; padding:10px; font-size:0.84rem; font-weight:800; transition:0.2s; font-family:'Cairo',sans-serif; box-shadow:0 3px 12px rgba(37,99,235,.25); }
        .emp-view-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.4); }
        .emp-delete-btn { width:38px; height:38px; border-radius:12px; border:none; flex-shrink:0; background:#FEF2F2; color:#DC2626; cursor:pointer; transition:0.2s; display:flex; align-items:center; justify-content:center; }
        .emp-delete-btn:hover { background:#FEE2E2; transform:scale(1.08); }

        /* Empty */
        .elp-empty { text-align:center; padding:90px 20px; color:#CBD5E1; display:flex; flex-direction:column; align-items:center; gap:14px; font-size:0.95rem; font-weight:700; }
      `}</style>
    </div>
  );
}
