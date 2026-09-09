import React from 'react';
import Navbar from './Navbar';
import Sidebar, { MobileBottomNav } from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1 pt-20 sm:pt-24 lg:pt-28 pb-24 lg:pb-12 relative z-10">
        <div className="container-responsive h-full">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start h-full">

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 w-full animate-fade-in">
              {(title || subtitle) && (
                <div className="mb-8 sm:mb-10 text-center lg:text-left">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-sora font-black text-white tracking-tighter drop-shadow-xl">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm lg:text-base text-text-secondary mt-3 max-w-2xl mx-auto lg:mx-0 font-bold opacity-80 uppercase tracking-widest">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              <div className="relative">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
