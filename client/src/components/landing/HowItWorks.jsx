import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const HowItWorks = () => {
  const [settings, setSettings] = useState({
    howItWorksTitle: 'How Worklyn Works',
    howItWorksSubtitle: 'Get your home or office repairs solved in 4 simple steps',
    howItWorksSteps: [
      { step: '01', title: 'Smart Search', description: 'Enter what service you need or your location. Our smart matching system finds nearby verified experts.' },
      { step: '02', title: 'Compare & Book', description: 'View ratings, quotes, distance, and portfolio images. Chat directly with experts to discuss your job details.' },
      { step: '03', title: 'Real-Time Updates', description: 'Track the worker status live on Google Maps, chat in real-time, and get work updates.' },
      { step: '04', title: 'Service Done & Review', description: 'Pay directly after work completion, rate the professional, and leave a verified review.' },
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
          howItWorksTitle: res.data.howItWorksTitle || 'How Worklyn Works',
          howItWorksSubtitle: res.data.howItWorksSubtitle || 'Get your home or office repairs solved in 4 simple steps',
          howItWorksSteps: res.data.howItWorksSteps?.length > 0 ? res.data.howItWorksSteps : settings.howItWorksSteps,
        });
      }
    } catch {
      // Fallback
    }
  };

  const icons = [Search, Calendar, MapPin, CheckCircle2];

  return (
    <section className="py-24 sm:py-32 bg-background-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-accent-orange/5 blur-[200px] pointer-events-none" />

      <div className="container-responsive relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-32">
           <span className="text-[11px] font-black text-accent-bright uppercase tracking-[0.4em] mb-6 block">Direct & Simple</span>
           <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sora font-black text-white mb-8 tracking-tighter">{settings.howItWorksTitle}</h2>
           <p className="text-sm sm:text-lg text-text-secondary leading-relaxed font-medium opacity-80">{settings.howItWorksSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-accent-orange/30 to-transparent pointer-events-none" />

          {settings.howItWorksSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-10 relative group">
                 <div className="w-24 h-24 rounded-[2.5rem] bg-background-cardSecondary text-accent-bright flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-border-primary/40 group-hover:bg-accent-orange group-hover:text-white group-hover:-translate-y-3 group-hover:shadow-accent-orange/20 transition-all duration-500 z-10 relative">
                    <Icon className="w-10 h-10" />
                    <span className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-accent-bright text-white text-xs font-black flex items-center justify-center border-4 border-background-dark shadow-2xl">
                      {step.step || `0${i+1}`}
                    </span>
                 </div>
                 <div className="space-y-4">
                    <h3 className="font-sora font-black text-xl text-white group-hover:text-accent-bright transition-colors tracking-tight">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-[260px] mx-auto font-medium opacity-90">
                      {step.description}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
