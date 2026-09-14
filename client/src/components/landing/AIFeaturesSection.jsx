import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Navigation, ShieldCheck, MessageSquare, BarChart2 } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const AIFeaturesSection = () => {
  const [settings, setSettings] = useState({
    aiSectionTitle: 'Smart Technology for Better Service',
    aiSectionSubtitle: 'Worklyn uses intelligent tools to make hiring fast and reliable.',
    aiFeaturesList: [
      { title: 'Perfect Matching', description: 'Our smart system finds workers based on their location, ratings, experience, and current availability.' },
      { title: 'Easy Search', description: 'Search for what you need using simple words like "fix my AC" or "plumber near me" to get instant results.' },
      { title: 'Location Tracking', description: 'See where workers are on a map, how far they have to travel, and if they cover your neighborhood.' },
      { title: 'Worker ID Checks', description: 'We check every worker\'s ID and certificates before they can start taking jobs on our app.' },
      { title: 'Live Chat', description: 'Send instant messages, see when someone is typing, and get read receipts for better communication.' },
      { title: 'Progress Tracking', description: 'Keep track of your bookings, payments, and history all in one easy-to-use dashboard.' },
    ],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/site/settings');
      if (res.success && res.data) {
        setSettings({
          aiSectionTitle: res.data.aiSectionTitle || 'Smart Technology for Better Service',
          aiSectionSubtitle: res.data.aiSectionSubtitle || 'Worklyn uses intelligent tools to make hiring fast and reliable.',
          aiFeaturesList: res.data.aiFeaturesList?.length > 0 ? res.data.aiFeaturesList : settings.aiFeaturesList,
        });
      }
    } catch {
      // Fallback
    }
  };

  const icons = [Sparkles, FileText, Navigation, ShieldCheck, MessageSquare, BarChart2];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-background-dark/10">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-accent-orange/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="container-responsive relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          <span className="text-[11px] font-black text-accent-bright uppercase tracking-[0.4em] mb-6 block">Features</span>
          <h2 className="text-3xl sm:text-5xl font-sora font-black text-white tracking-tighter mb-6 uppercase">
             {settings.aiSectionTitle}
          </h2>
          <p className="text-sm sm:text-lg text-text-secondary leading-relaxed font-medium opacity-80 uppercase tracking-widest">
            {settings.aiSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
           {settings.aiFeaturesList.map((feature, i) => {
             const Icon = icons[i % icons.length];
             return (
               <GlassCard key={i} className="p-10 sm:p-12 border border-border-primary/20 !bg-background-card/80 hover:!bg-background-card hover:border-accent-orange/50 transition-all duration-500 group hover:-translate-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="w-16 h-16 rounded-[2rem] bg-background-widget text-accent-bright flex items-center justify-center mb-8 group-hover:bg-accent-orange group-hover:text-white transition-all duration-500 shadow-2xl group-hover:shadow-accent-orange/30 border border-white/5">
                     <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-sora font-black text-lg sm:text-xl text-white mb-4 tracking-tight group-hover:text-accent-bright transition-colors uppercase">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-bold uppercase tracking-widest opacity-90">
                    {feature.description}
                  </p>
               </GlassCard>
             );
           })}
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;
