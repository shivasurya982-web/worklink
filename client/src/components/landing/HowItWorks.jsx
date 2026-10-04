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
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="container-responsive">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
           <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Direct & Simple</span>
           <h2 className="text-2xl sm:text-4xl font-sora font-bold text-slate-900 mb-3 tracking-tight uppercase">{settings.howItWorksTitle}</h2>
           <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">{settings.howItWorksSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[36px] left-[10%] right-[10%] h-[2px] bg-slate-200 pointer-events-none" />

          {settings.howItWorksSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-4 relative group">
                 <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 text-indigo-600 flex items-center justify-center shadow-xs group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 z-10 relative">
                    <Icon className="w-7 h-7" />
                    <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                      {step.step || `0${i+1}`}
                    </span>
                 </div>
                 <div className="space-y-1.5">
                    <h3 className="font-sora font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight uppercase">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[240px] mx-auto font-medium">
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
