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
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {settings.heroBannerImage && (
          <div className="mb-10 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-md border border-slate-200 group relative">
            <img
              src={getImageUrl(settings.heroBannerImage)}
              alt="Hero Banner"
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-full max-h-[440px] object-cover transition-transform duration-700 group-hover:scale-102"
            />
          </div>
        )}

        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 mb-8 shadow-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>{settings.announcementText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sora font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            {settings.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 3 === 2 ? 'text-orange-600 block sm:inline' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-jakarta max-w-2xl mx-auto mb-10 font-medium tracking-wide">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => navigate('/register/worker')}
                className="w-full sm:w-auto px-8 group shadow-sm"
              >
                Become a Partner
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </PremiumButton>

              <div className="text-left hidden sm:block pl-2 border-l-2 border-slate-200">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PRO NETWORK</p>
                 <p className="text-xs font-bold text-orange-600">Join 500+ Experts</p>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
