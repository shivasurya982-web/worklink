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
    <footer className="bg-slate-900 text-white border-t border-slate-800 mt-20 sm:mt-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8 relative z-10">

        {/* Main Grid */}
        <div className="mb-12">
          {/* Brand */}
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <span className="font-sora font-bold text-2xl text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                Worklyn
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed font-medium">
              Worklyn connects you with trusted local service professionals for all your home, office, and maintenance needs.
            </p>
            <div className="flex flex-wrap gap-6 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Professionals
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Smart Local Matching
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <p>© {year} {cmsSettings.footerCopyrightText || 'Worklyn. All rights reserved.'}</p>
          <div className="flex items-center gap-2">
             <span>Made with</span>
             <Heart className="w-4 h-4 text-red-500 fill-red-500" />
             <span>by Worklyn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
