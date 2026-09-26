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
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="container-responsive relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-[11px] font-black text-accent-main uppercase tracking-[0.3em] mb-4 block">Features</span>
          <h2 className="text-3xl sm:text-5xl font-sora font-black text-text-primary tracking-tight mb-4 uppercase">
             {settings.aiSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold uppercase tracking-widest">
            {settings.aiSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
           {settings.aiFeaturesList.map((feature, i) => {
             const Icon = icons[i % icons.length];
             return (
               <GlassCard key={i} className="p-8 sm:p-10 border border-white/60 !bg-white/70 hover:!bg-white hover:border-accent-main/40 transition-all duration-300 group hover:-translate-y-1 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-accent-main flex items-center justify-center mb-6 group-hover:bg-accent-main group-hover:text-white transition-all duration-300 shadow-sm border border-blue-100">
                     <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-sora font-black text-lg text-text-primary mb-3 tracking-tight group-hover:text-accent-main transition-colors uppercase">{feature.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
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
