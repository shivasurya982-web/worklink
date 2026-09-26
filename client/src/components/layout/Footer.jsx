import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import API from '../../services/api';

const Footer = () => {
  const year = new Date().getFullYear();

  const [cmsSettings, setCmsSettings] = useState({
    footerCopyrightText: 'Worklyn. All rights reserved.',
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
    <footer className="bg-white/50 backdrop-blur-xl border-t border-white/60 mt-20 sm:mt-32 shadow-sm relative overflow-hidden">
      {/* Soft Blue Glow */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-blue-100/40 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12 relative z-10">

        {/* Main Grid */}
        <div className="mb-12 sm:mb-16">
          {/* Brand */}
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <span className="font-sora font-black text-3xl text-text-primary tracking-tight group-hover:text-accent-main transition-colors">
                Worklyn
              </span>
            </Link>
            <p className="text-sm sm:text-base text-text-secondary mb-8 leading-relaxed font-medium">
              Worklyn is a platform that helps you find the best local workers for your home or business needs.
            </p>
            <div className="flex flex-wrap gap-8 text-[11px] font-black text-accent-main uppercase tracking-widest">
              <span className="flex items-center gap-2 group">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                Verified Workers
              </span>
              <span className="flex items-center gap-2 group">
                <Sparkles className="w-5 h-5 text-accent-main flex-shrink-0 group-hover:scale-110 transition-transform" />
                Smart Matching
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-widest">
          <p>© {year} {cmsSettings.footerCopyrightText || 'Worklyn. All rights reserved.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
             <span className="flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by Worklyn
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
