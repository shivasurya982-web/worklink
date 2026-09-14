import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import PremiumButton from '../common/PremiumButton';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const HeroSection = () => {
  const [settings, setSettings] = useState({
    announcementText: 'Verified Local Service Marketplace',
    heroTitle: 'Find & Book Trusted Local Workers In Seconds',
    heroSubtitle:
      'Worklyn connects you with verified electricians, plumbers, carpenters, mechanics, and technicians nearby — powered by smart local matching.',
    heroBannerImage: '',
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [settingsRes] = await Promise.all([
        API.get('/site/settings')
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data }));
      }
    } catch {
      // Keep defaults
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-accent-bright/10 rounded-full blur-[180px] animate-float opacity-50" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-orange/15 rounded-full blur-[150px] animate-pulse-glow" />
         <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-accent-main/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {settings.heroBannerImage && (
          <div className="mb-12 max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-4 border-white/10">
            <img
              src={getImageUrl(settings.heroBannerImage)}
              alt="Hero Banner"
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-background-dark/80 backdrop-blur-xl border border-accent-main/40 text-[11px] font-black text-accent-bright mb-10 shadow-[0_15px_30px_rgba(0,0,0,0.3)] animate-slide-up uppercase tracking-[0.3em]">
            <Sparkles className="w-4 h-4 text-accent-light" />
            <span>{settings.announcementText}</span>
          </div>

          <h1 className="text-hero font-sora font-black text-white tracking-tighter mb-8 animate-slide-up drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
            {settings.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 3 === 2 ? 'orange-gradient-text block sm:inline' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-base lg:text-xl text-text-secondary leading-relaxed font-jakarta max-w-2xl mx-auto mb-12 animate-slide-up opacity-90 font-medium">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mb-20 animate-slide-up">
            <div className="flex flex-col items-center gap-4">
              <PremiumButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/register/worker')}
                className="w-full sm:w-auto px-12"
              >
                Join as Worker
              </PremiumButton>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-70 max-w-[280px]">
                Are you a local professional? Grow your business by joining our verified expert network today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
