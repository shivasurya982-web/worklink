import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutGrid,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PremiumButton from '../common/PremiumButton';
import API from '../../services/api';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead, fetchNotifications } = useNotification();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Admin Panel';
    if (role === 'worker') return 'My Dashboard';
    return 'My Dashboard';
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <>
      {/* Floating Island Navigation Container */}
      <div className="fixed top-3 left-3 right-3 sm:left-6 sm:right-6 z-50 transition-all duration-300 max-w-7xl mx-auto">
        <nav className={`transition-all duration-300 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-2.5 ${
          scrolled
            ? 'bg-white/75 backdrop-blur-2xl border border-white/85 shadow-lg'
            : 'bg-white/60 backdrop-blur-xl border border-white/75 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-4 h-14 sm:h-16">

            <div className="flex-1 lg:flex-none">
              <Link to="/" className="flex items-center gap-2 group">
                 <img
                   src="/logo.png"
                   alt="Worklyn Logo"
                   className="h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                 />
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="p-2.5 rounded-2xl hover:bg-orange-50/80 text-text-secondary relative transition-colors border border-transparent hover:border-orange-100"
                    >
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 glass-card !bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/80 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
                          <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Notifications</h3>
                          <button onClick={markAllAsRead} className="text-[10px] text-accent-main font-black hover:underline uppercase">Mark All Read</button>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div key={n._id} className="p-3 rounded-xl hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-[11px] font-bold text-text-primary line-clamp-2">{n.message}</p>
                                  <button onClick={(e) => handleDeleteNotification(e, n._id)} className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-[9px] text-text-muted mt-2 block font-semibold">{new Date(n.createdAt).toLocaleTimeString()}</span>
                              </div>
                            ))
                          ) : (
                            <p className="py-8 text-center text-[10px] text-text-muted uppercase font-bold">No new messages</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors border border-gray-200/80 shadow-xs"
                    >
                      <img
                        src={getImageUrl(user?.avatar, DEFAULT_AVATAR(user?.name || 'U'))}
                        alt={user?.name || 'User'}
                        onError={(e) => handleImageError(e, DEFAULT_AVATAR(user?.name || 'U'))}
                        className="w-8 h-8 rounded-full object-cover border border-accent-main"
                      />
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 glass-card !bg-white/95 backdrop-blur-2xl rounded-2xl p-2 shadow-xl border border-white/80 z-50">
                        <Link to={getDashboardPath()} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-secondary hover:text-accent-main hover:bg-orange-50/60 rounded-xl transition-all">
                          <LayoutGrid className="w-4 h-4" /> {getDashboardLabel()}
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <PremiumButton variant="outline" size="sm" className="hidden xs:flex">Login</PremiumButton>
                  </Link>
                  <Link to="/register/customer">
                    <PremiumButton variant="black" size="sm">Register</PremiumButton>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-2xl text-text-primary hover:bg-white/60 transition-colors border border-gray-200"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white/95 backdrop-blur-2xl border-l border-white/80 p-6 flex flex-col shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <span className="font-sora font-black text-xl text-text-primary">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-2xl text-text-primary"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 space-y-4">
              <Link to={getDashboardPath()} className="flex items-center gap-3 p-4 bg-orange-50/60 rounded-2xl text-sm font-bold text-text-primary hover:bg-orange-100">
                <LayoutGrid className="w-5 h-5 text-accent-main" /> {getDashboardLabel()}
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-100">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
