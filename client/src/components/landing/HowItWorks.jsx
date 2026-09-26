import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
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
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="container-responsive relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
           <span className="text-[11px] font-black text-accent-main uppercase tracking-[0.3em] mb-4 block">Direct & Simple</span>
           <h2 className="text-3xl sm:text-5xl font-sora font-black text-text-primary mb-4 tracking-tight">{settings.howItWorksTitle}</h2>
           <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold uppercase tracking-widest">{settings.howItWorksSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-blue-200 pointer-events-none" />

          {settings.howItWorksSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-6 relative group">
                 <div className="w-20 h-20 rounded-3xl bg-white text-accent-main flex items-center justify-center shadow-md border border-white/60 group-hover:bg-accent-main group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 z-10 relative">
                    <Icon className="w-8 h-8" />
                    <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-accent-main text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-sm">
                      {step.step || `0${i+1}`}
                    </span>
                 </div>
                 <div className="space-y-2">
                    <h3 className="font-sora font-black text-lg text-text-primary group-hover:text-accent-main transition-colors tracking-tight">{step.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-[260px] mx-auto font-medium">
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
