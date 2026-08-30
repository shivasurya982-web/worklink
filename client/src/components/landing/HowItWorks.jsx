import React, { useState, useEffect } from 'react';
import { Layers, Search, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const HowItWorks = () => {
  const [settings, setSettings] = useState({
    howItWorksTitle: 'How WorkLink Works',
    howItWorksSubtitle: 'Get your home or office repairs solved in 4 simple steps',
    howItWorksSteps: [
      { step: '01', title: 'Smart Search', description: 'Enter what service you need or your location. Our smart matching system finds nearby verified experts.' },
      { step: '02', title: 'Compare & Book', description: 'View ratings, pricing, distance, and portfolio images. Select date and time that fits your schedule.' },
      { step: '03', title: 'Real-Time Updates', description: 'Track the worker status live on Google Maps, chat in real-time, and get work updates.' },
      { step: '04', title: 'Service Done & Review', description: 'Pay directly after work completion, rate the professional, and leave a verified review.' },
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
          howItWorksTitle: res.data.howItWorksTitle || 'How WorkLink Works',
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
    <section className="py-24 bg-background-secondary/30 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="container-responsive relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
           <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] mb-4 block">The Process</span>
           <h2 className="text-3xl sm:text-4xl font-sora font-extrabold text-text-primary mb-5">{settings.howItWorksTitle}</h2>
           <p className="text-sm text-text-secondary leading-relaxed">{settings.howItWorksSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-gold/5 via-accent-gold/20 to-accent-gold/5 -translate-y-12" />

          {settings.howItWorksSteps.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-6 relative group">
                 <div className="w-16 h-16 rounded-[24px] bg-white text-accent-gold flex items-center justify-center shadow-xl border border-gray-100 group-hover:bg-accent-gold group-hover:text-white transition-all duration-500 z-10">
                    <Icon className="w-7 h-7" />
                    <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent-gold text-white text-[10px] font-extrabold flex items-center justify-center border-4 border-background-primary shadow-lg">
                      {step.step || `0${i+1}`}
                    </span>
                 </div>
                 <div className="space-y-3">
                    <h3 className="font-sora font-bold text-base text-text-primary group-hover:text-accent-gold transition-colors">{step.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed max-w-[200px] mx-auto">
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
