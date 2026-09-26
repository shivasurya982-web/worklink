import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Wrench,
  Car, GraduationCap, Sparkles, Camera, Flower2, Flame,
  Smartphone, Monitor, Bug, ArrowRight, Shield,
} from 'lucide-react';
import API from '../../services/api';

const iconMap = {
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Wrench,
  Car, GraduationCap, Sparkles, Camera, Flower2, Flame,
  Smartphone, Monitor, Bug, Shield,
};

const CategoryGrid = () => {
  const [settings, setSettings] = useState({
    categorySectionTitle: 'Popular Services',
    categorySectionSubtitle: 'Find top-rated local experts by their skill',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, catsRes] = await Promise.all([
        API.get('/site/settings'),
        API.get('/categories')
      ]);
      if (settingsRes.success && settingsRes.data) setSettings(prev => ({ ...prev, ...settingsRes.data }));
      if (catsRes.success && catsRes.data) setCategories(catsRes.data.slice(0, 12));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-20 flex justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="container-responsive relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <span className="text-[10px] font-black text-accent-main uppercase tracking-[0.3em] mb-3 block">Categories</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sora font-black text-text-primary tracking-tight uppercase">{settings.categorySectionTitle}</h2>
            <p className="text-sm sm:text-base text-text-secondary mt-3 font-bold uppercase tracking-widest">{settings.categorySectionSubtitle}</p>
          </div>
          <Link to="/search" className="hidden md:inline-flex items-center gap-2 text-xs font-black text-accent-main hover:text-blue-700 transition-all uppercase tracking-widest">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Wrench;
            return (
              <Link key={cat._id} to={`/search?category=${cat.slug || cat._id}`} className="group block h-full">
                <div className="glass-card h-full p-6 sm:p-8 rounded-[2rem] border border-white/60 !bg-white/70 hover:!bg-white hover:border-accent-main/40 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 border border-blue-100 text-accent-main flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-accent-main group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="font-sora font-bold text-base sm:text-lg text-text-primary mb-2 group-hover:text-accent-main transition-colors uppercase tracking-tight">{cat.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-text-muted mb-5 leading-relaxed font-semibold line-clamp-2 uppercase tracking-wide">{cat.description || 'Verified local workers ready to help.'}</p>
                  <div className="mt-auto px-4 py-1.5 rounded-full border border-blue-200 text-[9px] font-black text-accent-main uppercase tracking-widest group-hover:bg-accent-main group-hover:text-white transition-all">Select</div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 md:hidden flex justify-center">
           <Link to="/search" className="inline-flex items-center gap-2 text-xs font-black text-accent-main uppercase tracking-widest">
              See All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
