import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Zap, LayoutGrid } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWorkers: 0,
    totalCategories: 0,
    averageRating: 4.8
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await API.get('/search/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll for live updates every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Happy Customers', value: `${stats.totalCustomers}+`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Verified Workers', value: `${stats.totalWorkers}+`, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Service Categories', value: `${stats.totalCategories}+`, icon: LayoutGrid, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Average Rating', value: `${stats.averageRating}★`, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <section className="py-20 relative">
      <div className="container-responsive">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((item, i) => (
            <GlassCard key={i} className="p-8 text-center flex flex-col items-center space-y-4 border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in group">
              <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl font-sora font-extrabold text-text-primary tracking-tight">
                   {loading && stats.totalCustomers === 0 ? '...' : item.value}
                </div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{item.label}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
