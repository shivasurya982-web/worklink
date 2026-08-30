import React from 'react';
import Navbar from './Navbar';
import Sidebar, { MobileBottomNav } from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Page Body */}
      <div className="flex-1 pt-20 sm:pt-24 pb-24 lg:pb-12">
        <div className="container-responsive h-full">
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 items-start h-full">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 w-full lg:max-w-none">
              {/* Page Header */}
              {(title || subtitle) && (
                <div className="mb-6 sm:mb-8 text-center lg:text-left">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-sora font-extrabold text-text-primary tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-text-secondary mt-1.5 max-w-2xl mx-auto lg:mx-0">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              <div className="animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
