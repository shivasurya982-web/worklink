import React, { createContext, useContext, useState, useEffect } from 'react';
import { Download, Info, X, Monitor, Smartphone } from 'lucide-react';

const PWAContext = createContext(null);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstructionModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // Browser does not support direct installation prompt or prompt hasn't fired yet
      setShowInstructionModal(true);
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installApp,
        showInstructionModal,
        setShowInstructionModal,
      }}
    >
      {children}

      {/* Fallback Instruction Modal for Manual Installation */}
      {showInstructionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowInstructionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="font-sora font-bold text-lg text-slate-900 mb-2">
              Install Worklyn App
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium mb-5">
              Install Worklyn as an app on your computer or mobile device for faster access and a full-screen app experience.
            </p>

            <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
              <div className="flex items-start gap-3">
                <Monitor className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">Chrome / Edge / Desktop:</strong>
                  Look for the <strong>Install</strong> icon in your browser's address bar or click <strong>Menu (⋮) &gt; Install Worklyn</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">Mobile (Android / Safari):</strong>
                  Tap <strong>Share / Menu (⋮)</strong> and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructionModal(false)}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
