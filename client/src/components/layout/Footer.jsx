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
    <footer className="bg-background-secondary border-t border-accent-gold/20 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-10">

        {/* Main Grid */}
        <div className="mb-10 sm:mb-12">
          {/* Brand */}
          <div className="max-w-xl">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-sora font-bold text-xl text-text-primary">
                WorkLink
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              WorkLink is a local service marketplace — connecting trusted workers with nearby customers seamlessly.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-green flex-shrink-0" />
                100% Verified Professionals
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-gold flex-shrink-0" />
                Smart Matching
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {year} {cmsSettings.footerCopyrightText || 'WorkLink. All rights reserved.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-accent-red fill-accent-red" /> for local workers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
