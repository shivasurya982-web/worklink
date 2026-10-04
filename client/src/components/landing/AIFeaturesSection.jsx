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
    <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="container-responsive">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 block">Features</span>
          <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 tracking-tight mb-3 uppercase">
             {settings.aiSectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">
            {settings.aiSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {settings.aiFeaturesList.map((feature, i) => {
             const Icon = icons[i % icons.length];
             return (
               <GlassCard key={i} className="p-6 sm:p-8 bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xs">
                     <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-sora font-bold text-base text-slate-900 mb-2 tracking-tight group-hover:text-orange-600 transition-colors uppercase">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
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
