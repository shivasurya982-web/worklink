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
    { label: 'Network Users', value: `${stats.totalCustomers}+`, icon: Users, color: 'text-accent-bright' },
    { label: 'Active Modules', value: `${stats.totalWorkers}+`, icon: ShieldCheck, color: 'text-accent-bright' },
    { label: 'Domain Sectors', value: `${stats.totalCategories}+`, icon: LayoutGrid, color: 'text-accent-bright' },
    { label: 'Reliability', value: `${stats.averageRating}★`, icon: Zap, color: 'text-accent-bright' },
  ];

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-background-dark/30">
      <div className="container-responsive relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
          {statItems.map((item, i) => (
            <GlassCard key={i} className="p-8 sm:p-10 text-center flex flex-col items-center space-y-6 border border-border-primary/20 !bg-background-cardSecondary shadow-2xl group hover:-translate-y-2 transition-all">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-background-dark ${item.color} border border-white/5 flex items-center justify-center shadow-xl group-hover:bg-accent-orange group-hover:text-white transition-all`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-sora font-black text-white tracking-tighter">
                   {loading && stats.totalCustomers === 0 ? '...' : item.value}
                </div>
                <div className="text-[9px] sm:text-[10px] font-black text-accent-light uppercase tracking-[0.3em] mt-2 opacity-70">{item.label}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
