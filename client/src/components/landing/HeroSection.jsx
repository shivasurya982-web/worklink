import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import PremiumButton from '../common/PremiumButton';
import { getImageUrl } from '../../utils/imageUtils';

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
    <section className="relative pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-24 lg:pb-28 overflow-hidden min-h-screen flex items-center">
      {/* Background Ocean Blue Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#DBEAFE] rounded-full blur-[100px] opacity-80" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#BFDBFE] rounded-full blur-[120px] opacity-70" />
         <div className="absolute top-[30%] left-[20%] w-[25%] h-[25%] bg-blue-100 rounded-full blur-[80px] opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {settings.heroBannerImage && (
          <div className="mb-12 max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-lg border border-white/60 group relative">
            <img
              src={getImageUrl(settings.heroBannerImage)}
              alt="Hero Banner"
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-full max-h-[480px] object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F3F4F6]/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 text-[10px] font-black text-accent-main mb-10 shadow-sm animate-fade-in uppercase tracking-[0.3em]">
            <Sparkles className="w-4 h-4 text-accent-main animate-pulse" />
            <span>{settings.announcementText}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sora font-black text-text-primary tracking-tight mb-8 animate-premium-up leading-none">
            {settings.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 3 === 2 ? 'text-accent-main block sm:inline italic' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-lg lg:text-xl text-text-secondary leading-relaxed font-jakarta max-w-3xl mx-auto mb-12 animate-premium-up [animation-delay:200ms] font-medium tracking-wide">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-premium-up [animation-delay:400ms]">
              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => navigate('/register/worker')}
                className="w-full sm:w-auto px-14 group shadow-md"
              >
                Become a Partner
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
              </PremiumButton>

              <div className="text-left hidden sm:block">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5">PRO NETWORK</p>
                 <p className="text-xs font-bold text-accent-main">Join 500+ Experts</p>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
