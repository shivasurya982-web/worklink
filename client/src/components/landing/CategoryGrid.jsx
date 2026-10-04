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
         <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="container-responsive">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Categories</span>
            <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 tracking-tight uppercase">{settings.categorySectionTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium uppercase tracking-wider">{settings.categorySectionSubtitle}</p>
          </div>
          <Link to="/search" className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all uppercase tracking-wider">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Wrench;
            return (
              <Link key={cat._id} to={`/search?category=${cat.slug || cat._id}`} className="group block h-full">
                <div className="bg-white h-full p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-200 flex flex-col items-center text-center shadow-xs hover:shadow-md">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="font-sora font-bold text-sm sm:text-base text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium line-clamp-2 uppercase tracking-wide">{cat.description || 'Verified local workers ready to help.'}</p>
                  <div className="mt-auto px-3.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">Select</div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 md:hidden flex justify-center">
           <Link to="/search" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              See All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
