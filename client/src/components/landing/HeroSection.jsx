import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import API from '../../services/api';

const HeroSection = () => {
  const [settings, setSettings] = useState({
    announcementText: 'Verified Local Service Marketplace',
    heroTitle: 'Find & Book Trusted Local Experts In Seconds',
    heroSubtitle:
      'WorkLink connects you with verified electricians, plumbers, carpenters, mechanics, and technicians nearby — powered by intelligent matching.',
    heroBannerImage: '',
  });
  const [realStats, setRealStats] = useState({
    totalCustomers: 0,
    totalWorkers: 0,
    totalCategories: 0,
    averageRating: 4.8
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        API.get('/site/settings'),
        API.get('/search/stats')
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data }));
      }
      if (statsRes.success) {
        setRealStats(statsRes.data);
      }
    } catch {
      // Keep default copy
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for live updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statsItems = [
    { label: 'Happy Customers', num: `${realStats.totalCustomers}+` },
    { label: 'Verified Workers', num: `${realStats.totalWorkers}+` },
    { label: 'Service Categories', num: `${realStats.totalCategories}+` },
    { label: 'Average Rating', num: `${realStats.averageRating}★` },
  ];

  return (
    <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-16 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-32 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Banner Graphic if set in admin CMS */}
        {settings.heroBannerImage && (
          <div className="mb-8 max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-accent-gold/20">
            <img src={settings.heroBannerImage} alt="Hero Banner" className="w-full max-h-64 object-cover" />
          </div>
        )}

        {/* Header Copy */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">

          {/* Big Brand Name */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-sora font-extrabold mb-6 tracking-tighter">
            <span className="bg-gradient-to-r from-text-primary via-accent-gold to-text-primary bg-[length:200%_auto] animate-title-shimmer bg-clip-text text-transparent">
              WorkLink
            </span>
          </h2>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full glass-panel border border-accent-gold/30 text-xs font-semibold text-text-primary mb-8 shadow-sm animate-float">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>{settings.announcementText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-hero font-sora font-extrabold text-text-primary tracking-tight mb-5">
            {settings.heroTitle}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed font-jakarta max-w-xl mx-auto">
            {settings.heroSubtitle}
          </p>
        </div>

        {/* Dynamic Stats Strip */}
        <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-6 sm:gap-10 text-center animate-fade-in">
          {statsItems.map((s) => (
            <div key={s.label}>
              <div className="text-xl sm:text-2xl font-sora font-extrabold text-accent-gold">
                {loadingStats && realStats.totalCustomers === 0 ? '...' : s.num}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
