import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Zap, LayoutGrid } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const StatsSection = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, totalWorkers: 0, totalCategories: 0, averageRating: 4.8 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get('/search/stats');
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Verified Experts', value: `${stats.totalWorkers}+`, icon: ShieldCheck },
    { label: 'Happy Customers', value: `${stats.totalCustomers}+`, icon: Users },
    { label: 'Service Types', value: `${stats.totalCategories}+`, icon: LayoutGrid },
    { label: 'Platform Rating', value: `${stats.averageRating}★`, icon: Zap },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="container-responsive">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((item, i) => (
            <div key={i} className="group relative">
              <GlassCard className="h-full text-center flex flex-col items-center justify-center p-6 bg-white border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-sora font-extrabold text-slate-900 tracking-tight">
                     {loading && stats.totalCustomers === 0 ? '...' : item.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
