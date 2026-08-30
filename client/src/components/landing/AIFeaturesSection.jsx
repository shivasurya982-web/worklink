import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Navigation, ShieldCheck, MessageSquare, BarChart2 } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const AIFeaturesSection = () => {
  const [settings, setSettings] = useState({
    aiSectionTitle: 'Smart Platform Features',
    aiSectionSubtitle: 'WorkLink makes local services easier through practical tools and fast access.',
    aiFeaturesList: [
      { title: 'Smart Matchmaking', description: 'Score-based matching weighing distance, customer rating, experience, job success rate, and instant availability.' },
      { title: 'Easy Search', description: 'Search using plain English phrases like "AC technician under ₹1000" or "Emergency plumber near me".' },
      { title: 'Live Location Tracking', description: 'Interactive map with live worker location pins, travel distance, and service radius coverage.' },
      { title: 'Document Verification', description: 'Admin verification portal ensuring identity proof, license, and skills certificates before worker activation.' },
      { title: 'Live Messaging', description: 'Instant chat messaging, typing indicators, read receipts, and live status updates without refresh.' },
      { title: 'Business Insights', description: 'Interactive analytics dashboard tracking revenue growth, customer conversion, and top service categories.' },
    ],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.success && res.data) {
        setSettings({
          aiSectionTitle: res.data.aiSectionTitle || 'Smart Platform Features',
          aiSectionSubtitle: res.data.aiSectionSubtitle || 'WorkLink makes local services easier through practical tools and fast access.',
          aiFeaturesList: res.data.aiFeaturesList?.length > 0 ? res.data.aiFeaturesList : settings.aiFeaturesList,
        });
      }
    } catch {
      // Fallback
    }
  };

  const icons = [Sparkles, FileText, Navigation, ShieldCheck, MessageSquare, BarChart2];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container-responsive relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] mb-3 block">Cutting Edge Tech</span>
          <h2 className="text-3xl sm:text-4xl font-sora font-extrabold text-text-primary mb-4">
             {settings.aiSectionTitle}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {settings.aiSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
           {settings.aiFeaturesList.map((feature, i) => {
             const Icon = icons[i % icons.length];
             return (
               <GlassCard key={i} className="p-8 border border-gray-100 hover:border-accent-gold/20 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center mb-6 group-hover:bg-accent-gold group-hover:text-white transition-all duration-300 shadow-inner">
                     <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-sora font-bold text-base text-text-primary mb-3">{feature.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
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
