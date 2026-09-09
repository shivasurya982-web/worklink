import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import API from '../../services/api';

const Footer = () => {
  const year = new Date().getFullYear();

  const [cmsSettings, setCmsSettings] = useState({
    footerCopyrightText: 'WorkLink. All rights reserved.',
  });

  useEffect(() => {
    API.get('/site/settings')
      .then((res) => {
        if (res.success && res.data) {
          setCmsSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-background-dark border-t border-border-primary/20 mt-20 sm:mt-32 shadow-[0_-30px_80px_rgba(0,0,0,0.7)] relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-accent-orange/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8 sm:pb-12 relative z-10">

        {/* Main Grid */}
        <div className="mb-16 sm:mb-20">
          {/* Brand */}
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <span className="font-sora font-black text-3xl text-white tracking-tighter group-hover:text-accent-bright transition-colors">
                WorkLink
              </span>
            </Link>
            <p className="text-sm sm:text-lg text-text-secondary mb-10 leading-relaxed font-medium opacity-80">
              WorkLink AI is the next generation local service ecosystem — bridging the gap between world-class professionals and local service needs through real-time intelligence.
            </p>
            <div className="flex flex-wrap gap-8 text-[11px] font-black text-accent-light uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2.5 group">
                <ShieldCheck className="w-6 h-6 text-accent-green flex-shrink-0 group-hover:scale-110 transition-transform" />
                Verified Network
              </span>
              <span className="flex items-center gap-2.5 group">
                <Sparkles className="w-6 h-6 text-accent-bright flex-shrink-0 group-hover:scale-110 transition-transform" />
                Smart AI Matching
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">
          <p>© {year} {cmsSettings.footerCopyrightText || 'WorkLink. All rights reserved.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
             <span className="flex items-center gap-2.5">
              Made with <Heart className="w-5 h-5 text-accent-red fill-accent-red animate-pulse" /> by WorkLink Team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
