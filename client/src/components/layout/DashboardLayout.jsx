import React from 'react';
import Navbar from './Navbar';
import Sidebar, { MobileBottomNav } from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-clip">
      <Navbar />

      <div className="flex-1 pt-20 sm:pt-24 pb-20 lg:pb-12 relative z-10">
        <div className="container-responsive h-full">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start h-full">

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 w-full animate-fade-in">
              {(title || subtitle) && (
                <div className="mb-6 text-center lg:text-left">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-sora font-bold text-slate-900 tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl mx-auto lg:mx-0 font-medium uppercase tracking-wider">
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
