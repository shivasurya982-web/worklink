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

  const [bannerError, setBannerError] = useState(false);
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
    <section className="relative pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {settings.heroBannerImage && !bannerError && (
          <div className="mb-6 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-md border border-slate-200 group relative">
            <img
              src={getImageUrl(settings.heroBannerImage)}
              alt="Hero Banner"
              onError={() => setBannerError(true)}
              className="w-full max-h-[360px] object-cover transition-transform duration-700 group-hover:scale-102"
            />
          </div>
        )}

        <div className="text-center max-w-4xl mx-auto">
          {settings.announcementText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 mb-4 shadow-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{settings.announcementText}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-sora font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            {settings.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 3 === 2 ? 'text-orange-600 block sm:inline' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed font-jakarta max-w-2xl mx-auto mb-6 font-medium tracking-wide">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mb-2">
            <PremiumButton
              variant="outline"
              size="md"
              onClick={() => navigate('/login')}
              className="px-6 sm:px-8 shadow-xs font-black text-xs uppercase"
            >
              Login
            </PremiumButton>

            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => navigate('/register/customer')}
              className="px-6 sm:px-8 group shadow-sm font-black text-xs uppercase"
            >
              Register
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </PremiumButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
