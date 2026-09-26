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
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="container-responsive relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((item, i) => (
            <div key={i} className="group relative">
              <GlassCard className="h-full text-center flex flex-col items-center justify-center p-6 sm:p-10 border-white/60 !bg-white/70 backdrop-blur-2xl relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-accent-main border border-blue-100 flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:bg-accent-main group-hover:text-white group-hover:scale-105">
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                <div className="space-y-2">
                  <div className="text-2xl sm:text-4xl font-sora font-black text-text-primary tracking-tight">
                     {loading && stats.totalCustomers === 0 ? '...' : item.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-widest group-hover:text-accent-main transition-colors">
                    {item.label}
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent-main group-hover:w-full transition-all duration-500 rounded-full" />
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
