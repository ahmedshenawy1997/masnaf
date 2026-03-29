"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  DollarSign, 
  Users, 
  Clock, 
  Plus, 
  Minus, 
  CreditCard, 
  CheckCircle, 
  Save, 
  Calendar, 
  Calculator, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PayrollEmployee {
  id: string;
  fullName: string;
  jobTitle: string;
  username: string;
  hourlyRate: number;
  totalHours: number;
  baseSalary: number;
  existingPayroll: any | null;
  // Local states for editing
  bonus: number;
  deductions: number;
  advance: number;
  status: 'pending' | 'saving' | 'saved';
}

export default function PayrollPage() {
  const { t, isRTL } = useLanguage();
  const { data: session } = useSession();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchPayroll = async () => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await fetch(`/api/payroll/calculate?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.map((emp: any) => ({
          ...emp,
          bonus: emp.existingPayroll?.bonus || 0,
          deductions: emp.existingPayroll?.deductions || 0,
          advance: emp.existingPayroll?.advance || 0,
          status: emp.existingPayroll ? 'saved' : 'pending'
        })));
      } else {
        const errData = await res.json();
        setGlobalError(errData.error || 'Failed to fetch payroll data');
      }
    } catch (error) {
      setGlobalError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const handleUpdate = (id: string, field: 'bonus' | 'deductions' | 'advance', value: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, [field]: value, status: 'pending' };
      }
      return emp;
    }));
  };

  const handleSave = async (emp: PayrollEmployee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'saving' } : e));
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          month,
          year,
          totalHours: emp.totalHours,
          hourlyRate: emp.hourlyRate,
          bonus: emp.bonus,
          deductions: emp.deductions,
          advance: emp.advance,
          notes: `Payroll for ${month}/${year}`
        }),
      });

      if (res.ok) {
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'saved' } : e));
      } else {
        alert('Failed to save record');
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'pending' } : e));
      }
    } catch (err) {
      console.error(err);
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'pending' } : e));
    }
  };

  const totalCost = employees.reduce((sum, emp) => sum + (emp.baseSalary + emp.bonus - emp.deductions - emp.advance), 0);

  return (
    <div className="payroll-mgmt p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Calculator size={28} />
             </div>
             {t('payroll_management')}
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs ml-15">{t('financial_overview')}</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-300" />
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="select-premium"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
           </div>
           <div className="w-[1px] h-6 bg-slate-100 mx-2" />
           <select 
             value={year} 
             onChange={(e) => setYear(parseInt(e.target.value))}
             className="select-premium"
           >
             {years.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
        </div>
      </header>

      {globalError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-6 flex items-center gap-3 font-bold">
           <AlertCircle size={20} />
           {globalError}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-r-4 border-r-transparent"></div>
           <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-sm">{t('loading')}...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
             <div className="card-stat bg-primary text-white shadow-xl shadow-primary/20">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="text-xs uppercase font-black opacity-60 tracking-widest">{t('total_earned')}</span>
                      <h2 className="text-3xl font-black mt-1">${totalCost.toLocaleString()}</h2>
                   </div>
                   <Wallet size={32} className="opacity-40" />
                </div>
             </div>
             <div className="card-stat bg-white border border-slate-100">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className="text-xs uppercase font-black text-slate-400 tracking-widest">{t('employees')}</span>
                       <h2 className="text-3xl font-black mt-1 text-slate-700">{employees.length}</h2>
                    </div>
                    <Users size={32} className="text-slate-100" />
                 </div>
              </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="th-payroll text-start w-[20%]">{t('employee')}</th>
                         <th className="th-payroll text-start">{t('job_title')}</th>
                         <th className="th-payroll text-center">{t('hours_this_month')}</th>
                         <th className="th-payroll text-center">{t('base_salary')}</th>
                         <th className="th-payroll text-center text-green-600 bg-green-50/20">{t('bonuses')}</th>
                         <th className="th-payroll text-center text-red-600 bg-red-50/20">{t('deductions')}</th>
                         <th className="th-payroll text-center text-orange-600 bg-orange-50/20">{t('advances')}</th>
                         <th className="th-payroll text-center font-black text-slate-800">{t('net_salary')}</th>
                         <th className="th-payroll text-center">{t('status')}</th>
                      </tr>
                   </thead>
                   <tbody>
                      {employees.map(emp => {
                        const net = (emp.baseSalary + emp.bonus - emp.deductions - emp.advance);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="td-payroll">
                               <div className="flex items-center min-w-0">
                                  <p className="font-black text-slate-800 text-lg whitespace-nowrap">{emp.fullName}</p>
                               </div>
                            </td>
                            <td className="td-payroll">
                               <span className="text-base text-slate-500 font-bold opacity-90 uppercase tracking-wide whitespace-nowrap">
                                  {emp.jobTitle}
                               </span>
                            </td>
                            <td className="td-payroll text-center">
                               <span className="inline-block font-extrabold text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                  {emp.totalHours.toFixed(1)} {t('hours_unit')}
                               </span>
                            </td>
                            <td className="td-payroll text-center">
                               <span className="font-black text-slate-800 text-xl tracking-tight">
                                  ${emp.baseSalary.toFixed(2)}
                               </span>
                            </td>
                            <td className="td-payroll text-center bg-green-50/20">
                               <div className="flex flex-col items-center gap-2">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-green-100 w-full max-w-[120px]">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <input 
                                      type="number" 
                                      value={emp.bonus} 
                                      onChange={(e) => handleUpdate(emp.id, 'bonus', parseFloat(e.target.value) || 0)}
                                      className="input-cell text-green-700 text-end w-full"
                                    />
                                  </div>
                               </div>
                            </td>
                            <td className="td-payroll text-center bg-red-50/20">
                               <div className="flex flex-col items-center gap-2">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-red-100 w-full max-w-[120px]">
                                    <TrendingDown size={14} className="text-red-500" />
                                    <input 
                                      type="number" 
                                      value={emp.deductions} 
                                      onChange={(e) => handleUpdate(emp.id, 'deductions', parseFloat(e.target.value) || 0)}
                                      className="input-cell text-red-700 text-end w-full" 
                                    />
                                  </div>
                               </div>
                            </td>
                            <td className="td-payroll text-center bg-orange-50/20">
                               <div className="flex flex-col items-center gap-2">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-orange-100 w-full max-w-[120px]">
                                    <CreditCard size={14} className="text-orange-500" />
                                    <input 
                                      type="number" 
                                      value={emp.advance} 
                                      onChange={(e) => handleUpdate(emp.id, 'advance', parseFloat(e.target.value) || 0)}
                                      className="input-cell text-orange-700 text-end w-full" 
                                    />
                                  </div>
                               </div>
                            </td>
                            <td className="td-payroll text-center">
                               <span className="text-xl font-black text-slate-900">${net.toFixed(2)}</span>
                            </td>
                            <td className="td-payroll text-center">
                               {emp.status === 'saved' ? (
                                 <div className="flex items-center justify-center gap-2 text-green-600 py-2 px-5 bg-green-100 rounded-2xl font-black text-xs uppercase tracking-widest mx-auto w-fit shadow-sm">
                                    <CheckCircle size={18} />
                                    <span>{t('status_paid')}</span>
                                 </div>
                               ) : emp.status === 'saving' ? (
                                 <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-primary mx-auto"></div>
                               ) : (
                                 <button 
                                   onClick={() => handleSave(emp)}
                                   className="btn-save-row-v2"
                                 >
                                    <Save size={18} />
                                    <span>{t('finalize_payment')}</span>
                                 </button>
                               )}
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .payroll-mgmt { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .card-stat { padding: 32px; border-radius: 2.5rem; transition: 0.3s; }
        .card-stat:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1); }
        
        .select-premium {
          border: none; background: transparent; font-weight: 950; color: #1e293b; outline: none; cursor: pointer; font-size: 1.1rem;
        }
        
        .th-payroll { padding: 24px; font-size: 0.85rem; font-weight: 950; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; border-bottom: 2px solid #f1f5f9; white-space: nowrap; }
        .td-payroll { padding: 24px; border-bottom: 1px solid #f1f5f9; }
        
        .input-cell {
          width: 100%; padding: 4px; background: transparent;
          font-weight: 900; font-size: 1rem; border: none; outline: none;
        }
        
        .btn-save-row-v2 {
          display: flex; align-items: center; gap: 10px; padding: 14px 22px; border-radius: 18px;
          background: #1e293b; color: white; font-size: 0.8rem; font-weight: 950; text-transform: uppercase;
          letter-spacing: 1px; border: none; cursor: pointer; transition: 0.25s; margin: 0 auto;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .btn-save-row-v2:hover { background: var(--primary); transform: scale(1.05); shadow: 0 8px 20px rgba(var(--primary-rgb), 0.3); }
      `}</style>
    </div>
  );
}

