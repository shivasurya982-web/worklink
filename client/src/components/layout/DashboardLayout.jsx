import React from 'react';
import Navbar from './Navbar';
import Sidebar, { MobileBottomNav } from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1 pt-24 sm:pt-28 lg:pt-32 pb-24 lg:pb-12 relative z-10">
        <div className="container-responsive h-full">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start h-full">

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 w-full animate-fade-in">
              {(title || subtitle) && (
                <div className="mb-6 sm:mb-8 text-center lg:text-left">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-sora font-black text-text-primary tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-2xl mx-auto lg:mx-0 font-bold uppercase tracking-wider">
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
