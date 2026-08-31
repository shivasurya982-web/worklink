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
    categorySectionTitle: 'Popular Service Categories',
    categorySectionSubtitle: 'Browse top rated local experts by specialization',
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

      if (settingsRes.success && settingsRes.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data }));
      }
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data.slice(0, 12)); // Show top 12
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-20 flex justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="section-py">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <span className="text-xs font-semibold text-accent-gold uppercase tracking-widest font-outfit">
              Browse Services
            </span>
            <h2 className="text-section-title font-sora font-bold text-text-primary mt-1">
              {settings.categorySectionTitle}
            </h2>
            <p className="text-sm text-text-secondary mt-1.5 max-w-md">
              {settings.categorySectionSubtitle}
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-gold hover:underline shrink-0"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Grid: 2 col mobile → 3 col tablet → 4 col desktop ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Wrench;
            // Generate a random-looking but stable color based on name if not provided
            const colors = [
              { color: 'from-yellow-400/20 to-amber-300/10', accent: 'text-amber-500' },
              { color: 'from-blue-400/20 to-cyan-300/10',   accent: 'text-blue-500' },
              { color: 'from-orange-400/20 to-red-300/10',  accent: 'text-orange-500' },
              { color: 'from-pink-400/20 to-rose-300/10',   accent: 'text-pink-500' },
              { color: 'from-cyan-400/20 to-blue-300/10',  accent: 'text-cyan-500' },
              { color: 'from-green-400/20 to-emerald-300/10', accent: 'text-green-500' },
            ];
            const colorIdx = cat.name.length % colors.length;
            const theme = colors[colorIdx];

            return (
              <Link
                key={cat._id}
                to={`/search?category=${cat.slug || cat._id}`}
                className="group block"
              >
                <div className="glass-card h-full p-4 sm:p-5 rounded-2xl border border-gray-100 flex flex-col">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${theme.color} ${theme.accent} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Text */}
                  <h3 className="font-sora font-semibold text-sm sm:text-base text-text-primary mb-1 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-muted mb-3 leading-snug flex-1 line-clamp-2">
                    {cat.description || 'Explore top rated professionals.'}
                  </p>

                  {/* Badge */}
                  <span className="text-[10px] sm:text-[11px] font-semibold text-accent-gold bg-amber-50 px-2 sm:px-2.5 py-1 rounded-full w-fit border border-accent-gold/20">
                    Verified Experts
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
